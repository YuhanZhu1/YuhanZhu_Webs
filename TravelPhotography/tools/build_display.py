import json,subprocess,concurrent.futures
from pathlib import Path
root=Path(__file__).resolve().parents[1]; data=json.loads((root/'assets/gallery.json').read_text())
def build(item):
 for size,path in item['variants'].items():
  subprocess.run(['magick',str(root/item['src']),'-auto-orient','-colorspace','sRGB','-resize',f'{size}x{size}>','-strip','-quality','82',str(root/path)],check=True)
 return item['slug']
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
 for i,name in enumerate(pool.map(build,data),1):
  if i%20==0:print(i,flush=True)
