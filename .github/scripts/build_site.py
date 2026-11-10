"""Pages 배포 묶음 만들기.
저장소를 출력 폴더로 복사하되, 20MiB 미만 영상(mp4)은 묶음에서 빼고
HTML의 영상 주소를 jsDelivr(같은 저장소의 같은 파일, 그 파일을 마지막으로 바꾼 커밋에 고정)로 바꾼다.
20MiB 이상 영상은 jsDelivr가 받지 않으므로 그대로 Pages에 둔다.
저장소 원본 파일은 건드리지 않는다. 출력 폴더는 비어 있어야 한다(워크플로에서는 새로 만든다).
사용: python3 .github/scripts/build_site.py [출력폴더]"""
import os, re, shutil, subprocess, sys, posixpath

REPO = "clbookslower/deeper-salon"
LIMIT = 20 * 1024 * 1024
OUT = sys.argv[1] if len(sys.argv) > 1 else "_site"
SKIP_TOP = {".git", ".github", "_site"}
EXT = re.compile(r"^[a-z][a-z0-9+.-]*:|^//|^/", re.I)
ATTR = re.compile(r'((?:src|href)=["\'])([^"\']+?\.mp4)(["\'])', re.I)


def last_commit(path):
    r = subprocess.run(["git", "log", "-1", "--format=%H", "--", path], capture_output=True, text=True)
    return r.stdout.strip()


if os.path.exists(OUT) and os.listdir(OUT):
    sys.exit(f"출력 폴더가 비어 있지 않습니다: {OUT}")
out_abs = os.path.abspath(OUT)

moved, html_files = {}, []
for root, dirs, files in os.walk("."):
    dirs[:] = [d for d in dirs
               if not (root == "." and d in SKIP_TOP) and os.path.abspath(os.path.join(root, d)) != out_abs]
    for f in files:
        if root == "." and f in SKIP_TOP:
            continue
        src = os.path.join(root, f)
        rel = posixpath.normpath(src.replace(os.sep, "/"))
        if f.lower().endswith(".mp4") and os.path.getsize(src) < LIMIT:
            sha = last_commit(rel)
            if sha:
                moved[rel] = f"https://cdn.jsdelivr.net/gh/{REPO}@{sha}/{rel}"
                continue
        dst = os.path.join(OUT, rel)
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        shutil.copy2(src, dst)
        if f.lower().endswith(".html"):
            html_files.append(rel)

changed = 0
left = []
for rel in html_files:
    p = os.path.join(OUT, rel)
    with open(p, encoding="utf-8", errors="surrogateescape") as fh:
        s = fh.read()
    base = posixpath.dirname(rel)

    def sub(m):
        global changed
        url = m.group(2)
        if EXT.match(url):
            return m.group(0)
        tgt = posixpath.normpath(posixpath.join(base, url))
        if tgt in moved:
            changed += 1
            return m.group(1) + moved[tgt] + m.group(3)
        if not os.path.exists(os.path.join(OUT, tgt)):
            left.append(f"{rel} -> {url}")
        return m.group(0)

    t = ATTR.sub(sub, s)
    if t != s:
        with open(p, "w", encoding="utf-8", errors="surrogateescape") as fh:
            fh.write(t)

size = sum(os.path.getsize(os.path.join(r, f)) for r, _, fs in os.walk(OUT) for f in fs)
print(f"영상 {len(moved)}개 CDN으로 · 주소 {changed}곳 바꿈 · 묶음 {size / 1048576:.0f}MB")
if left:
    print("끊긴 영상 주소:", *left, sep="\n  ")
    sys.exit(1)
