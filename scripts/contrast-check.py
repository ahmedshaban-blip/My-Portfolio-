import colorsys

def hsl(h, s, l):
    r, g, b = colorsys.hls_to_rgb(h / 360, l / 100, s / 100)
    return (r, g, b)

def lum(rgb):
    def ch(v):
        return ((v + 0.055) / 1.055) ** 2.4 if v > 0.04045 else v / 12.92
    r, g, b = rgb
    return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b)

def ratio(a, b):
    la, lb = lum(a), lum(b)
    return (max(la, lb) + 0.05) / (min(la, lb) + 0.05)

def blend(fg, bg, alpha):
    return tuple(f * alpha + b * (1 - alpha) for f, b in zip(fg, bg))

CARD = hsl(150, 18, 97)
BG = hsl(150, 15, 95)
SEC = hsl(150, 14, 90)

print("=== current muted (160 10% 38%) ===")
for name, surf in [("card", CARD), ("background", BG), ("chip (sec/30 over card)", blend(SEC, CARD, 0.3))]:
    print(f"  on {name}: {ratio(hsl(160, 10, 38), surf):.2f}:1")

print("=== candidates on card ===")
for l in (36, 34, 32, 30, 28):
    print(f"  L={l}%: {ratio(hsl(160, 10, l), CARD):.2f}:1")
print("=== candidates on background ===")
for l in (34, 32, 30):
    print(f"  L={l}%: {ratio(hsl(160, 10, l), BG):.2f}:1")
