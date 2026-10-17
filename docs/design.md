# SIPBAJA Design System

Design system for **SIPBAJA** (Sistem Informasi Pengadaan Barang dan Jasa). Extracted from the Figma file "SIPBAJA - Dashboard Permohonan (Refined)":
https://www.figma.com/design/IKl3Kvg02yrez54L2kA2o8

Screens covered: Dashboard Permohonan (1440×980), Login (1440×900), Logo board.

---

## 1. Visual Theme & Atmosphere

**Mood:** Calm, trustworthy, institutional but modern. A green-led palette signals approval, progress, and administrative reliability, suited to a campus procurement workflow.

**Density:** Comfortable. Generous padding (20–40px), card-based grouping, one clear primary action per screen.

**Design philosophy:**
- **Soft surfaces on a tinted canvas.** White cards float on a pale green-grey background (`#F3F6F5`) with subtle borders and very light shadows.
- **One brand hue.** Deep emerald green is used for brand, primary actions, active navigation, and links. Status colors (blue, green, red) appear only as small tinted pills and icon chips.
- **Rounded, friendly geometry.** Radii of 10–24px, pill shapes for status and profile.
- **Solid green focal areas.** Flat `brand` fill is used for hero areas (dashboard hero banner, login half-circle) and the logo tile. No gradients.
- **Decorative circles.** Semi-transparent circles and rings add depth on solid green surfaces without adding noise.
- **Icons:** Line icons (Lucide style), 2px stroke, round caps and joins.
- **Language:** UI copy is in Bahasa Indonesia.

---

## 2. Color Palette & Roles

### Brand

| Token | Hex | Role |
|---|---|---|
| `brand` | `#0E7C5A` | Primary buttons, active nav, links, table IDs, key icons |
| `brand-dark` | `#0A5C43` | Hover/pressed state, dark brand surface, help-card title |
| `brand-mint` | `#7FE0B8` | "BAJA" wordmark on dark surfaces |

### Neutrals

| Token | Hex | Role |
|---|---|---|
| `bg-canvas` | `#F3F6F5` | Page background |
| `surface` | `#FFFFFF` | Cards, sidebar, topbar controls |
| `surface-tint` | `#EAF5F1` | Help card, light brand panel |
| `surface-table-head` | `#F1F7F4` | Table header row |
| `surface-input` | `#F7FAF9` | Input field fill |
| `surface-chip` | `#EEF5F2` | Icon chips, action buttons |
| `avatar-bg` | `#D6EFE4` | Avatar circle |
| `border` | `#E4EBE8` | Card, input, table, and sidebar borders |
| `text-primary` | `#14201C` | Headings, body strong |
| `text-secondary` | `#5F6F6A` | Body, inactive nav, labels |
| `text-muted` | `#8A9A95` | Placeholders, captions, section labels, input icons |

### Status

| Status | Dot / Icon | Pill bg | Pill text |
|---|---|---|---|
| Menunggu Verifikasi (pending, info) | `#2F6FED` | `#E8F0FF` | `#1F55C7` |
| Disetujui (approved, success) | `#12A06B` | `#E4F6EC` | `#0B7A4E` |
| Ditolak (rejected, danger) | `#E5484D` | `#FDECEC` | `#B42318` |

### Overlays

- On solid green surfaces: white at 7–12% for decorative circles and rings.
- Hero eyebrow text: white 75%. Hero subtitle: white 85%.
- Notification badge: `#E5484D` with a 2px white stroke.

---

## 3. Typography Rules

**Font family:** Plus Jakarta Sans (Regular 400, Medium 500, Semi Bold 600, Bold 700). Fallback: `system-ui, sans-serif`.

| Role | Size | Weight | Letter spacing | Color | Usage |
|---|---|---|---|---|---|
| Wordmark (large) | 64 | Bold | -1 | `text-primary` + `brand` | Primary logo lockup |
| Display / brand title | 40 | Bold | -0.5 | white | "SIPBAJA" on login panel |
| Stat number | 34 | Bold | 0 | `text-primary` | Dashboard stat cards |
| Hero title | 26 | Bold | 0 | white | Dashboard welcome |
| Page / card title | 24 | Bold | 0 | `text-primary` | Login title |
| Section title | 20 | Bold | 0 | `text-primary` | "Permohonan Anda" |
| Body default | 14 | Regular / Medium | 0 | `text-primary` or `text-secondary` | Table cells, inputs, nav |
| Button / link | 14–15 | Semi Bold | 0 | white or `brand` | Buttons, "Lihat Semua" |
| Label | 13 | Semi Bold | 0 | `text-primary` | Form labels, stat labels (Medium) |
| Helper / caption | 12–13 | Regular | 0 | `text-secondary` / `text-muted` | Subtitles, help text |
| Status pill | 12 | Semi Bold | 0 | status text color | Pills |
| Table header | 11 | Semi Bold | +0.8, UPPERCASE | `text-secondary` | Column titles |
| Nav group label | 11 | Semi Bold | +1.1, UPPERCASE | `text-muted` | "PERMOHONAN SAYA" |
| Eyebrow | 12 | Semi Bold | +1.4, UPPERCASE | white 75% | "DASHBOARD" in hero |

**Rules:** Use sentence case for UI text. Only table headers, nav group labels, and eyebrows are uppercase. Table IDs (`01010-FF-11`) use Semi Bold in `brand`. Keep max two weights per component.

---

## 4. Component Stylings

### Buttons

**Primary (solid)**
- Fill `brand`, text white Semi Bold 15, padding 14 vertical, radius 12, full width in forms.
- Shadow: `0 8 18 rgba(13,51,38,.28)`.
- States: hover → fill `brand-dark`; pressed → `brand-dark` and shadow reduced; disabled → `brand` at 40% opacity, no shadow; focus → 2px outer ring `brand` at 40%.

**Hero CTA (inverse)**
- Fill white, text and icon `brand`, Semi Bold 14, padding 14×22, radius 14, icon 18px (stroke 2.5) + gap 10.
- Shadow: `0 8 20 rgba(13,51,38,.2)`.
- States: hover → fill `#F1F7F4`.

**Icon button (action)**
- 36×36, radius 10, fill `surface-chip`, icon 18px `brand`.
- States: hover → fill `#E1F0EA`.

**Text link**
- `brand` Semi Bold 13–14. Optional trailing arrow icon 16px. Hover → underline.

### Navigation

**Sidebar**
- Width 272, fill white, 1px right border `border`.
- Padding 28 top / 20 sides / 24 bottom, gap 28 between brand, nav, help card.
- Brand row: logo + wordmark.

**Nav item**
- Padding 12×16, radius 12, gap 12, icon 20px, text 14.
- Inactive: icon and text `text-secondary`, Medium. Hover → fill `surface-tint`.
- Active: fill `brand`, icon and text white, Semi Bold, shadow `0 6 16 rgba(13,51,38,.28)`.

**Topbar**
- Left: search field (340×44, radius 12, white, 1px border, search icon 18px, placeholder 14 `text-muted`).
- Right: notification button (44 circle, white, border, bell 20px, 10px red dot badge top-right) and profile pill.
- Profile pill: radius 999, white, border, padding 6/16/6/6, avatar 40 circle `avatar-bg` with initials Bold 14 `brand`, name Semi Bold 14, sub-caption 11 `text-muted`, chevron-down 18px.

### Cards

**Hero banner**
- Radius 24, height 148, padding 32×36, solid `brand` fill, clips content.
- Shadow: `0 10 24 rgba(13,51,38,.14)`.
- Two decorative circles (260 and 170 diameter) in white 7–8%, positioned at the right edge.
- Left: eyebrow, title, subtitle. Right: CTA.

**Stat card**
- White, radius 18, 1px border, padding 20×22, gap 16, shadow `0 4 14 rgba(13,51,38,.05)`.
- Icon box 56×56, radius 16, tinted by status, icon 26px in status color.
- Text: label 13 Medium `text-secondary`; value 34 Bold + unit "Permohonan" 13 `text-muted`.
- Three cards in a row, equal width, gap 20.

**Table card**
- White, radius 20, 1px border, clips content, shadow `0 4 16 rgba(13,51,38,.05)`.
- Header row: height 46, fill `surface-table-head`, padding 0×28.
- Body row: height 68, padding 0×28, 1px top border `border`. Hover → fill `#F7FAF9`.
- Column widths: No Permohonan 180 / Judul fill / Tanggal 200 / Status 220 / Aksi 80.
- Title cell: 36×36 icon chip (radius 10, `surface-chip`, file icon 18px `brand`) + text 14 Medium.
- Footer: padding 18×28, right-aligned text link with arrow, top border.

**Help card**
- Fill `surface-tint`, radius 16, padding 16, title 13 Semi Bold `brand-dark`, body 12 `text-secondary`.

**Login card**
- White, width 440, radius 24, padding 40, gap 24, 1px border, shadow `0 12 32 rgba(13,51,38,.08)`.
- Header (centered): icon box 56 (radius 16, `#E4F6EC`, login icon 26px `brand`), title 24 Bold, subtitle 14 `text-secondary`.

### Status Pill

- Padding 6×12, radius 999, gap 8, leading dot 7px, text 12 Semi Bold.
- Colors per status table in Section 2.

### Inputs

- Fill `surface-input`, 1px border `border`, radius 12, padding 13×14, gap 10.
- Leading icon 18px `text-muted`; optional trailing icon (password visibility).
- Label above: 13 Semi Bold, gap 8.
- States: hover → border `#CFDAD6`; focus → border `brand` and 3px ring `brand` at 15%; error → border `#E5484D` with helper text `#B42318`; disabled → fill `#EEF2F0`, text `text-muted`.
- Placeholder: 14 Regular `text-muted`.

### Logo

- Icon: rounded square tile (radius 25% of size) with solid `brand` fill, white isometric package cube (top 100%, left 72%, right 48% opacity), and a white circular check badge at bottom-right with a `brand` check.
- Lockup: icon + "SIP" (`text-primary`) + "BAJA" (`brand`), Bold, letter spacing -1. Tagline 30% of wordmark size, Medium, `text-secondary`.
- Variants: color on light, white-tile on `brand-dark`, icon-only (min 24px).
- Gap between icon and text: about 22% of icon size.

### Login Hero Panel

- Left half-circle: 1000px circle centered on the left edge (x -500), solid `brand` fill.
- Concentric ring 700px (2px stroke, white 12%) and glow circle 420px (white 7%).
- Brand block: logo (52 circle white with "L" placeholder, replace with logo icon), title 40 Bold white, description 16 white 85%, max width 300.
- Two small accent circles (90 and 56) on the right canvas in `#12A06B` 18% and `brand` 10%.

---

## 5. Layout Principles

**Canvas:** 1440 wide desktop baseline. Dashboard frame 1440×980; login 1440×900.

**Structure (dashboard):** Fixed 272px sidebar + fluid main. Main padding 28 vertical / 40 horizontal, vertical stack with 28px gaps: topbar → hero → stats → table section.

**Spacing scale (px):** 4, 8, 12, 16, 20, 24, 28, 32, 40, 64.
- Inside small controls: 6–14.
- Card padding: 20–28 (login card 40).
- Gap between cards in a row: 20.
- Gap between page sections: 28.
- Tight text stacks: 1–4 (title + caption), form field label gap 8.

**Grid:** Stat cards use a 3-column equal-width flex row. Table uses fixed columns with one flexible column (Judul).

**Whitespace philosophy:** Let content breathe inside cards and keep one focal point per band (hero CTA, then stats, then table). Do not fill empty canvas space; background stays flat `bg-canvas`.

**Auto layout:** All frames use auto layout. Prefer `FILL` for widths inside rows and `HUG` for height.

**Radius scale:** 10 (small chips), 12 (inputs, buttons, nav), 14 (CTA), 16 (icon boxes, help card), 18 (stat cards), 20 (table card), 24 (hero, login card), 999 (pills).

---

## 6. Depth & Elevation

Shadow color base: `rgba(13,51,38,a)` (a deep green-tinted shadow, never pure black).

| Level | Use | Shadow |
|---|---|---|
| 0 | Canvas, inputs | none (1px border) |
| 1 | Stat cards, table card | `0 4 14–16 / a=.05` |
| 2 | Active nav, primary button | `0 6–8 16–18 / a=.28` |
| 3 | Hero banner | `0 10 24 / a=.14` |
| 3 | Hero CTA | `0 8 20 / a=.20` |
| 4 | Login card | `0 12 32 / a=.08` |

**Surface hierarchy:** `bg-canvas` → white surfaces with 1px `border` → tinted chips (`surface-chip`, `surface-tint`) → solid `brand` surfaces (highest emphasis). Rely on border plus soft shadow rather than stacked dark shadows.

---

## 7. Do's and Don'ts

**Do**
- Use `brand` `#0E7C5A` for the single primary action on a screen.
- Pair every status color with its tinted background and darker text for contrast.
- Keep radii consistent with the scale in Section 5.
- Use Lucide-style line icons, 2px stroke, sized 18 / 20 / 26.
- Use green-tinted shadows only.
- Keep UI copy in Bahasa Indonesia, sentence case.
- Place decorative circles behind content at 7–12% white.

**Don't**
- Don't introduce new accent hues (orange, purple, etc.). Blue, green, and red are reserved for status.
- Don't use pure black text or black shadows.
- Don't use gradients anywhere. Use solid fills only.
- Don't mix filled and outline icon styles.
- Don't use more than one solid green button per view.
- Don't convey status by color alone. Always include the label text in the pill.
- Don't use uppercase beyond table headers, nav group labels, and eyebrows.
- Don't place text smaller than 11px.
- Don't leave the logo placeholder "L" in production screens. Use the logo icon.

---

## 8. Responsive Behavior

> The Figma file only contains desktop frames (1440 wide). The rules below are the recommended behavior when implementing.

**Breakpoints**

| Name | Width | Behavior |
|---|---|---|
| Desktop XL | ≥ 1280 | Layout as designed: full sidebar 272, 3 stat columns |
| Desktop / Tablet landscape | 1024–1279 | Same structure, main padding 32; table hides the Tanggal column if tight |
| Tablet | 768–1023 | Sidebar collapses to icon rail (72px, tooltips); stats stay 3 columns with smaller padding |
| Mobile | < 768 | Sidebar becomes off-canvas drawer behind a menu button; topbar shows menu, logo, bell, avatar; search moves under topbar |

**Collapsing strategy**
- **Hero:** stack text above CTA; CTA becomes full width; hide the second decorative circle.
- **Stats:** 3 columns → 1 column stacked (or horizontal scroll snap) below 768.
- **Table:** below 768 convert rows into stacked cards (No Permohonan + status pill on top, title, date, action button at the bottom). Keep column headers hidden.
- **Login:** below 1024 shrink the half-circle to a top green band (about 240px high) with logo and title; card centers below it, width `min(440px, 100% - 32px)`. Below 768 reduce card padding to 24.

**Touch targets:** minimum 44×44 on touch devices. Increase the 36px action buttons to 44 and nav items to 48 height on mobile. Inputs and primary button minimum 48 height.

**Typography scaling:** On mobile reduce hero title to 22, stat number to 28, display title to 32. Body stays 14.

---

## 9. Agent Prompt Guide

### Quick Color Reference

```
brand        #0E7C5A    brand-dark   #0A5C43    brand-mint   #7FE0B8
canvas       #F3F6F5    surface      #FFFFFF    tint         #EAF5F1
table-head   #F1F7F4    input-bg     #F7FAF9    chip         #EEF5F2
border       #E4EBE8
text         #14201C    text-2       #5F6F6A    text-muted   #8A9A95
pending      #2F6FED / #E8F0FF / #1F55C7   (dot / bg / text)
approved     #12A06B / #E4F6EC / #0B7A4E
rejected     #E5484D / #FDECEC / #B42318
shadow base  rgba(13,51,38,a)
font         Plus Jakarta Sans 400/500/600/700
radius       10 / 12 / 14 / 16 / 18 / 20 / 24 / 999
```

### Ready-to-use Prompts

**Generic screen**
> Build a SIPBAJA screen using Plus Jakarta Sans, canvas `#F3F6F5`, white cards with 1px `#E4EBE8` border, radius 18–24, and soft green-tinted shadows (`rgba(13,51,38,.05)`). Primary color `#0E7C5A`. Text `#14201C` / `#5F6F6A` / `#8A9A95`. Line icons (Lucide, 2px stroke). UI copy in Bahasa Indonesia.

**Dashboard page**
> Create a 1440×980 dashboard: 272px white sidebar (logo, active nav pill filled `#0E7C5A` with white text, group label "PERMOHONAN SAYA", help card `#EAF5F1`), topbar with 340px search, bell, and profile pill. Main has a 148px hero banner (radius 24, solid `#0E7C5A`, white title "Selamat datang, …", white CTA "Buat Permohonan"), three stat cards (icon box 56, number 34 Bold) for Menunggu Verifikasi / Ditolak / Disetujui, and a table card with columns No Permohonan, Judul Pengadaan, Tanggal Pengajuan, Status, Aksi.

**Login page**
> Create a 1440×900 login: left half-circle (1000px circle centered on the left edge, solid `#0E7C5A`) with concentric ring and glow, logo + "SIPBAJA" 40 Bold white + short description. Right: white card 440px, radius 24, padding 40, with icon box, title "Selamat Datang di SIPBAJA", Email/Username and Password inputs (fill `#F7FAF9`, radius 12), full-width `#0E7C5A` Login button, and "Lupa Password? Reset Password" footer.

**Status pill**
> Pill, radius 999, padding 6×12, 7px dot + 12 Semi Bold label. Menunggu Verifikasi: bg `#E8F0FF`, text `#1F55C7`, dot `#2F6FED`. Disetujui: bg `#E4F6EC`, text `#0B7A4E`, dot `#12A06B`. Ditolak: bg `#FDECEC`, text `#B42318`, dot `#E5484D`.

**Logo**
> Rounded-square tile (radius 25%) with solid `#0E7C5A` fill, white isometric package cube, white circular check badge bottom-right. Wordmark "SIP" in `#14201C` + "BAJA" in `#0E7C5A`, Plus Jakarta Sans Bold, letter spacing -1; tagline "Sistem Informasi Pengadaan Barang dan Jasa" in Medium `#5F6F6A`.

### Self-check Before Delivering
1. Only one saturated brand hue, no gradients, status colors used in pills and icon chips only.
2. All cards have border + green-tinted soft shadow, no black shadows.
3. Radii and spacing come from the scales above.
4. Text contrast: status text uses the darker `text` color per status, not the dot color.
5. Copy is Bahasa Indonesia and sentence case.
