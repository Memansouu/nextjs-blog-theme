// Usage:
//   node render.mjs audio            -> out/soundtrack.wav
//   node render.mjs beats            -> out/beats/beat_XX.png (+ contact sheets)
//   node render.mjs stills t1 t2 ... -> out/stills/t_<t>.png
//   node render.mjs video [workers]  -> out/paloma.mp4 (60fps, 3 subframes/frame via tmix, audio muxed)
import { chromium } from 'playwright';
import { spawn, execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, 'out');
const URL = 'file://' + path.join(HERE, 'index.html');
const FPS = 60, SUB = 3, DUR = 30, FRAMES = FPS * DUR;
fs.mkdirSync(OUT, { recursive: true });

async function openPage(browser) {
  const page = await browser.newPage({ viewport: { width: 1080, height: 1080 }, deviceScaleFactor: 1 });
  await page.goto(URL);
  await page.evaluate(() => window.ready);
  return page;
}
async function shot(page, t) {
  await page.evaluate(tt => window.seek(tt), t);
  return page.screenshot({ type: 'png' });
}
const launch = () => chromium.launch({ args: ['--disable-gpu', '--force-color-profile=srgb', '--disable-lcd-text'] });

async function audio() {
  const browser = await launch(); const page = await openPage(browser);
  const b64 = await page.evaluate(() => window.renderAudio());
  const raw = path.join(OUT, 'soundtrack_raw.wav'), wav = path.join(OUT, 'soundtrack.wav');
  fs.writeFileSync(raw, Buffer.from(b64, 'base64'));
  await browser.close();
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', raw, '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11,aresample=48000', '-c:a', 'pcm_s16le', wav]);
  fs.rmSync(raw);
  console.log('wrote soundtrack.wav');
}

async function stills(times, dir) {
  fs.mkdirSync(dir, { recursive: true });
  const browser = await launch(); const page = await openPage(browser);
  const files = [];
  for (const [name, t] of times) { const f = path.join(dir, name + '.png'); fs.writeFileSync(f, await shot(page, t)); files.push(f); }
  await browser.close();
  return files;
}

async function beats() {
  const dir = path.join(OUT, 'beats');
  fs.rmSync(dir, { recursive: true, force: true });
  const BEAT = 0.6, list = [];
  for (let b = 0; b < 50; b++) list.push([`beat_${String(b).padStart(2, '0')}`, b * BEAT + 0.001]);
  list.push(['beat_50', 29.98]);
  await stills(list, dir);
  // contact sheets: 4 beats (one bar) per row
  for (let s = 0; s < 4; s++) {
    const first = s * 16;
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-start_number', String(first), '-i', path.join(dir, 'beat_%02d.png'),
      '-frames:v', '1', '-vf', `scale=360:360,drawtext=text='%{eif\\:n+${first}\\:d}':x=8:y=8:fontsize=22:fontcolor=red,tile=4x4:padding=4`, path.join(dir, `sheet_${s}.png`)]);
  }
  console.log('beats rendered');
}

async function videoWorker(idx, f0, f1) {
  const browser = await launch(); const page = await openPage(browser);
  const seg = path.join(OUT, `seg_${idx}.mp4`);
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-c:v', 'png', '-framerate', String(FPS * SUB), '-i', '-',
    '-vf', `tmix=frames=${SUB}:weights='1 1 1',select='eq(mod(n\\,${SUB})\\,${SUB - 1})',setpts=N/${FPS}/TB`,
    '-r', String(FPS), '-c:v', 'libx264', '-preset', 'medium', '-crf', '14', '-pix_fmt', 'yuv420p', seg], { stdio: ['pipe', 'inherit', 'inherit'] });
  const done = new Promise((res, rej) => ff.on('close', c => c === 0 ? res() : rej(new Error('ffmpeg ' + c))));
  const t0 = Date.now();
  for (let f = f0; f < f1; f++) {
    for (let k = 0; k < SUB; k++) {
      // trailing shutter: subframes end on the frame's own time
      const t = Math.max(0, (f + (k - (SUB - 1)) / SUB) / FPS);
      const png = await shot(page, t);
      if (!ff.stdin.write(png)) await new Promise(r => ff.stdin.once('drain', r));
    }
    if (idx === 0 && (f - f0) % 60 === 0) console.log(`worker0 ${f - f0}/${f1 - f0} frames, ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
  ff.stdin.end(); await done; await browser.close();
  return seg;
}

async function video(workers = 4) {
  const per = Math.ceil(FRAMES / workers), jobs = [];
  for (let i = 0; i < workers; i++) jobs.push(videoWorker(i, i * per, Math.min(FRAMES, (i + 1) * per)));
  const segs = await Promise.all(jobs);
  const list = path.join(OUT, 'segs.txt');
  fs.writeFileSync(list, segs.map(s => `file '${s}'`).join('\n'));
  const wav = path.join(OUT, 'soundtrack.wav');
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', list, '-i', wav,
    '-c:v', 'copy', '-c:a', 'aac', '-b:a', '256k', '-shortest', '-movflags', '+faststart', path.join(OUT, 'paloma.mp4')]);
  segs.forEach(s => fs.rmSync(s)); fs.rmSync(list);
  console.log('wrote paloma.mp4');
}

const [mode, ...rest] = process.argv.slice(2);
if (mode === 'audio') await audio();
else if (mode === 'beats') await beats();
else if (mode === 'stills') { const fs2 = await stills(rest.map(t => [`t_${t}`, parseFloat(t)]), path.join(OUT, 'stills')); console.log(fs2.join('\n')); }
else if (mode === 'video') await video(parseInt(rest[0] || '4'));
else console.log('mode?');
