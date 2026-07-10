# PawsPal — "Good Dog" Shopify Theme

A complete, custom Online Store 2.0 Shopify theme for a premium dog accessories store,
inspired by [thefoggydog.com](https://thefoggydog.com): warm cream canvas, blush accents,
elegant serif headlines, and a "give back" brand story woven through the whole experience.

The theme lives at the **root of this repository**, so it works directly with
Shopify's GitHub integration.

## What's included

**Homepage (fully assembled, editable in the theme customizer):**
1. Announcement bar — free shipping + donation messaging
2. Hero banner — big serif headline, two CTAs, lifestyle image
3. Scrolling "Sit. Stay. Shop." marquee
4. Shop-by-category tiles (Collars, Leashes, Bandanas, Toys)
5. Bestsellers product carousel/grid with quick-add
6. Values bar (gives back · machine washable · free shipping · dog approved)
7. "Every order feeds a shelter dog" image-with-text story
8. "As seen in" press logos
9. Customer testimonials (with pup names, of course)
10. Instagram grid
11. Newsletter signup ("Get 10% off your first order")

**Full storefront:**
- Product page: image gallery with thumbnails, variant pill picker with live
  price/availability updates, quantity stepper, dynamic checkout button,
  give-back badge, accordions (sizing / care / shipping), "You may also like"
- Collection page: filtering (Search & Discovery compatible), sorting, pagination
- AJAX cart drawer with free-shipping progress bar + full cart page
- Search, blog, article (with comments), pages, contact page with FAQ,
  404, password/coming-soon page, gift card page
- Full customer accounts: login, register, account, order detail, addresses,
  reset/activate password

**Theme settings (Customize → Theme settings):**
- Colors (background, text, primary navy, blush accent, sage highlight, sale)
- Typography (heading + body font pickers; defaults: Playfair Display + Assistant)
- Layout width and corner radius
- Product card options (hover image, quick add, "New" badge window, vendor)
- Cart type (drawer/page), free-shipping threshold, order note, give-back message
- Social links and favicon

## How to install

### Option A — GitHub integration (recommended)
In Shopify admin: **Online Store → Themes → Add theme → Connect from GitHub**,
then pick this repository and the `main` branch. Edits made in the theme
customizer sync back here as commits.

### Option B — Shopify CLI
```bash
shopify theme push --unpublished --theme "Good Dog"   # upload as a new theme
shopify theme dev                                      # or live local preview
```

### Option C — Zip upload
```bash
zip -r good-dog-theme.zip . -x '*.git*' -x '*.md'
```
Then in Shopify admin: **Online Store → Themes → Add theme → Upload zip file**.

## After installing — 10-minute setup checklist

1. **Navigation** (Online Store → Navigation): edit the `main-menu` with items
   like *Shop All, Collars, Leashes, Bandanas, Toys, Sale* — nest links under an
   item to get dropdown menus. Edit the `footer` menu (Shipping, Returns, FAQ…).
2. **Collections**: create Collars / Leashes / Bandanas / Toys / Bestsellers /
   New Arrivals, then in the customizer point the *Shop by category* tiles and
   *Bestsellers* section at them.
3. **Images**: upload a hero lifestyle photo (2200×1200+), category tile photos,
   and 6 Instagram-style square photos. Every image slot has a tasteful
   placeholder until you do.
4. **Theme settings**: set your Instagram/TikTok links, free-shipping threshold,
   and (optionally) your logo. Without a logo the shop name renders in the serif
   wordmark style.
5. **Newsletter discount**: the signup promises 10% off — create the matching
   discount code, or edit the copy in the Newsletter section.
6. **Contact page**: create a page named "Contact" and assign the
   `page.contact` template to get the contact form + FAQ layout.

## File structure

```
├── assets/          base.css, theme.js
├── config/          settings_schema.json, settings_data.json
├── layout/          theme.liquid, password.liquid
├── locales/         en.default.json
├── sections/        34 sections (header, footer, hero, product, cart drawer…)
├── snippets/        product-card, price, icon, pagination, meta-tags
└── templates/       19 JSON templates + gift_card.liquid (incl. customers/)
```
