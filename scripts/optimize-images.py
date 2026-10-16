"""Generate local responsive WebP assets. Requires cwebp and macOS sips."""
from pathlib import Path
import concurrent.futures, subprocess, json
root = Path(__file__).resolve().parents[1]
public = root / 'public'
sources = sorted(p for p in (public / 'images').rglob('*') if p.suffix.lower() in ['.jpg', '.jpeg', '.png'])
manifest = {}
jobs = []
for source in sources:
    info = subprocess.check_output(['sips', '-g', 'pixelWidth', '-g', 'pixelHeight', str(source)], text=True)
    dimensions = {line.split(':')[0].strip(): int(line.split(':')[1]) for line in info.splitlines() if 'pixelWidth:' in line or 'pixelHeight:' in line}
    width, height = dimensions['pixelWidth'], dimensions['pixelHeight']
    widths = sorted(set(min(width, target) for target in [320, 640, 1280, 1920]))
    relative = source.relative_to(public)
    entries = []
    for size in widths:
        target = public / 'optimized' / relative.parent / f'{source.stem}-{size}.webp'
        target.parent.mkdir(parents=True, exist_ok=True)
        url = '/' + str(target.relative_to(public)).replace(' ', '%20')
        entries.append({'src': url, 'width': size})
        jobs.append((source, target, size))
    manifest['/' + str(relative).replace(' ', '%20')] = {'width': width, 'height': height, 'variants': entries}
def convert(job):
    source, target, size = job
    if not target.exists() or target.stat().st_mtime < source.stat().st_mtime:
        subprocess.run(['cwebp', '-quiet', '-q', '78', '-m', '5', '-resize', str(size), '0', str(source), '-o', str(target)], check=True)
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
    list(pool.map(convert, jobs))
(root / 'lib/image-manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')
original = sum(p.stat().st_size for p in sources)
largest = sum((public / v['variants'][-1]['src'].lstrip('/').replace('%20',' ')).stat().st_size for v in manifest.values())
print(f'{len(sources)} originals: {original / 1e6:.2f} MB; largest WebP set: {largest / 1e6:.2f} MB; reduction: {(1-largest/original)*100:.1f}%')
