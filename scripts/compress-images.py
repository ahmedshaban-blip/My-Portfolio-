from PIL import Image
import os, hashlib

ROOT = r"D:\MyPotfolio\my-portfolio\public\projects"
mapping = {}
total_before = 0
total_after = 0
converted = []

def file_hash(p):
    h = hashlib.md5()
    with open(p,'rb') as f:
        for c in iter(lambda: f.read(65536), b''):
            h.update(c)
    return h.hexdigest()

for dirpath, _, files in os.walk(ROOT):
    for fn in files:
        fp = os.path.join(dirpath, fn)
        ext = os.path.splitext(fn)[1].lower()
        if ext not in ('.png','.jpg','.jpeg','.webp'):
            continue
        before = os.path.getsize(fp)
        total_before += before
        try:
            im = Image.open(fp)
            # handle transparency / palette
            w, h = im.size
            portrait = h > w
            max_w = 800 if portrait else 1280
            if w > max_w:
                nh = int(h * max_w / w)
                im = im.resize((max_w, nh), Image.LANCZOS)
                w, h = im.size
            base, _ = os.path.splitext(fp)
            if ext in ('.png','.jpg','.jpeg'):
                out = base + '.webp'
                # avoid overwrite confusion if webp already exists with same base
                if os.path.abspath(out) == os.path.abspath(fp):
                    out = base + '-opt.webp'
                if im.mode in ('RGBA','LA'):
                    pass
                elif im.mode == 'P':
                    im = im.convert('RGBA')
                else:
                    im = im.convert('RGB') if im.mode != 'RGB' else im
                im.save(out, 'WEBP', quality=75, method=6)
                after = os.path.getsize(out)
                total_after += after
                rel_old = '/' + os.path.relpath(fp, r"D:\MyPotfolio\my-portfolio\public").replace('\\','/')
                rel_new = '/' + os.path.relpath(out, r"D:\MyPotfolio\my-portfolio\public").replace('\\','/')
                mapping[rel_old] = rel_new
                converted.append((rel_old, rel_new, before/1024, after/1024))
                os.remove(fp)  # delete original png/jpg
            else:
                # recompress webp in place via temp
                tmp = fp + '.tmp.webp'
                rgb = im.convert('RGB') if im.mode not in ('RGB','RGBA') else im
                rgb.save(tmp, 'WEBP', quality=70, method=6)
                after = os.path.getsize(tmp)
                # keep smaller only
                if after < before:
                    os.replace(tmp, fp)
                    total_after += after
                else:
                    os.remove(tmp)
                    total_after += before
                converted.append((fp, fp, before/1024, after/1024))
        except Exception as e:
            print('FAIL', fp, e)
            total_after += before

print(f"TOTAL before: {total_before/1024/1024:.2f} MB")
print(f"TOTAL after: {total_after/1024/1024:.2f} MB")
print("=== PNG->WEBP mapping ===")
for o,n,bo,ba in converted:
    if o != n:
        print(f"{o} -> {n}  ({bo:.0f}KB -> {ba:.0f}KB)")
print("=== biggest remaining ===")
sizes=[]
for dirpath,_,files in os.walk(ROOT):
    for fn in files:
        fp=os.path.join(dirpath,fn)
        sizes.append((os.path.getsize(fp), os.path.relpath(fp,ROOT)))
sizes.sort(reverse=True)
for s,r in sizes[:15]:
    print(f"{s/1024:.0f}KB  {r}")

# save mapping for node step
import json
with open(r"D:\MyPotfolio\my-portfolio\scripts\img-mapping.json","w") as f:
    json.dump({k:v for k,v,_ ,_ in [x for x in converted if x[0]!=x[1]]}, f, indent=2)
