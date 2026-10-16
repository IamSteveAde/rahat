"""Generate browser-compatible, fast-start MP4s. Requires ffmpeg and ffprobe."""
from pathlib import Path
import concurrent.futures, json, subprocess
root = Path(__file__).resolve().parents[1]
public = root / 'public'
def encode(source):
    target = public / 'optimized' / source.relative_to(public)
    target.parent.mkdir(parents=True, exist_ok=True)
    if not target.exists() or target.stat().st_mtime < source.stat().st_mtime:
        temporary = target.with_name(target.stem + '.tmp.mp4')
        command = ['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', str(source), '-map', '0:v:0', '-map', '0:a:0?', '-vf', "scale=w='min(720,iw)':h='min(1280,ih)':force_original_aspect_ratio=decrease:force_divisible_by=2,setsar=1", '-c:v', 'libx264', '-preset', 'fast', '-crf', '28', '-threads', '2', '-pix_fmt', 'yuv420p', '-tag:v', 'avc1', '-c:a', 'aac', '-b:a', '64k', '-movflags', '+faststart', str(temporary)]
        subprocess.run(command, check=True)
        # Retry highly compressed originals with a lower target quality.
        if temporary.stat().st_size >= source.stat().st_size:
            command[command.index("-crf") + 1] = "32"
            subprocess.run(command, check=True)
        # Never replace a smaller source with a larger transcode.
        if temporary.stat().st_size >= source.stat().st_size:
            subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', str(source), '-map', '0', '-c', 'copy', '-movflags', '+faststart', str(temporary)], check=True)
        temporary.replace(target)
    return {'source': '/' + str(source.relative_to(public)).replace(' ', '%20'), 'output': '/' + str(target.relative_to(public)).replace(' ', '%20'), 'originalBytes': source.stat().st_size, 'optimizedBytes': target.stat().st_size}
sources = sorted((public / 'images').rglob('*.mp4'))
with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
    results = list(pool.map(encode, sources))
(root / 'lib/video-manifest.json').write_text(json.dumps(results, indent=2) + '\n')
original = sum(r['originalBytes'] for r in results)
optimized = sum(r['optimizedBytes'] for r in results)
print(f'{len(results)} videos: {original/1e6:.2f} MB -> {optimized/1e6:.2f} MB ({(1-optimized/original)*100:.1f}% smaller)')
