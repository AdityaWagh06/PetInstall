# PetInstall

**Install your favorite pet in your own website.** A showcase site for Bubu (panda) and Dudu (bear), plus `petbuddy.js`, the one file other people paste into their own sites.

## Run it

No build step. Either double-click `index.html`, or serve the folder so the copy-paste snippets show your real URL:

```bash
npx serve .          # or: python -m http.server 8080
```

## Files

| File | What it is |
| --- | --- |
| `petbuddy.js` | The pet widget people install. Defines `<pet-buddy>`, the mascots, and every action. No dependencies. |
| `index.html` | The website: hero, pets, playground with code, action gallery, install steps, FAQ. |
| `css/site.css` | Website styles (the pets have their own styles inside `petbuddy.js`). |
| `js/site.js` | Playground, code generator, gallery and page animations. |

## Using a pet

One line, pasted right before `</body>`. No CSS file is needed: the drawings, styles and animations are all inside `petbuddy.js`.

```html
<script src="https://YOUR-DOMAIN/petbuddy.js" data-pet="dudu" data-action="dance" defer></script>
```

Both pets playing together:

```html
<script src="https://YOUR-DOMAIN/petbuddy.js" data-pets="bubu dudu" data-scene="hug" defer></script>
```

Every option below works as a `data-` attribute on that script tag (`data-size="120"`, `data-side="left"`...). To place a pet inside your layout instead, use the tag form where it should sit, plus the script once:

```html
<pet-buddy pet="dudu" action="dance" mode="inline"></pet-buddy>
<script src="https://YOUR-DOMAIN/petbuddy.js" defer></script>
```

| Attribute | Values |
| --- | --- |
| `pet` | `bubu`, `dudu`, or any registered id |
| `action` | `flow` (loops everything, default) or one of: happy, laugh, love, kiss, wink, hug, excited, cheer, surprised, curious, think, shy, peekaboo, eat, music, grumpy, cry, dizzy, yawn, sleepy, wave, dance, jump, spin, walk |
| `mode` | `roam` (walks along the bottom of the screen, default) or `inline` (sits where the tag is) |
| `size` | pixels, default 104 (roam) / 160 (inline) |
| `accessory` | `none`, `bowtie`, `flower`, `crown`, `headphones` |
| `hint` | speech bubble text, or `none` |
| `side` | `right` or `left`, where a roaming pet walks in from |
| `once` | play the action once, then idle |

From JavaScript: `document.querySelector('pet-buddy').play('dance')`.

## Two pets together

```html
<pet-duo pets="bubu dudu" scene="hug"></pet-duo>
```

`scene` is `flow` (plays them all) or one of: hug, kiss, highfive, holdhands, dance, cheerup, peekaboo, poke, tickle, share, makeup, nap. It takes the same `mode`, `size`, `side`, `hint` and `once` attributes, and `accessory` can hold one value per pet (`"none bowtie"`). From JavaScript: `document.querySelector('pet-duo').play('highfive')`.

## Adding a new mascot

Every pet shares the same body, moves and moods, so a new pet is a palette. Add a `register({...})` block next to Bubu and Dudu near the top of `petbuddy.js`:

```js
register({
  id: 'mochi', name: 'Mochi', tagline: 'The pink bunny-bear',
  ears: 'bear',            // 'bear' (fur ears + inner patch) or 'panda' (solid dark ears)
  fur: '#ffd9e4', ear: '#ffd9e4', earInner: '#f39bb5',
  ink: '#5b3140', eye: '#3d1f2a', blush: '#ff9fb8', accent: '#e8475f',
})
```

It shows up automatically in the website's pet cards, playground and gallery. Add a description for it in `PETS_INFO` in `js/site.js`.

## Publishing

Upload the whole folder to any static host (Netlify, Vercel, GitHub Pages, Cloudflare Pages). Once it is live, the snippets in the playground automatically point at your real `petbuddy.js` URL.
