#!/usr/bin/env python3
"""key-art.py — turn AI art on a flat green (#00FF00-ish) background into a clean transparent WebP.

Usage:
  python3 scripts/key-art.py INPUT OUTPUT.webp [--kind enemy|button] [--max 760] [--mirror]

What it does (so it can be maintained):
  1. Estimates the background colour from the 4 corners.
  2. Marks 'green-ish' pixels, then keeps only the regions CONNECTED TO THE IMAGE BORDER as background
     (so green-looking details inside the artwork are not deleted).
  3. enemy: also removes enclosed pockets of pure background (e.g. between an arm and a weapon).
  4. Erodes the cut-out by ~1px and softens the edge (no green halo), then removes green spill from edge pixels.
  5. button/enemy: also neutralises stray green tint left inside the artwork (the art has no green).
  6. Trims to the subject, resizes, saves a WebP with alpha.
"""
import sys, argparse
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage as ndi

ap = argparse.ArgumentParser()
ap.add_argument('src'); ap.add_argument('dst')
ap.add_argument('--kind', default='enemy', choices=['enemy', 'button'])
ap.add_argument('--max', type=int, default=760, help='max size of the longest side in px')
ap.add_argument('--mirror', action='store_true', help='flip horizontally (Left button -> Right button)')
a = ap.parse_args()

im = Image.open(a.src).convert('RGB')
px = np.asarray(im).astype(np.int16)
r, g, b = px[..., 0], px[..., 1], px[..., 2]
h, w = g.shape

corners = np.concatenate([px[:6, :6].reshape(-1, 3), px[:6, -6:].reshape(-1, 3), px[-6:, :6].reshape(-1, 3), px[-6:, -6:].reshape(-1, 3)])
bg = np.median(corners, axis=0)
dist = np.sqrt(((px - bg) ** 2).sum(-1))
greenness = g - np.maximum(r, b)

bgmask = ((greenness > 45) & (g > 85)) | (dist < 70)

lab, n = ndi.label(bgmask)
border = np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))
border = border[border != 0]
bg_region = np.isin(lab, border)

if a.kind == 'enemy':
    # enclosed pockets of background (between an arm and a weapon, inside smoke wisps, ...)
    lab2, n2 = ndi.label(bgmask & ~bg_region)
    if n2:
        sizes = ndi.sum(np.ones_like(lab2), lab2, index=np.arange(1, n2 + 1))
        for i, s in enumerate(sizes, start=1):
            if s >= 12:
                bg_region |= (lab2 == i)

fg = ~bg_region
fg = ndi.binary_opening(fg, iterations=1)                 # drop isolated specks
fg = ndi.binary_fill_holes(fg) if a.kind == 'button' else fg
fg_er = ndi.binary_erosion(fg, iterations=1)              # cut the halo
alpha = ndi.gaussian_filter(fg_er.astype(np.float32), 0.7)
alpha = np.clip((alpha - 0.15) / 0.7, 0, 1)

# despill: near the edge, green may not exceed the other channels
edge = ndi.binary_dilation(~fg_er, iterations=3) & fg
out = px.copy()
limit = np.maximum(r, b) + 6
out[..., 1] = np.where(edge, np.minimum(g, limit), g)
if a.kind in ('button', 'enemy'):          # the artwork itself has no green: remove any leftover green tint
    stray = (greenness > 14) & fg
    out[..., 1] = np.where(stray, np.minimum(out[..., 1], limit), out[..., 1])   # neon glow -> neutral
out = np.clip(out, 0, 255).astype(np.uint8)

rgba = np.dstack([out, (alpha * 255).astype(np.uint8)])
img = Image.fromarray(rgba, 'RGBA')

bbox = img.getchannel('A').point(lambda v: 255 if v > 12 else 0).getbbox()
pad = int(0.02 * max(bbox[2] - bbox[0], bbox[3] - bbox[1]))
bbox = (max(0, bbox[0] - pad), max(0, bbox[1] - pad), min(w, bbox[2] + pad), min(h, bbox[3] + pad))
img = img.crop(bbox)
if a.kind == 'button':                                     # square canvas, centred
    s = max(img.size); sq = Image.new('RGBA', (s, s), (0, 0, 0, 0)); sq.paste(img, ((s - img.width) // 2, (s - img.height) // 2)); img = sq
if a.mirror:
    img = img.transpose(Image.FLIP_LEFT_RIGHT)
scale = a.max / max(img.size)
if scale < 1:
    img = img.resize((round(img.width * scale), round(img.height * scale)), Image.LANCZOS)
img.save(a.dst, 'WEBP', quality=88, method=6, alpha_quality=100)
import os
print(f'{a.dst}: {img.size[0]}x{img.size[1]} {os.path.getsize(a.dst)//1024} KB')
