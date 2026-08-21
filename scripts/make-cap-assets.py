#!/usr/bin/env python3
"""Generate Capacitor asset sources (icon + splash) in rapi claymorphism style."""
from PIL import Image, ImageDraw, ImageFont
import os

OUT = os.path.join(os.path.dirname(__file__), '..', 'assets')
os.makedirs(OUT, exist_ok=True)

CREAM = (250, 243, 238)
CORAL_TOP = (255, 127, 165)
CORAL_BOTTOM = (201, 74, 120)
DARK_BG = (43, 31, 61)

FONT_CANDIDATES = [
    '/System/Library/Fonts/SFNS.ttf',
    '/System/Library/Fonts/Helvetica.ttc',
    '/System/Library/Fonts/Supplemental/Arial Bold.ttf',
]


def load_font(size):
    for path in FONT_CANDIDATES:
        try:
            kwargs = {'index': 1} if path.endswith('.ttc') else {}
            return ImageFont.truetype(path, size, **kwargs)
        except OSError:
            continue
    raise SystemExit('No usable system font found')


def lerp(a, b, t):
    return tuple(round(a[i] + (b[i] - a[i]) * t) for i in range(3))


def draw_mark(img, cx, cy, radius, letter='r'):
    """Clay-style coral circle with soft shadow, top-left highlight and white letter."""
    d = ImageDraw.Draw(img, 'RGBA')

    # Soft drop shadow
    sh = radius * 2.06
    d.ellipse([cx - sh / 2 + radius * .04, cy - sh / 2 + radius * .10,
               cx + sh / 2 + radius * .04, cy + sh / 2 + radius * .10],
              fill=(90, 40, 90, 60))

    # Vertical gradient circle drawn per scanline
    steps = int(radius * 2)
    for i in range(steps):
        y = cy - radius + i
        dy = (i + .5) / steps
        half = radius * (1 - dy) ** .5 if False else (radius ** 2 - (i - radius + .5) ** 2) ** .5
        if half <= 0:
            continue
        color = lerp(CORAL_TOP, CORAL_BOTTOM, dy)
        d.line([cx - half, y, cx + half, y], fill=color)

    # Inner highlight (clay gloss)
    hl = Image.new('RGBA', img.size, (0, 0, 0, 0))
    hd = ImageDraw.Draw(hl)
    hd.ellipse([cx - radius * .78, cy - radius * .95,
                cx + radius * .18, cy - radius * .12], fill=(255, 255, 255, 88))
    mask = Image.new('L', img.size, 0)
    md = ImageDraw.Draw(mask)
    md.ellipse([cx - radius, cy - radius, cx + radius, cy + radius], fill=255)
    img.paste(Image.composite(hl, Image.new('RGBA', img.size, (0, 0, 0, 0)), mask), (0, 0), Image.composite(hl, Image.new('RGBA', img.size, (0, 0, 0, 0)), mask))

    # Letter
    font = load_font(int(radius * 1.15))
    d.text((cx, cy + radius * .02), letter, font=font, fill=(255, 252, 248), anchor='mm')


def icon_only():
    img = Image.new('RGBA', (1024, 1024), CREAM + (255,))
    draw_mark(img, 512, 512, 300)
    img.convert('RGB').save(os.path.join(OUT, 'icon-only.png'))


def icon_foreground():
    img = Image.new('RGBA', (1024, 1024), (0, 0, 0, 0))
    draw_mark(img, 512, 512, 265)
    img.save(os.path.join(OUT, 'icon-foreground.png'))


def icon_background():
    Image.new('RGB', (1024, 1024), CREAM).save(os.path.join(OUT, 'icon-background.png'))


def splash(name, bg):
    img = Image.new('RGB', (2732, 2732), bg)
    overlay = img.convert('RGBA')
    draw_mark(overlay, 1366, 1366, 330)
    overlay.convert('RGB').save(os.path.join(OUT, name))


if __name__ == '__main__':
    icon_only()
    icon_foreground()
    icon_background()
    splash('splash.png', CREAM)
    splash('splash-dark.png', DARK_BG)
    print('assets written to', OUT)
