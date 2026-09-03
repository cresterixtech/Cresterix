"""Generate public/og-cover.png — the 1200x630 social share card.

Run manually when the brand assets or tagline change:

    python scripts/generate-og-cover.py

Deliberately NOT wired into `npm run build`: it needs Python + Pillow,
which not every machine that builds this site will have, and the output
is a committed asset that changes about once a year.

A logo file on its own does not work as a share card — Open Graph wants
1.91:1 landscape and the mark is square, so cropping it would butcher
the artwork. This composes a proper card instead: the mark on the
brand's own ground, beside the wordmark.

Colours are read from src/styles/tokens.css by eye, not imported; if the
palette changes there, update VOID/INK/INK_DIM/ACCENT/CYAN below.
"""

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "og-cover.png"
MARK = ROOT / "public" / "mark-white.png"

W, H = 1200, 630

# tokens.css
VOID = (5, 7, 10)
INK = (231, 234, 239)
INK_DIM = (162, 173, 191)
ACCENT = (47, 107, 255)
CYAN = (70, 216, 232)

# Segoe UI is the declared fallback for --font-display ("Sora", "Segoe UI"),
# so the card stays on-brand without shipping a webfont to this script.
FONTS = Path("C:/Windows/Fonts")
F_SEMI = FONTS / "seguisb.ttf"
F_REG = FONTS / "segoeui.ttf"


def glow(size, colour, opacity):
    """A soft radial wash.

    Built by hand rather than with Image.radial_gradient, whose square
    canvas stays bright in the corners — pasting that leaves a visible
    rectangular seam across the card. This falls to exactly zero at the
    inscribed circle, so the paste boundary is invisible.

    Computed at low resolution and scaled up: 64x64 is 4k pixels of pure
    Python, and LANCZOS makes the result smoother than the source.
    """
    n = 64
    small = Image.new("L", (n, n), 0)
    px = small.load()
    r = n / 2
    for y in range(n):
        for x in range(n):
            d = (((x - r + 0.5) ** 2 + (y - r + 0.5) ** 2) ** 0.5) / r
            if d < 1:
                # Squared falloff reads softer than linear at this scale.
                px[x, y] = int(((1 - d) ** 2) * opacity * 255)
    mask = small.resize(size, Image.LANCZOS)
    return Image.new("RGB", size, colour), mask


def spaced_text(draw, xy, text, font, fill, tracking=0):
    """Pillow has no letter-spacing, and the brand's display type is
    tracked out. Draw glyph by glyph."""
    x, y = xy
    for ch in text:
        draw.text((x, y), ch, font=font, fill=fill)
        x += draw.textlength(ch, font=font) + tracking
    return x


def main():
    card = Image.new("RGB", (W, H), VOID)

    # Two washes, matching the site's void aesthetic: blue off the top
    # right, cyan low on the left.
    for size, colour, opacity, pos in (
        ((1250, 1050), ACCENT, 0.24, (380, -430)),
        ((1000, 880), CYAN, 0.11, (-360, 210)),
    ):
        layer, mask = glow(size, colour, opacity)
        card.paste(layer, pos, mask)

    draw = ImageDraw.Draw(card)

    f_word = ImageFont.truetype(str(F_SEMI), 62)
    f_tag = ImageFont.truetype(str(F_REG), 27)
    f_url = ImageFont.truetype(str(F_REG), 22)

    mark = Image.open(MARK).convert("RGBA")
    mh = 176
    mark = mark.resize((round(mark.width * mh / mark.height), mh), Image.LANCZOS)

    # Measure first, then centre the whole lockup — hard-coding a left
    # margin left the right third of the card empty.
    TRACK, GAP = 7, 56
    word_w = sum(draw.textlength(c, font=f_word) + TRACK for c in "CRESTERIX") - TRACK
    text_w = max(word_w, draw.textlength("The Crest of Digital Solutions", font=f_tag))
    total = mark.width + GAP + 1 + GAP + text_w
    mx = round((W - total) / 2)
    my = (H - mh) // 2

    card.paste(mark, (mx, my), mark)

    dx = mx + mark.width + GAP
    draw.line([(dx, my + 4), (dx, my + mh - 4)], fill=(60, 71, 87), width=1)

    tx = dx + GAP
    spaced_text(draw, (tx, my + 26), "CRESTERIX", f_word, INK, tracking=TRACK)
    draw.text((tx + 3, my + 112), "The Crest of Digital Solutions", font=f_tag, fill=INK_DIM)

    # Accent dot + domain, echoing the footer's location badge.
    dot_y = my + 163
    draw.ellipse([tx + 3, dot_y + 8, tx + 12, dot_y + 17], fill=CYAN)
    draw.text((tx + 26, dot_y), "cresterix.com", font=f_url, fill=(110, 124, 141))

    card.save(OUT, "PNG", optimize=True)
    print(f"{OUT.relative_to(ROOT)} — {W}x{H}, {OUT.stat().st_size // 1024} kB")


if __name__ == "__main__":
    main()
