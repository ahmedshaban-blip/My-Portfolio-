import re, os, pathlib
refs = set(re.findall(r'/projects/[^\s"\']+', open('src/data/projects.ts', encoding='utf-8').read()))
deleted = []
for dirpath, _, files in os.walk('public/projects'):
    for fn in files:
        fp = os.path.join(dirpath, fn)
        rel = '/' + os.path.relpath(fp, 'public').replace('\\', '/')
        if rel not in refs:
            print('ORPHAN', rel, os.path.getsize(fp)//1024, 'KB')
            os.remove(fp)
            deleted.append(rel)
print('deleted', len(deleted))
total = sum(f.stat().st_size for f in pathlib.Path('public/projects').rglob('*') if f.is_file())
print(f'total now: {total/1024/1024:.2f} MB')
