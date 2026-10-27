/*!
 * PetBuddy v1.1: install a cute pet on any website.
 *
 *   <script src="petbuddy.js" defer></script>
 *   <pet-buddy pet="bubu" action="flow" mode="roam"></pet-buddy>
 *   <pet-duo pets="bubu dudu" scene="hug" mode="inline"></pet-duo>
 *
 * Easiest: one line, no other tag and no CSS file needed (styles are built in):
 *   <script src="petbuddy.js" data-pet="dudu" data-action="dance" defer></script>
 *   <script src="petbuddy.js" data-pets="bubu dudu" data-scene="hug" defer></script>
 * Every attribute below also works as data-*, e.g. data-size="120".
 *
 * <pet-buddy> attributes
 *   pet        bubu | dudu | any id added with PetBuddy.register()
 *   action     flow (cycles every action) or one action id, see PetBuddy.actions
 *   mode       roam (walks along the bottom of the screen) | inline (sits where you put it)
 *   size       height-ish in px (default 104 for roam, 160 for inline)
 *   accessory  none | bowtie | flower | crown | headphones
 *   hint       speech bubble text, or "none"
 *   side       right | left, where a roaming pet walks in from
 *   once       play the action once, then just idle
 *
 * <pet-duo> attributes: two pets that play together
 *   pets       two ids, e.g. "bubu dudu"
 *   scene      flow (cycles every scene) or one scene id, see PetBuddy.scenes
 *   mode, size, side, hint, once  as above
 *   accessory  one or two values, e.g. "none bowtie"
 *
 * JavaScript
 *   document.querySelector('pet-buddy').play('dance')
 *   document.querySelector('pet-duo').play('hug')
 *   PetBuddy.register({ id: 'mochi', name: 'Mochi', fur: '#fff', ears: 'bear', ... })
 */
;(function () {
  'use strict'
  // Loaded twice (e.g. two one-line installs)? Reuse the first copy, just add this pet.
  if (window.PetBuddy) { window.PetBuddy.mount(document.currentScript); return }

  // ---------------------------------------------------------------------------
  // Mascots. To add a pet, copy one of these and change the colours.
  // ---------------------------------------------------------------------------
  const MASCOTS = {}
  // Photo pets load their image next to this script, wherever it is hosted.
  const ME = document.currentScript
  const BASE = (ME && ME.src) || location.href
  const ALIASES = { doodoo: 'dudu' }
  const DEFAULTS = {
    ears: 'panda', // panda: solid dark ears | bear: fur ears with an inner patch
    fur: '#fffdfb',
    ear: '#2e2421',
    earInner: '#2e2421',
    feet: null, // null = same as fur
    ink: '#3b2b28', // outlines, mouth
    eye: '#2e2421',
    blush: '#f9aeb6',
    tongue: '#f2706b',
    accent: '#e8475f', // bow tie, headphones
  }
  const mascot = (id) => MASCOTS[id] || MASCOTS[ALIASES[id]] || MASCOTS.bubu
  function register(def) {
    if (!def || !def.id) throw new Error('PetBuddy.register needs an id')
    MASCOTS[def.id] = Object.assign({}, DEFAULTS, { name: def.id }, def)
    document.querySelectorAll('pet-buddy, pet-duo').forEach((el) => el._schedule && el._schedule())
    return MASCOTS[def.id]
  }

  register({
    id: 'bubu',
    name: 'Bubu',
    tagline: 'The fluffy white panda',
    ears: 'panda',
    fur: '#fffdfb',
    ear: '#2e2421',
    ink: '#3b2b28',
    eye: '#2e2421',
    blush: '#f9aeb6',
    accent: '#3b2b28',
  })
  register({
    id: 'dudu',
    name: 'Dudu',
    tagline: 'The cuddly brown bear',
    ears: 'bear',
    fur: '#d8a47f',
    ear: '#d8a47f',
    earInner: '#b9805b',
    ink: '#5a3626',
    eye: '#3a2218',
    blush: '#f7c06c',
    accent: '#e8475f',
  })

  // ---------------------------------------------------------------------------
  // Solo actions
  // ---------------------------------------------------------------------------
  const ACTIONS = [
    { id: 'happy', label: 'Happy', kind: 'mood', about: 'Big smile, little hearts' },
    { id: 'laugh', label: 'Laugh', kind: 'mood', about: 'Giggles so hard it shakes' },
    { id: 'love', label: 'In love', kind: 'mood', about: 'Heart eyes and floating hearts' },
    { id: 'kiss', label: 'Blow a kiss', kind: 'mood', about: 'Winks and sends a heart' },
    { id: 'wink', label: 'Wink', kind: 'mood', about: 'A cheeky little wink', drawn: true },
    { id: 'hug', label: 'Self hug', kind: 'mood', about: 'Squeezes itself, all warm' },
    { id: 'excited', label: 'Excited', kind: 'mood', about: 'Wiggles, then hops' },
    { id: 'cheer', label: 'Cheer', kind: 'move', about: 'Paws up, confetti everywhere' },
    { id: 'surprised', label: 'Surprised', kind: 'mood', about: 'Wide eyes, a nervous drop' },
    { id: 'curious', label: 'Curious', kind: 'mood', about: 'Raises a brow, looks around' },
    { id: 'think', label: 'Thinking', kind: 'mood', about: 'Paw on chin, a little "?"' },
    { id: 'shy', label: 'Shy', kind: 'mood', about: 'Blushes and goes quiet' },
    { id: 'peekaboo', label: 'Peekaboo', kind: 'move', about: 'Covers its eyes, then boo!' },
    { id: 'eat', label: 'Snack time', kind: 'mood', about: 'Munches a cookie, crumbs fly' },
    { id: 'music', label: 'Vibing', kind: 'mood', about: 'Headphones on, head bopping' },
    { id: 'grumpy', label: 'Grumpy', kind: 'mood', about: 'Huffs and puffs' },
    { id: 'cry', label: 'Crying', kind: 'mood', about: 'Squeezed eyes, falling tears' },
    { id: 'dizzy', label: 'Dizzy', kind: 'mood', about: 'Spiral eyes, circling stars' },
    { id: 'yawn', label: 'Yawn & stretch', kind: 'move', about: 'Big stretch, bigger yawn' },
    { id: 'sleepy', label: 'Sleepy', kind: 'mood', about: 'Naps with floating Zzz' },
    { id: 'wave', label: 'Wave', kind: 'move', about: 'Says hello with a paw' },
    { id: 'dance', label: 'Dance', kind: 'move', about: 'Wiggle, hop and twirl' },
    { id: 'jump', label: 'Jump', kind: 'move', about: 'A happy little hop' },
    { id: 'spin', label: 'Backflip', kind: 'move', about: 'Double flip, lands dizzy' },
    { id: 'walk', label: 'Walk', kind: 'move', about: 'Waddles around' },
  ]
  const ACTION_IDS = new Set(ACTIONS.map((a) => a.id))
  const isPhoto = (m) => m.type === 'photo'
  // Photo pets can't wink, drawn pets don't carry a sword.
  const actionsFor = (m) => ACTIONS.filter((a) => (isPhoto(m) ? !a.drawn : !a.photo))
  const FLOW = ['walk', 'happy', 'wave', 'walk', 'curious', 'jump', 'love', 'walk', 'music', 'think', 'surprised', 'shy', 'dance', 'walk',
    'eat', 'laugh', 'kiss', 'walk', 'grumpy', 'cry', 'hug', 'peekaboo', 'cheer', 'walk', 'wink', 'spin', 'walk', 'excited', 'yawn', 'sleepy']
  const MOOD_MS = { happy: 1500, surprised: 1300, curious: 1700, shy: 1700, grumpy: 1600, excited: 1400, dizzy: 2200, love: 2200, cry: 2400,
    laugh: 1900, wink: 1300, kiss: 1500, hug: 2000, eat: 2600, music: 3200, think: 2200 }
  const REACTIONS = ['dance', 'jump', 'shy', 'wave', 'love', 'grumpy', 'surprised', 'laugh', 'wink', 'kiss']

  // ---------------------------------------------------------------------------
  // Together scenes (for <pet-duo>)
  // ---------------------------------------------------------------------------
  const SCENES = [
    { id: 'hug', label: 'Big hug', about: 'Run in for a squishy hug' },
    { id: 'kiss', label: 'Cheek kiss', about: 'A little kiss, a lot of blushing' },
    { id: 'highfive', label: 'High five', about: 'Jump up and slap paws' },
    { id: 'holdhands', label: 'Hold hands', about: 'Walk together, paw in paw' },
    { id: 'dance', label: 'Dance party', about: 'Dance side by side, then flip' },
    { id: 'cheerup', label: 'Cheer up', about: 'One cries, the other comes to help' },
    { id: 'peekaboo', label: 'Peekaboo', about: 'Hides behind a friend, then boo!' },
    { id: 'poke', label: 'Poke war', about: 'Poke, giggle, poke back' },
    { id: 'tickle', label: 'Tickle attack', about: 'Tickles until someone gets dizzy' },
    { id: 'share', label: 'Share a snack', about: 'One has a cookie, both end up munching' },
    { id: 'makeup', label: 'Fight & make up', about: 'A grumpy standoff that ends in a hug' },
    { id: 'nap', label: 'Nap together', about: 'Lean on each other and snooze' },
  ]
  const SCENE_IDS = new Set(SCENES.map((s) => s.id))

  // ---------------------------------------------------------------------------
  // Drawing
  // ---------------------------------------------------------------------------
  const HEART = 'M0 0 c-3 -5 -10 -2 -7 4 l7 6 l7 -6 c3 -6 -4 -9 -7 -4 Z'
  const STAR = 'M0 0 l3 6 6 1 -4.5 4 1 6 -5.5 -3 -5.5 3 1 -6 -4.5 -4 6 -1 Z'
  const DROP = 'M0 0 C-5 8 -5 12 0 12 C5 12 5 8 0 0 Z'

  function ears(m) {
    if (m.ears === 'bear') {
      return [44, 156].map((cx) =>
        `<g class="ear"><circle cx="${cx}" cy="52" r="24" fill="${m.ear}" stroke="${m.ink}" stroke-width="3.5"/><circle cx="${cx}" cy="52" r="12" fill="${m.earInner}"/></g>`).join('')
    }
    return `<circle class="ear" cx="44" cy="50" r="22" fill="${m.ear}"/><circle class="ear" cx="156" cy="50" r="22" fill="${m.ear}"/>`
  }

  const phones = (m, cls) => `<g class="${cls}">
      <path d="M26 104 Q20 20 100 20 Q180 20 174 104" stroke="${m.ink}" stroke-width="7" fill="none" stroke-linecap="round"/>
      <rect x="10" y="86" width="24" height="40" rx="11" fill="${m.accent}" stroke="${m.ink}" stroke-width="3"/>
      <rect x="166" y="86" width="24" height="40" rx="11" fill="${m.accent}" stroke="${m.ink}" stroke-width="3"/>
    </g>`

  function accessory(kind, m) {
    if (kind === 'bowtie') {
      return `<g class="acc"><path d="M100 153 L82 143 Q78 153 82 163 Z M100 153 L118 143 Q122 153 118 163 Z" fill="${m.accent}" stroke="${m.ink}" stroke-width="2.5" stroke-linejoin="round"/><circle cx="100" cy="153" r="5.5" fill="${m.accent}" stroke="${m.ink}" stroke-width="2.5"/></g>`
    }
    if (kind === 'flower') {
      const petals = [0, 72, 144, 216, 288].map((a) => {
        const r = (a * Math.PI) / 180
        return `<circle cx="${(158 + Math.cos(r) * 9).toFixed(1)}" cy="${(38 + Math.sin(r) * 9).toFixed(1)}" r="7.5" fill="#ffb3c4" stroke="${m.ink}" stroke-width="2"/>`
      }).join('')
      return `<g class="acc">${petals}<circle cx="158" cy="38" r="5.5" fill="#ffd45e" stroke="${m.ink}" stroke-width="2"/></g>`
    }
    if (kind === 'crown') {
      return `<g class="acc"><path d="M74 38 L70 12 L87 26 L100 6 L113 26 L130 12 L126 38 Q100 30 74 38 Z" fill="#ffd45e" stroke="${m.ink}" stroke-width="3" stroke-linejoin="round"/><circle cx="100" cy="24" r="3.5" fill="#e8475f"/></g>`
    }
    if (kind === 'headphones') return phones(m, 'acc')
    return ''
  }

  // Effects drawn around the head: hearts, Zzz, stars, tears and friends.
  function effects(m) {
    const s = `stroke="${m.ink}" stroke-width="3.5"`
    const confetti = ['#ff7a8a', '#ffd45e', '#8fd0f5', '#9fd6a6', '#c9a8ff', '#ff7a8a', '#ffd45e', '#8fd0f5']
      .map((c, i) => `<g class="cf"><rect x="${22 + i * 22}" y="${-6 - (i % 3) * 10}" width="7" height="11" rx="2" fill="${c}" transform="rotate(${i * 37} ${25 + i * 22} ${-1 - (i % 3) * 10})"/></g>`).join('')
    return `
      <g class="fx fx-spark" fill="#f28a9c"><path transform="translate(28 108)" d="${HEART}"/><path transform="translate(172 108)" d="${HEART}"/></g>
      <g class="fx fx-love" fill="#e8475f">
        <g class="fh"><path transform="translate(30 92) scale(.9)" d="${HEART}"/></g>
        <g class="fh"><path transform="translate(170 80)" d="${HEART}"/></g>
        <g class="fh"><path transform="translate(152 40) scale(.7)" d="${HEART}"/></g>
      </g>
      <g class="fx fx-zzz" fill="#7a6a66" font-family="system-ui, sans-serif" font-weight="800">
        <text x="150" y="44" font-size="18">z</text><text x="150" y="44" font-size="22">z</text><text x="150" y="44" font-size="26">Z</text>
      </g>
      <path class="fx fx-sweat" d="M170 74 C164 84 164 90 170 90 C176 90 176 84 170 74 Z" fill="#8fd0f5" stroke="${m.ink}" stroke-width="2.5"/>
      <g class="fx fx-stars" fill="#f5c542" stroke="${m.ink}" stroke-width="2" stroke-linejoin="round">
        <path transform="translate(40 30)" d="${STAR}"/><path transform="translate(160 30)" d="${STAR}"/><path transform="translate(100 4)" d="${STAR}"/>
      </g>
      <g class="fx fx-anger" stroke="#e0483e" stroke-width="3.5" stroke-linecap="round" fill="none">
        <path d="M150 66 q6 -2 4 -8 M162 66 q-6 -2 -4 -8 M150 72 q6 2 4 8 M162 72 q-6 2 -4 8"/>
      </g>
      <g class="fx fx-shy" stroke="#e88a97" stroke-width="2.5" stroke-linecap="round">
        <path d="M44 132 l4 -6 M52 134 l4 -6 M140 134 l4 -6 M148 132 l4 -6"/>
      </g>
      <g class="fx fx-tears" fill="#8fd0f5" stroke="${m.ink}" stroke-width="2">
        <g class="tear"><path transform="translate(70 122)" d="${DROP}"/></g>
        <g class="tear"><path transform="translate(130 122)" d="${DROP}"/></g>
      </g>
      <g class="fx fx-haha" fill="${m.ink}" font-family="system-ui, sans-serif" font-weight="900" font-style="italic">
        <g class="ha"><text x="156" y="70" font-size="20">ha</text></g><g class="ha"><text x="12" y="62" font-size="16">ha</text></g>
      </g>
      <g class="fx fx-kiss" fill="#e8475f"><g class="kh"><path transform="translate(118 126)" d="${HEART}"/></g></g>
      ${phones(m, 'fx fx-phones')}
      <g class="fx fx-notes" fill="${m.ink}" font-family="system-ui, sans-serif" font-weight="700">
        <g class="nt"><text x="172" y="66" font-size="24">\u266A</text></g><g class="nt"><text x="6" y="74" font-size="20">\u266B</text></g>
      </g>
      <g class="fx fx-think">
        <circle cx="154" cy="74" r="3.5" fill="#fff" stroke="${m.ink}" stroke-width="2"/>
        <circle cx="166" cy="58" r="6" fill="#fff" stroke="${m.ink}" stroke-width="2"/>
        <ellipse cx="184" cy="30" rx="19" ry="16" fill="#fff" stroke="${m.ink}" stroke-width="2.5"/>
        <text x="177" y="39" font-size="24" font-weight="900" font-family="system-ui, sans-serif" fill="${m.ink}">?</text>
      </g>
      <ellipse class="fx fx-chin" cx="116" cy="150" rx="11" ry="9" fill="${m.fur}" ${s}/>
      <g class="fx fx-cookie">
        <circle cx="100" cy="158" r="17" fill="#d99a52" stroke="${m.ink}" stroke-width="3"/>
        <circle cx="93" cy="153" r="2.6" fill="#5a3626"/><circle cx="104" cy="163" r="2.6" fill="#5a3626"/><circle cx="96" cy="166" r="2" fill="#5a3626"/><circle cx="106" cy="152" r="2" fill="#5a3626"/>
        <circle class="bite" cx="114" cy="146" r="8" fill="${m.fur}"/>
      </g>
      <g class="fx fx-crumbs" fill="#d99a52">
        <g class="cr"><circle cx="90" cy="176" r="2.5"/></g><g class="cr"><circle cx="110" cy="178" r="2"/></g><g class="cr"><circle cx="100" cy="180" r="2.2"/></g>
      </g>
      <g class="fx fx-paws">
        <ellipse cx="72" cy="116" rx="16" ry="13" fill="${m.fur}" ${s}/><ellipse cx="128" cy="116" rx="16" ry="13" fill="${m.fur}" ${s}/>
      </g>
      <g class="fx fx-confetti">${confetti}</g>
    `
  }

  function drawPhoto(m) {
    const h = m.head || { x: 0.5, y: 0.3, w: 0.6 }
    return `<div class="photo-wrap">
      <img class="photo" src="${esc(new URL(m.src, BASE).href)}" alt="" draggable="false">
      <svg class="photo-fx is-face" style="left:${h.x * 100}%;top:${h.y * 100}%;width:${h.w * 100}%" viewBox="0 0 200 224" aria-hidden="true">${effects(m)}</svg>
      <svg class="photo-fx is-aura" style="left:${h.x * 100}%;top:${h.y * 100}%;width:${h.w * 180}%" viewBox="0 0 200 224" aria-hidden="true">${effects(m)}</svg>
      <svg class="slash" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <path d="M2 40 Q30 -6 70 6 Q92 14 98 40 Q80 22 60 18 Q30 14 2 40 Z" fill="#fff"/>
      </svg>
    </div>`
  }

  function drawPet(m, acc) {
    if (isPhoto(m)) return drawPhoto(m)
    const feet = m.feet || m.fur
    const s = `stroke="${m.ink}" stroke-width="3.5"`
    return `<svg viewBox="0 0 200 224" aria-hidden="true">
      ${ears(m)}
      <ellipse class="foot foot-l" cx="78" cy="204" rx="16" ry="10" fill="${feet}" ${s}/>
      <ellipse class="foot foot-r" cx="122" cy="204" rx="16" ry="10" fill="${feet}" ${s}/>
      <path d="M100 32 C152 32 184 64 184 106 C184 132 170 148 150 156 C153 178 150 194 140 204 L60 204 C50 194 47 178 50 156 C30 148 16 132 16 106 C16 64 48 32 100 32 Z" fill="${m.fur}" ${s}/>
      <ellipse class="arm arm-l" cx="52" cy="174" rx="10" ry="16" fill="${m.fur}" ${s}/>
      <ellipse class="arm arm-r" cx="148" cy="174" rx="10" ry="16" fill="${m.fur}" ${s}/>
      ${accessory(acc, m)}
      <rect class="brow brow-l" x="63" y="94" width="16" height="4" rx="2" fill="${m.ink}"/>
      <rect class="brow brow-r" x="121" y="94" width="16" height="4" rx="2" fill="${m.ink}"/>
      <circle class="blush" cx="52" cy="134" r="13" fill="${m.blush}"/>
      <circle class="blush" cx="148" cy="134" r="13" fill="${m.blush}"/>

      <g class="part eye-normal">
        <ellipse cx="72" cy="114" rx="7.5" ry="8.5" fill="${m.eye}"/>
        <ellipse cx="128" cy="114" rx="7.5" ry="8.5" fill="${m.eye}"/>
        <g class="pupils"><circle cx="74.5" cy="111" r="2.6" fill="#fff"/><circle cx="130.5" cy="111" r="2.6" fill="#fff"/></g>
      </g>
      <g class="part eye-happy" stroke="${m.eye}" stroke-width="4.5" stroke-linecap="round" fill="none">
        <path d="M63 117 Q72 105 81 117"/><path d="M119 117 Q128 105 137 117"/>
      </g>
      <g class="part eye-sleep" stroke="${m.eye}" stroke-width="4" stroke-linecap="round" fill="none">
        <path d="M63 113 Q72 121 81 113"/><path d="M119 113 Q128 121 137 113"/>
      </g>
      <g class="part eye-wow">
        <ellipse cx="72" cy="113" rx="10" ry="12" fill="${m.eye}"/><ellipse cx="128" cy="113" rx="10" ry="12" fill="${m.eye}"/>
        <circle cx="75.5" cy="108" r="3.8" fill="#fff"/><circle cx="131.5" cy="108" r="3.8" fill="#fff"/>
        <circle cx="69" cy="118" r="1.8" fill="#fff"/><circle cx="125" cy="118" r="1.8" fill="#fff"/>
      </g>
      <g class="part eye-dizzy" stroke="${m.eye}" stroke-width="3" stroke-linecap="round" fill="none">
        <path d="M72 114 m-1.5 0 a1.5 1.5 0 1 1 3 0 a3.5 3.5 0 1 1 -7 0 a5.5 5.5 0 1 1 11 0 a7.5 7.5 0 1 1 -15 0"/>
        <path d="M128 114 m-1.5 0 a1.5 1.5 0 1 1 3 0 a3.5 3.5 0 1 1 -7 0 a5.5 5.5 0 1 1 11 0 a7.5 7.5 0 1 1 -15 0"/>
      </g>
      <g class="part eye-love" fill="#e8475f" stroke="${m.ink}" stroke-width="1.5">
        <g class="lh"><path transform="translate(72 108) scale(1.35)" d="${HEART}"/></g>
        <g class="lh"><path transform="translate(128 108) scale(1.35)" d="${HEART}"/></g>
      </g>
      <g class="part eye-cry" stroke="${m.eye}" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" fill="none">
        <path d="M65 106 L79 114 L65 122"/><path d="M135 106 L121 114 L135 122"/>
      </g>
      <g class="part eye-wink">
        <path d="M63 117 Q72 105 81 117" stroke="${m.eye}" stroke-width="4.5" stroke-linecap="round" fill="none"/>
        <ellipse cx="128" cy="114" rx="7.5" ry="8.5" fill="${m.eye}"/><circle cx="130.5" cy="111" r="2.6" fill="#fff"/>
      </g>
      <g class="part eye-think">
        <ellipse cx="72" cy="114" rx="7.5" ry="8.5" fill="${m.eye}"/><ellipse cx="128" cy="114" rx="7.5" ry="8.5" fill="${m.eye}"/>
        <circle cx="76" cy="108" r="2.8" fill="#fff"/><circle cx="132" cy="108" r="2.8" fill="#fff"/>
      </g>

      <path class="part m-idle" d="M89 124 Q94.5 133 100 125 Q105.5 133 111 124" stroke="${m.ink}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      <g class="part m-open">
        <path d="M88 123 Q100 123 112 123 Q110 142 100 142 Q90 142 88 123 Z" fill="${m.ink}"/>
        <path d="M93 136 Q100 131 107 136 Q105 141 100 141 Q95 141 93 136 Z" fill="${m.tongue}"/>
      </g>
      <ellipse class="part m-o" cx="100" cy="130" rx="5.5" ry="7" fill="${m.ink}"/>
      <ellipse class="part m-sleep" cx="100" cy="129" rx="3.5" ry="3" fill="${m.ink}"/>
      <path class="part m-flat" d="M91 131 Q100 123 109 131" stroke="${m.ink}" stroke-width="3" stroke-linecap="round" fill="none"/>
      <path class="part m-wavy" d="M86 129 q3.5 -5 7 0 t7 0 t7 0 t7 0" stroke="${m.ink}" stroke-width="3" stroke-linecap="round" fill="none"/>
      <path class="part m-wail" d="M89 137 Q100 118 111 137 Q100 133 89 137 Z" fill="${m.ink}" stroke="${m.ink}" stroke-width="2" stroke-linejoin="round"/>
      <path class="part m-kiss" d="M97 122 q8 3 0 6.5 q8 3 0 6.5" stroke="${m.ink}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      <path class="part m-hmm" d="M93 131 L108 127" stroke="${m.ink}" stroke-width="3" stroke-linecap="round"/>
      <g class="part m-yawn"><ellipse cx="100" cy="133" rx="8" ry="11" fill="${m.ink}"/><ellipse cx="100" cy="139" rx="5" ry="3.5" fill="${m.tongue}"/></g>
      <g class="part m-chew"><ellipse cx="100" cy="130" rx="6.5" ry="4.5" fill="${m.ink}"/></g>

      ${effects(m)}
    </svg>`
  }

  // ---------------------------------------------------------------------------
  // Styles (scoped inside each pet's shadow root)
  // ---------------------------------------------------------------------------
  const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)'
  const CSS = `
  :host { display: contents; }
  .pet { --pb-size: var(--pb-base, 104px); --pb-pad: 18px; --pb-lift: 0px;
    position: relative; width: var(--pb-size); height: calc(var(--pb-size) * 1.12); touch-action: manipulation; }
  .pet.is-inline { display: inline-block; vertical-align: bottom; }
  .pet.is-roam { position: fixed; left: 0; bottom: calc(var(--pb-pad) + var(--pb-lift) + env(safe-area-inset-bottom, 0px));
    z-index: var(--pb-z, 2147483000); will-change: transform; touch-action: none; }
  @media (max-width: 640px) { .pet.is-roam { --pb-size: calc(var(--pb-base, 104px) * 0.78); --pb-pad: 12px; --pb-lift: 38px; } }
  .lean, .bob { width: 100%; height: 100%; transform-origin: 50% 100%; }
  .flip { width: 100%; height: 100%; transition: transform .25s ${EASE}; }
  .flip.is-left { transform: scaleX(-1); }
  .body { display: block; width: 100%; height: 100%; cursor: pointer; padding: 0; margin: 0; border: 0; background: transparent;
    user-select: none; -webkit-user-select: none; -webkit-tap-highlight-color: transparent; font: inherit; color: inherit; }
  .is-roam .body { cursor: grab; touch-action: none; }
  .pet.is-dragging .body { cursor: grabbing; }
  .body:focus-visible { outline: 3px solid #ff7a8a; outline-offset: 6px; border-radius: 50%; }
  svg { display: block; width: 100%; height: 100%; overflow: visible; pointer-events: none; filter: drop-shadow(0 6px 10px rgb(20 19 18 / .18)); }

  .hint { position: absolute; bottom: calc(100% + 6px); right: 30%; white-space: nowrap; pointer-events: none; z-index: 3;
    padding: 7px 11px; border-radius: 14px 14px 4px 14px; font: 500 13px/1.3 system-ui, -apple-system, 'Segoe UI', sans-serif;
    background: #fff; color: #2b201d; box-shadow: 0 10px 30px -12px rgb(0 0 0 / .35), inset 0 0 0 1px rgb(20 19 18 / .08);
    transition: opacity .3s, transform .3s ${EASE}; }
  .is-inline .hint, .duo .hint { right: auto; left: 50%; transform: translateX(-50%); border-radius: 14px; }
  .is-roam.hint-r .hint { right: auto; left: 30%; border-radius: 14px 14px 14px 4px; }
  .hint.is-gone { opacity: 0; transform: translateY(6px); }
  .is-inline .hint.is-gone, .duo .hint.is-gone { transform: translate(-50%, 6px); }

  .pet:not(.is-walking):not(.is-air) .bob { animation: pb-breathe 2.6s ease-in-out infinite; }
  @keyframes pb-breathe { 50% { transform: scale(1.025, .975); } }
  .pet.is-walking .bob { animation: pb-waddle .42s ease-in-out infinite alternate; }
  .pet.is-running .bob { animation-duration: .22s; }
  @keyframes pb-waddle { from { transform: rotate(-4deg); } 50% { transform: translateY(-4%); } to { transform: rotate(4deg); } }

  svg .foot, svg .arm, svg .ear, svg .brow, svg .blush, svg .part, svg .fx, svg .lh, svg .fh, svg .tear, svg .acc,
  svg .ha, svg .kh, svg .nt, svg .cf, svg .cr, svg .bite, svg .m-chew { transform-box: fill-box; transform-origin: center; }
  svg .arm { transition: transform .3s ${EASE}; }
  svg .arm-l { transform-origin: 80% 15%; }
  svg .arm-r { transform-origin: 20% 15%; }
  .is-walking svg .foot-l { animation: pb-step .42s ease-in-out infinite alternate; }
  .is-walking svg .foot-r { animation: pb-step .42s ease-in-out infinite alternate-reverse; }
  .is-running svg .foot { animation-duration: .22s; }
  @keyframes pb-step { to { transform: translateY(-7px); } }
  .is-walking svg .arm-l { animation: pb-swing-l .42s ease-in-out infinite alternate; }
  .is-walking svg .arm-r { animation: pb-swing-r .42s ease-in-out infinite alternate; }
  @keyframes pb-swing-l { from { transform: rotate(-14deg); } to { transform: rotate(18deg); } }
  @keyframes pb-swing-r { from { transform: rotate(-18deg); } to { transform: rotate(14deg); } }
  .is-air svg .foot-l { transform: translate(-3px, 4px) rotate(-15deg); }
  .is-air svg .foot-r { transform: translate(3px, 4px) rotate(15deg); }
  .is-air svg .arm-l { transform: rotate(60deg); }
  .is-air svg .arm-r { transform: rotate(-60deg); }
  .is-dragging svg .foot-l { animation: pb-kick .25s ease-in-out infinite alternate; }
  .is-dragging svg .foot-r { animation: pb-kick .25s ease-in-out infinite alternate-reverse; }
  @keyframes pb-kick { from { transform: translateY(2px) rotate(-12deg); } to { transform: translateY(8px) rotate(12deg); } }

  svg .eye-normal, svg .eye-wow { transition: transform .07s, opacity .12s; }
  .is-blink svg .eye-normal, .is-blink svg .eye-wow { transform: scaleY(.08); }
  svg .pupils { transition: transform .25s ${EASE}; }

  .part, .fx { opacity: 0; transition: opacity .12s; }
  .brow { opacity: 0; transition: transform .3s ${EASE}, opacity .2s; }
  .blush { opacity: .85; transition: transform .3s ${EASE}, opacity .3s; }
  svg .ear { transition: transform .25s ${EASE}; }
  [data-mood='normal'] .eye-normal, [data-mood='normal'] .m-idle,
  [data-mood='curious'] .eye-normal, [data-mood='curious'] .m-o,
  [data-mood='happy'] .eye-happy, [data-mood='happy'] .m-open, [data-mood='happy'] .fx-spark,
  [data-mood='surprised'] .eye-wow, [data-mood='surprised'] .m-o, [data-mood='surprised'] .fx-sweat,
  [data-mood='excited'] .eye-wow, [data-mood='excited'] .m-open,
  [data-mood='sleepy'] .eye-sleep, [data-mood='sleepy'] .m-sleep, [data-mood='sleepy'] .fx-zzz,
  [data-mood='dizzy'] .eye-dizzy, [data-mood='dizzy'] .m-wavy, [data-mood='dizzy'] .fx-stars,
  [data-mood='grumpy'] .eye-normal, [data-mood='grumpy'] .m-flat, [data-mood='grumpy'] .fx-anger,
  [data-mood='shy'] .eye-happy, [data-mood='shy'] .m-idle, [data-mood='shy'] .fx-shy,
  [data-mood='love'] .eye-love, [data-mood='love'] .m-open, [data-mood='love'] .fx-love,
  [data-mood='cry'] .eye-cry, [data-mood='cry'] .m-wail, [data-mood='cry'] .fx-tears,
  [data-mood='laugh'] .eye-happy, [data-mood='laugh'] .m-open, [data-mood='laugh'] .fx-haha,
  [data-mood='wink'] .eye-wink, [data-mood='wink'] .m-idle, [data-mood='wink'] .fx-spark,
  [data-mood='kiss'] .eye-wink, [data-mood='kiss'] .m-kiss, [data-mood='kiss'] .fx-kiss,
  [data-mood='hug'] .eye-happy, [data-mood='hug'] .m-idle, [data-mood='hug'] .fx-love,
  [data-mood='eat'] .eye-happy, [data-mood='eat'] .m-chew, [data-mood='eat'] .fx-cookie, [data-mood='eat'] .fx-crumbs,
  [data-mood='music'] .eye-sleep, [data-mood='music'] .m-idle, [data-mood='music'] .fx-phones, [data-mood='music'] .fx-notes,
  [data-mood='think'] .eye-think, [data-mood='think'] .m-hmm, [data-mood='think'] .fx-think, [data-mood='think'] .fx-chin,
  [data-mood='yawn'] .eye-sleep, [data-mood='yawn'] .m-yawn,
  [data-mood='cheer'] .eye-happy, [data-mood='cheer'] .m-open, [data-mood='cheer'] .fx-confetti,
  [data-mood='peek'] .m-idle, [data-mood='peek'] .fx-paws, [data-mood='peek'] .fx-shy { opacity: 1; }
  [data-mood='music'] .acc { opacity: 0; }
  [data-mood='curious'] .brow-r, [data-mood='think'] .brow-r { opacity: 1; transform: translateY(-6px) rotate(14deg); }
  [data-mood='happy'] .brow, [data-mood='excited'] .brow, [data-mood='love'] .brow, [data-mood='laugh'] .brow, [data-mood='cheer'] .brow { opacity: 1; transform: translateY(-8px); }
  [data-mood='wink'] .brow-r, [data-mood='kiss'] .brow-r { opacity: 1; transform: translateY(-8px); }
  [data-mood='surprised'] .brow { opacity: 1; transform: translateY(-13px); }
  [data-mood='grumpy'] .brow-l { opacity: 1; transform: translateY(2px) rotate(20deg); }
  [data-mood='grumpy'] .brow-r { opacity: 1; transform: translateY(2px) rotate(-20deg); }
  [data-mood='cry'] .brow-l { opacity: 1; transform: translateY(-6px) rotate(-18deg); }
  [data-mood='cry'] .brow-r { opacity: 1; transform: translateY(-6px) rotate(18deg); }
  [data-mood='grumpy'] .blush, [data-mood='shy'] .blush, [data-mood='love'] .blush, [data-mood='kiss'] .blush,
  [data-mood='hug'] .blush, [data-mood='peek'] .blush, [data-mood='laugh'] .blush { opacity: 1; transform: scale(1.25); }
  [data-mood='happy'] .arm-l, [data-mood='excited'] .arm-l, [data-mood='love'] .arm-l, [data-mood='laugh'] .arm-l { transform: rotate(40deg); }
  [data-mood='happy'] .arm-r, [data-mood='excited'] .arm-r, [data-mood='love'] .arm-r, [data-mood='laugh'] .arm-r { transform: rotate(-40deg); }
  [data-mood='shy'] .arm-l, [data-mood='cry'] .arm-l { transform: rotate(-35deg) translate(6px, -4px); }
  [data-mood='shy'] .arm-r, [data-mood='cry'] .arm-r { transform: rotate(35deg) translate(-6px, -4px); }
  [data-mood='hug'] .arm-l, [data-mood='eat'] .arm-l { transform: rotate(-58deg) translate(10px, -8px); }
  [data-mood='hug'] .arm-r, [data-mood='eat'] .arm-r { transform: rotate(58deg) translate(-10px, -8px); }
  [data-mood='yawn'] .arm-l { transform: rotate(150deg); }
  [data-mood='yawn'] .arm-r { transform: rotate(-150deg); }
  [data-mood='kiss'] .arm-r { transform: rotate(-70deg); }
  [data-mood='surprised'] .ear, [data-mood='love'] .ear, [data-mood='cheer'] .ear { transform: translateY(-5px); }

  [data-mood='dizzy'] .eye-dizzy path { animation: pb-spin .8s linear infinite; transform-box: fill-box; transform-origin: center; }
  [data-mood='dizzy'] .fx-stars { animation: pb-spin 1.4s linear infinite; transform-box: view-box; transform-origin: 100px 40px; }
  @keyframes pb-spin { to { transform: rotate(360deg); } }
  [data-mood='sleepy'] .fx-zzz text { opacity: 0; animation: pb-zz 2.4s ease-out infinite; }
  [data-mood='sleepy'] .fx-zzz text:nth-child(2) { animation-delay: .8s; }
  [data-mood='sleepy'] .fx-zzz text:nth-child(3) { animation-delay: 1.6s; }
  @keyframes pb-zz { 20% { opacity: 1; } 100% { transform: translate(18px, -40px); opacity: 0; } }
  [data-mood='sleepy'] .bob { animation-duration: 3.6s !important; }
  [data-mood='surprised'] .fx-sweat { animation: pb-drip .9s ease-in infinite; }
  @keyframes pb-drip { from { transform: translateY(-3px); } to { transform: translateY(5px); } }
  [data-mood='grumpy'] .fx-anger { animation: pb-throb .5s ease-in-out infinite alternate; }
  @keyframes pb-throb { to { transform: scale(1.25); } }
  [data-mood='grumpy'] .bob { animation: pb-huff .5s ease-in-out infinite alternate !important; }
  @keyframes pb-huff { to { transform: scale(1.05, .96); } }
  [data-mood='excited'] .bob { animation: pb-jitter .12s linear infinite alternate !important; }
  @keyframes pb-jitter { from { transform: rotate(-2deg); } to { transform: rotate(2deg); } }
  [data-mood='love'] .lh { animation: pb-beat .6s ease-in-out infinite; }
  @keyframes pb-beat { 30% { transform: scale(1.25); } 60% { transform: scale(.95); } }
  [data-mood='love'] .fh, [data-mood='hug'] .fh { opacity: 0; animation: pb-float 1.8s ease-out infinite; }
  .fh:nth-child(2) { animation-delay: .6s !important; }
  .fh:nth-child(3) { animation-delay: 1.2s !important; }
  @keyframes pb-float { 15% { opacity: 1; } 100% { transform: translateY(-46px) scale(1.3); opacity: 0; } }
  [data-mood='cry'] .tear { animation: pb-tear 1s ease-in infinite; }
  [data-mood='cry'] .tear:nth-child(2) { animation-delay: .45s; }
  @keyframes pb-tear { 0% { transform: translateY(0) scale(.6); opacity: 0; } 20% { opacity: 1; } 100% { transform: translateY(34px) scale(1); opacity: 0; } }
  [data-mood='cry'] .bob { animation: pb-sob .35s ease-in-out infinite alternate !important; }
  @keyframes pb-sob { to { transform: translateY(2%) scale(1.02, .97); } }

  [data-mood='laugh'] .bob { animation: pb-laugh .16s ease-in-out infinite alternate !important; }
  @keyframes pb-laugh { from { transform: rotate(-3deg) scale(1.02, .98); } to { transform: rotate(3deg) translateY(-2%); } }
  [data-mood='laugh'] .ha { animation: pb-ha .5s ${EASE} infinite alternate; }
  [data-mood='laugh'] .ha:nth-child(2) { animation-delay: .25s; }
  @keyframes pb-ha { from { transform: scale(.7) rotate(-8deg); } to { transform: scale(1.15) rotate(8deg); } }
  [data-mood='kiss'] .kh { animation: pb-kiss 1.2s ease-out .2s both; }
  @keyframes pb-kiss { 0% { transform: scale(.4); opacity: 0; } 20% { opacity: 1; } 100% { transform: translate(52px, -40px) scale(1.9); opacity: 0; } }
  [data-mood='hug'] .bob { animation: pb-squeeze .7s ease-in-out infinite alternate !important; }
  @keyframes pb-squeeze { to { transform: scale(.96, 1.03); } }
  [data-mood='eat'] .m-chew { animation: pb-chew .22s ease-in-out infinite alternate; }
  @keyframes pb-chew { from { transform: scaleY(.35); } to { transform: scaleY(1.2); } }
  [data-mood='eat'] .fx-cookie { animation: pb-nom .44s ease-in-out infinite alternate; }
  @keyframes pb-nom { to { transform: translateY(-7px) rotate(-6deg); } }
  [data-mood='eat'] .bite { animation: pb-bite 2.6s steps(3) forwards; }
  @keyframes pb-bite { to { transform: scale(1.6); } }
  [data-mood='eat'] .cr { animation: pb-crumb .7s ease-in infinite; }
  [data-mood='eat'] .cr:nth-child(2) { animation-delay: .25s; }
  [data-mood='eat'] .cr:nth-child(3) { animation-delay: .5s; }
  @keyframes pb-crumb { from { transform: translateY(-6px); opacity: 1; } to { transform: translateY(22px); opacity: 0; } }
  [data-mood='music'] .bob { animation: pb-bop .5s ease-in-out infinite alternate !important; }
  @keyframes pb-bop { from { transform: rotate(-6deg); } to { transform: rotate(6deg) translateY(-2%); } }
  [data-mood='music'] .nt { animation: pb-note 1.4s ease-out infinite; }
  [data-mood='music'] .nt:nth-child(2) { animation-delay: .7s; }
  @keyframes pb-note { 0% { opacity: 0; transform: translateY(6px); } 25% { opacity: 1; } 100% { opacity: 0; transform: translate(10px, -34px) rotate(15deg); } }
  [data-mood='think'] .fx-think { animation: pb-thinkpop .45s ${EASE} both; transform-origin: 30% 100%; }
  @keyframes pb-thinkpop { from { transform: scale(.3); opacity: 0; } }
  [data-mood='think'] .bob { animation: pb-ponder 1.6s ease-in-out infinite alternate !important; }
  @keyframes pb-ponder { to { transform: rotate(4deg); } }
  [data-mood='yawn'] .bob { animation: pb-stretch 1.6s ${EASE} both !important; }
  @keyframes pb-stretch { 40%, 70% { transform: scale(.95, 1.08); } }
  [data-mood='cheer'] .arm-l { animation: pb-cheer-l .3s ease-in-out infinite alternate; }
  [data-mood='cheer'] .arm-r { animation: pb-cheer-r .3s ease-in-out infinite alternate-reverse; }
  @keyframes pb-cheer-l { from { transform: rotate(120deg); } to { transform: rotate(160deg); } }
  @keyframes pb-cheer-r { from { transform: rotate(-120deg); } to { transform: rotate(-160deg); } }
  [data-mood='cheer'] .cf { animation: pb-confetti 1.3s ease-in infinite; }
  [data-mood='cheer'] .cf:nth-child(even) { animation-delay: .4s; }
  [data-mood='cheer'] .cf:nth-child(3n) { animation-delay: .8s; }
  @keyframes pb-confetti { 0% { transform: translateY(-10px) rotate(0); opacity: 0; } 15% { opacity: 1; } 100% { transform: translateY(110px) rotate(260deg); opacity: 0; } }
  [data-mood='peek'] .fx-paws { animation: pb-peek 1.3s ease-in-out infinite; }
  @keyframes pb-peek { 50% { transform: translateY(3px); } }

  .pb--dance .bob { animation: pb-dance 1.3s ${EASE} !important; }
  .pb--dance svg .arm-l { animation: pb-wave-l .32s ease-in-out 4 alternate; }
  .pb--dance svg .arm-r { animation: pb-wave-r .32s ease-in-out 4 alternate; }
  @keyframes pb-dance {
    15% { transform: translateY(-14%) rotate(-14deg); } 30% { transform: scale(1.07, .93); }
    45% { transform: translateY(-14%) rotate(14deg); } 60% { transform: scale(1.07, .93); }
    80% { transform: translateY(-24%) rotate(360deg); } 100% { transform: rotate(360deg); }
  }
  @keyframes pb-wave-l { from { transform: rotate(10deg); } to { transform: rotate(80deg); } }
  @keyframes pb-wave-r { from { transform: rotate(-10deg); } to { transform: rotate(-80deg); } }
  .pb--wave svg .arm-r { animation: pb-hello .28s ease-in-out 6 alternate; }
  @keyframes pb-hello { from { transform: rotate(-110deg); } to { transform: rotate(-150deg); } }
  .pb--spin .bob { transform-origin: 50% 55%; animation: pb-flip .9s ${EASE} !important; }
  @keyframes pb-flip { to { transform: rotate(-720deg); } }

  /* poses, used when two pets play together */
  .pose-reach svg .arm-r { transform: rotate(-80deg); }
  .pose-hug svg .arm-r { transform: rotate(-100deg) translateY(-4px); }
  .pose-hug svg .arm-l { transform: rotate(-50deg) translate(10px, -8px); }
  .pose-high svg .arm-r { transform: rotate(-160deg); }
  .pose-hold-r svg .arm-r { transform: rotate(-52deg); }
  .pose-hold-l svg .arm-l { transform: rotate(52deg); }
  .pose-hold-r.is-walking svg .arm-r, .pose-hold-l.is-walking svg .arm-l { animation: none; }
  .pose-pat svg .arm-r { animation: pb-pat .3s ease-in-out infinite alternate; }
  @keyframes pb-pat { from { transform: rotate(-125deg); } to { transform: rotate(-150deg); } }
  .pose-poke svg .arm-r { animation: pb-poke .18s ease-in-out infinite alternate; }
  @keyframes pb-poke { from { transform: rotate(-55deg); } to { transform: rotate(-95deg) translateY(-6px); } }
  .pose-tickle svg .arm-r { animation: pb-tk-r .12s linear infinite alternate; }
  .pose-tickle svg .arm-l { animation: pb-tk-l .12s linear infinite alternate-reverse; }
  @keyframes pb-tk-r { from { transform: rotate(-70deg); } to { transform: rotate(-100deg); } }
  @keyframes pb-tk-l { from { transform: rotate(-30deg) translate(8px, -6px); } to { transform: rotate(-55deg) translate(8px, -6px); } }

  /* two pets together */
  .duo { --gap: calc(var(--pb-base) * .12); position: relative; display: inline-flex; align-items: flex-end; gap: var(--gap); vertical-align: bottom; }
  .duo.is-roam { position: fixed; left: 0; bottom: calc(18px + env(safe-area-inset-bottom, 0px)); z-index: var(--pb-z, 2147483000); will-change: transform; transition-timing-function: linear; }
  @media (max-width: 640px) { .duo.is-roam { bottom: calc(50px + env(safe-area-inset-bottom, 0px)); } .duo.is-roam .pet { --pb-size: calc(var(--pb-base) * .78); } }
  .slot { position: relative; z-index: 1; transform: translateX(var(--dx, 0px)) rotate(var(--tilt, 0deg)); transform-origin: 50% 100%;
    transition: transform var(--t, 600ms) ${EASE}; }
  .slot.is-front { z-index: 2; }
  .slot.is-back { z-index: 0; }
  .duo__fx { position: absolute; inset: 0; pointer-events: none; z-index: 4; }
  .dfx { position: absolute; left: var(--x, 50%); top: var(--y, 20%); transform: translate(-50%, -50%); font: 900 calc(var(--pb-base) * .26)/1 system-ui, sans-serif; white-space: nowrap; }
  .dfx-heart { color: #e8475f; font-size: calc(var(--pb-base) * .42); animation: pb-dheart 1.8s ${EASE} forwards; text-shadow: 0 4px 12px rgb(232 71 95 / .35); }
  @keyframes pb-dheart { 0% { transform: translate(-50%, -20%) scale(0); } 25% { transform: translate(-50%, -50%) scale(1.25); } 45% { transform: translate(-50%, -50%) scale(.95); } 70% { opacity: 1; } 100% { transform: translate(-50%, -110%) scale(1.1); opacity: 0; } }
  .dfx-clap { color: #f5b82e; font-size: calc(var(--pb-base) * .5); animation: pb-clap .9s ${EASE} forwards; }
  @keyframes pb-clap { 0% { transform: translate(-50%, -50%) scale(.2) rotate(-20deg); opacity: 0; } 30% { opacity: 1; transform: translate(-50%, -50%) scale(1.3) rotate(10deg); } 100% { transform: translate(-50%, -50%) scale(1.6); opacity: 0; } }
  .dfx-word { color: #2b201d; background: #fff; padding: .25em .55em; border-radius: 99px; box-shadow: 0 8px 20px -10px rgb(0 0 0 / .4); font-size: calc(var(--pb-base) * .16); animation: pb-word 1.4s ${EASE} forwards; }
  @keyframes pb-word { 0% { transform: translate(-50%, -20%) scale(.4); opacity: 0; } 20% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; } 80% { opacity: 1; } 100% { transform: translate(-50%, -90%); opacity: 0; } }
  .dfx-mini { color: #e8475f; font-size: calc(var(--pb-base) * .2); animation: pb-dmini 1.4s ease-out forwards; }
  @keyframes pb-dmini { 0% { opacity: 0; } 20% { opacity: 1; } 100% { transform: translate(calc(-50% + var(--mx, 0px)), -260%); opacity: 0; } }

  /* photo pets */
  .pet.is-photo { height: calc(var(--pb-size) * var(--pb-ratio, 1.12)); }
  .photo-wrap { position: relative; width: 100%; height: 100%; }
  .photo { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; object-position: 50% 100%;
    pointer-events: none; user-select: none; -webkit-user-drag: none; filter: drop-shadow(0 8px 10px rgb(20 19 18 / .25)); transform-origin: 50% 100%; }
  .photo-fx { position: absolute; transform: translate(-50%, -50%); height: auto; filter: none; }
  /* face effects sit on the face; hearts, stars and bubbles get a bigger box around it */
  .is-face :is(.fx-love, .fx-spark, .fx-zzz, .fx-stars, .fx-haha, .fx-notes, .fx-think, .fx-confetti, .fx-anger),
  .is-aura :not(:is(.fx-love, .fx-spark, .fx-zzz, .fx-stars, .fx-haha, .fx-notes, .fx-think, .fx-confetti, .fx-anger)).fx { display: none; }
  .slash { position: absolute; left: -20%; top: -6%; width: 80%; height: 40%; opacity: 0; filter: drop-shadow(0 0 6px #fff); }
  .is-photo [data-mood='happy'] .photo, .is-photo [data-mood='love'] .photo { animation: pb-pbounce .5s ease-in-out infinite alternate; }
  @keyframes pb-pbounce { to { transform: translateY(-4%) scale(1.02, .98); } }
  .is-photo [data-mood='curious'] .photo, .is-photo [data-mood='shy'] .photo { animation: pb-ptilt 1.2s ease-in-out infinite alternate; }
  @keyframes pb-ptilt { from { transform: rotate(-5deg); } to { transform: rotate(5deg); } }
  .is-photo [data-mood='surprised'] .photo { animation: pb-pstartle .4s ${EASE}; }
  @keyframes pb-pstartle { 40% { transform: translateY(-8%) scale(.96, 1.06); } }
  .is-photo [data-mood='dizzy'] .photo { animation: pb-pwobble .9s ease-in-out infinite; }
  @keyframes pb-pwobble { 25% { transform: rotate(-7deg) translateX(-3%); } 75% { transform: rotate(7deg) translateX(3%); } }
  .is-photo [data-mood='sleepy'] .photo { transform: rotate(-6deg); transition: transform .8s ${EASE}; }
  .is-photo.pb--wave .photo { animation: pb-prock .28s ease-in-out 6 alternate; }
  @keyframes pb-prock { from { transform: rotate(-6deg); } to { transform: rotate(6deg); } }
  .is-photo.is-walking .photo { animation: pb-pstep .42s ease-in-out infinite alternate; }
  @keyframes pb-pstep { from { transform: rotate(-3deg); } to { transform: rotate(3deg) translateY(-3%); } }
  .pb--slash .photo { animation: pb-slash 1.1s ${EASE}; }
  @keyframes pb-slash { 25% { transform: rotate(-12deg) translateX(-4%); } 45% { transform: rotate(14deg) translateX(10%); } 70% { transform: rotate(4deg) translateX(4%); } }
  .pb--slash .slash { animation: pb-slashfx 1.1s ease-out; }
  @keyframes pb-slashfx { 0%, 38% { opacity: 0; transform: rotate(-30deg) scale(.6); } 50% { opacity: .95; transform: rotate(0) scale(1); } 100% { opacity: 0; transform: rotate(15deg) scale(1.1); } }

  @media (prefers-reduced-motion: reduce) {
    .photo, .slash,
    .bob, svg .foot, svg .arm, svg .fx, svg .fx *, svg .lh { animation: none !important; }
    .slot, .duo.is-roam { transition: none !important; }
  }`

  // ---------------------------------------------------------------------------
  // Engine: walking, physics, moods and the action loop.
  // Plain DOM work in one rAF loop per pet.
  // ---------------------------------------------------------------------------
  const rand = (a, b) => a + Math.random() * (b - a)
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v))
  const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

  function createEngine({ pet, lean, flip, body, pupils, hint }, o) {
    const roam = o.roam, reduced = o.reduced
    let W = 104, H = 116, pad = 18, lift = 0
    let x = 0, y = 0, vx = 0, vy = 0 // y is height above the ground
    let mode = 'ground' // ground | air | drag
    let target = null, speed = 1.5, facing = roam ? -1 : 1
    let busy = false, asleep = false, napping = false, spinning = false, visible = true
    let lastActivity = performance.now()
    let squash = 0, lag = 0, lagV = 0, tilt = 0, tiltV = 0, dragTilt = 0
    let pointer = null, pointerAt = 0, lookOverride = null, lookHold = null
    let raf = 0, alive = true
    const timers = new Set()
    const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); if (alive) fn() }, ms); timers.add(id); return id }

    function measure() {
      const r = pet.getBoundingClientRect()
      W = r.width; H = r.height
      const css = getComputedStyle(pet)
      pad = parseFloat(css.getPropertyValue('--pb-pad')) || 18
      lift = parseFloat(css.getPropertyValue('--pb-lift')) || 0
    }
    const vw = () => document.documentElement.clientWidth
    const maxX = () => vw() - W - pad
    const maxY = () => (roam ? window.innerHeight - H - pad * 2 - lift : 1e5)

    // ---------- moods & one-off actions ----------
    let moodTimer
    function setMood(m, ms) {
      clearTimeout(moodTimer)
      body.dataset.mood = m
      if (ms) moodTimer = later(() => setMood(asleep ? 'sleepy' : 'normal'), ms)
    }
    function action(cls, ms) {
      pet.classList.remove(cls); void pet.offsetWidth; pet.classList.add(cls)
      busy = true
      later(() => { pet.classList.remove(cls); busy = false }, ms)
    }
    const dance = () => { setMood('happy', 1400); action('pb--dance', 1300) }
    const wave = () => { setMood('happy', 1700); action('pb--wave', 1700) }
    function jump(power = 11) {
      if (mode !== 'ground' || reduced) return
      mode = 'air'; vy = power; vx = roam ? facing * rand(0, 2) : 0; squash = 0.12
    }
    function face(dir) { if (dir) { facing = dir; flip.classList.toggle('is-left', dir < 0) } }
    function lookAround() {
      lookOverride = { x: -5, y: 0 }
      later(() => { lookOverride = { x: 5, y: -1 } }, 600)
      later(() => { lookOverride = null }, 1300)
    }
    function sleep() { asleep = true; target = null; setMood('sleepy') }
    function wake() {
      if (!asleep) return
      asleep = false; napping = false
      setMood('surprised', 1000); jump(7)
      flowAt = performance.now() + 2200
    }
    function walk() {
      const from = x, span = maxX() - pad
      let to = rand(pad, maxX())
      if (Math.abs(to - from) < span * 0.25) to = from > pad + span / 2 ? pad + rand(0, span * 0.3) : maxX() - rand(0, span * 0.3)
      target = to; speed = rand(1.3, 2.1)
    }

    let hold = 1 // single-action pets hold their mood longer

    // Plays one action. Returns how long it lasts in ms, or 'walk'.
    function play(id) {
      if (!ACTION_IDS.has(id)) return 0
      if (id !== 'sleepy') { asleep = false; napping = false }
      switch (id) {
        case 'wave': wave(); return 1700
        case 'slash': setMood('excited', 1100); action('pb--slash', 1100); return 1300
        case 'dance': dance(); return 1400
        case 'jump': setMood('happy', 1100); later(() => jump(12), 150); return 1500
        case 'spin':
          setMood('excited', 600); spinning = true
          later(() => { pet.classList.add('pb--spin'); jump(13); if (reduced || mode !== 'air') { spinning = false; setMood('dizzy', 1800) } }, 250)
          return 3200
        case 'walk':
          if (roam && !reduced) { walk(); return 'walk' }
          action('is-walking', 2400); return 2400
        case 'curious': setMood('curious', 1700); lookAround(); return 1700
        case 'excited': setMood('excited', 1400); later(() => jump(10), 300); return 1600
        case 'cheer': setMood('cheer', 2200 * hold); later(() => jump(9), 200); later(() => jump(9), 1100); return 2200 * hold
        case 'yawn': setMood('yawn', 1800); later(() => setMood('happy', 700), 1800); return 2500
        case 'peekaboo':
          setMood('peek', 1500)
          later(() => { setMood('excited', 1100); jump(8) }, 1500)
          return 2600
        case 'sleepy': napping = true; sleep(); later(() => { if (napping) wake() }, 3600); return 4800
        default: setMood(id, MOOD_MS[id] * hold); return MOOD_MS[id] * hold
      }
    }

    // ---------- the loop of actions ----------
    const flow = o.photo ? FLOW.map((a) => (a === 'wink' ? 'slash' : a)) : FLOW
    let seq = o.manual ? [] : o.action && o.action !== 'flow' && ACTION_IDS.has(o.action) ? [o.action] : flow.slice()
    if (seq.length === 1 && roam && seq[0] !== 'walk') seq = ['walk', seq[0]]
    if (!roam && seq.length > 1) seq = seq.filter((a) => a !== 'walk')
    if (seq.length === 1) hold = 2
    let step = 0, flowAt = performance.now() + (roam ? 1800 : 500), walking = false

    function runFlow(t) {
      if (!seq.length || busy || asleep || mode !== 'ground') return
      if (walking) { if (target == null) { walking = false; flowAt = t + rand(500, 1000) } return }
      if (t < flowAt || target != null) return
      if (o.once && step >= seq.length) return
      const r = play(seq[step % seq.length]); step++
      if (r === 'walk') walking = true
      else flowAt = t + r + (seq.length === 1 ? rand(300, 700) : seq.length === 2 ? rand(900, 1600) : rand(600, 1200))
    }

    // ---------- activity ----------
    function activity() {
      lastActivity = performance.now()
      if (asleep && !napping) wake()
    }
    const onPointerMove = (e) => {
      if (e.pointerType !== 'mouse') return
      pointer = { x: e.clientX, y: e.clientY }; pointerAt = performance.now()
      activity()
    }
    const onResize = () => { measure(); if (roam) { x = clamp(x, pad, maxX()); y = clamp(y, 0, Math.max(0, maxY())) } }
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('scroll', activity, { passive: true })
    window.addEventListener('touchstart', activity, { passive: true })
    window.addEventListener('resize', onResize)

    // ---------- drag, throw, tap ----------
    let down = null, dragged = false, suppressClick = false, hist = []
    const onDown = (e) => {
      if (!roam || e.button !== 0) return
      const r = pet.getBoundingClientRect()
      down = { sx: e.clientX, sy: e.clientY, ox: e.clientX - r.left, oy: e.clientY - r.top }
      dragged = false; hist = []
      body.setPointerCapture?.(e.pointerId)
    }
    const onMove = (e) => {
      if (!down) return
      if (!dragged && Math.hypot(e.clientX - down.sx, e.clientY - down.sy) > 6) {
        dragged = true; mode = 'drag'; target = null; walking = false; asleep = false; napping = false
        pet.classList.add('is-dragging', 'is-air')
        setMood('surprised'); later(() => { if (mode === 'drag') setMood('excited') }, 700)
        hint && hint.classList.add('is-gone')
      }
      if (!dragged) return
      const nx = clamp(e.clientX - down.ox, 0, vw() - W)
      const ny = clamp(window.innerHeight - pad - lift - (e.clientY - down.oy + H), 0, window.innerHeight - H - pad - lift)
      const t = performance.now()
      hist.push({ x: nx, y: ny, t }); hist = hist.filter((h) => t - h.t < 90)
      dragTilt = clamp((nx - x) * 1.4, -30, 30)
      x = nx; y = ny
    }
    const onUp = () => {
      if (!down) return
      if (dragged) {
        suppressClick = true
        const a = hist[0], b = hist[hist.length - 1]
        const dt = a && b && b.t > a.t ? (b.t - a.t) / 16.67 : 1
        vx = a && b ? clamp((b.x - a.x) / dt, -28, 28) : 0
        vy = a && b ? clamp((b.y - a.y) / dt, -28, 28) : 0
        mode = 'air'; pet.classList.remove('is-dragging')
        setMood(Math.hypot(vx, vy) > 10 ? 'excited' : 'surprised')
        lastActivity = performance.now()
      }
      down = null
    }
    let lastReaction = -1
    const onClick = () => {
      if (suppressClick) { suppressClick = false; return }
      hint && hint.classList.add('is-gone')
      if (asleep) { activity(); wake(); return }
      activity()
      let i
      do { i = Math.floor(Math.random() * REACTIONS.length) } while (i === lastReaction)
      lastReaction = i
      const reaction = o.photo && REACTIONS[i] === 'wink' ? 'slash' : REACTIONS[i]
      const r = play(reaction)
      flowAt = performance.now() + (typeof r === 'number' ? r : 0) + 1200
      o.onTap && o.onTap(reaction)
    }
    body.addEventListener('pointerdown', onDown)
    body.addEventListener('pointermove', onMove)
    body.addEventListener('pointerup', onUp)
    body.addEventListener('pointercancel', onUp)
    body.addEventListener('click', onClick)

    // Inline pets rest while they are scrolled out of view.
    let io = null
    if (!roam && 'IntersectionObserver' in window) {
      io = new IntersectionObserver(([e]) => { visible = e.isIntersecting })
      io.observe(pet)
    }

    // ---------- main loop ----------
    measure()
    if (roam) {
      const fromLeft = o.side === 'left'
      x = reduced ? (fromLeft ? pad : maxX()) : fromLeft ? -W - 10 : vw() + 10
      target = fromLeft ? pad + rand(0, 40) : maxX(); speed = 2
    }
    let lastT = performance.now(), lastScroll = window.scrollY, scrollVel = 0

    function frame(t) {
      if (!alive) return
      raf = requestAnimationFrame(frame)
      const dt = Math.min(48, t - lastT) / 16.67; lastT = t
      if (!visible) return
      const sy = window.scrollY, dS = roam ? sy - lastScroll : 0; lastScroll = sy
      scrollVel += (dS - scrollVel) * 0.25

      if (mode === 'ground') {
        if (roam) {
          if (target != null) {
            const d = target - x
            if (Math.abs(d) < 2) { target = null; pet.classList.remove('is-walking', 'is-running') }
            else {
              face(Math.sign(d))
              x += Math.sign(d) * Math.min(Math.abs(d), (reduced ? 999 : speed) * dt)
              pet.classList.add('is-walking'); pet.classList.toggle('is-running', speed > 3)
            }
          } else if (!busy) pet.classList.remove('is-walking', 'is-running')
          if (!reduced && Math.abs(scrollVel) > 30 && !busy && !asleep) { setMood('surprised', 800); jump(7) }
          if (!busy && !asleep && target == null && t - lastActivity > 45000) sleep()
        }
        runFlow(t)
      } else if (mode === 'air') {
        vy -= 0.65 * dt; y += vy * dt
        if (roam) {
          x += vx * dt
          if (x < 0) { x = 0; vx = -vx * 0.6 }
          if (x > vw() - W) { x = vw() - W; vx = -vx * 0.6 }
          if (y > maxY()) { y = maxY(); vy = -Math.abs(vy) * 0.4 }
        }
        if (y <= 0) {
          y = 0
          const impact = -vy
          squash = clamp(impact * 0.018, 0.04, 0.28)
          if (impact > 8 && roam) {
            vy = impact * 0.38; vx *= 0.7
            if (impact > 17) setMood('dizzy', 2200)
          } else {
            mode = 'ground'; vx = 0; vy = 0
            pet.classList.remove('is-air', 'pb--spin')
            if (spinning) { spinning = false; setMood('dizzy', 2000) }
            else if (!o.manual && !['dizzy', 'happy', 'surprised', 'sleepy', 'love', 'cheer', 'excited'].includes(body.dataset.mood)) setMood('happy', 900)
            if (roam) x = clamp(x, pad, maxX())
          }
        }
      }
      if (mode === 'air') pet.classList.add('is-air')
      if (mode !== 'drag') dragTilt *= 0.85

      if (!reduced) {
        const tLag = mode === 'ground' ? clamp(-scrollVel * 1.2, -22, 22) : 0
        const tTilt = clamp(scrollVel * 0.5, -12, 12) + dragTilt + (mode === 'air' ? clamp(vx * 1.2, -20, 20) : 0)
        lagV = (lagV + (tLag - lag) * 0.12 * dt) * 0.78; lag += lagV * dt
        tiltV = (tiltV + (tTilt - tilt) * 0.14 * dt) * 0.76; tilt += tiltV * dt
      }
      squash *= 0.86
      if (roam && hint) pet.classList.toggle('hint-r', x + W / 2 < vw() / 2)
      pet.style.transform = `translate3d(${roam ? x.toFixed(1) : 0}px, ${(-y).toFixed(1)}px, 0)`
      lean.style.transform = `translateY(${lag.toFixed(1)}px) rotate(${tilt.toFixed(2)}deg) scale(${(1 + squash).toFixed(3)}, ${(1 - squash).toFixed(3)})`

      // Eyes follow the pointer, or look the way the page scrolls.
      let lx = 0, ly = 0
      if (lookOverride || lookHold) { const l = lookOverride || lookHold; lx = l.x; ly = l.y }
      else if (Math.abs(scrollVel) > 1.5) ly = clamp(scrollVel * 0.5, -5, 5)
      else if (pointer && t - pointerAt < 3000) {
        const r = pet.getBoundingClientRect()
        const dx = pointer.x - (r.left + r.width / 2), dy = pointer.y - (r.top + r.height * 0.5)
        const d = Math.hypot(dx, dy) || 1, k = Math.min(1, d / 260)
        lx = (dx / d) * 5 * k; ly = (dy / d) * 5 * k
        if (facing < 0) lx = -lx // the face is mirrored when walking left
      }
      if (pupils) pupils.style.transform = `translate(${lx.toFixed(2)}px, ${ly.toFixed(2)}px)`
    }
    pet.style.transform = `translate3d(${roam ? x : 0}px, 0, 0)`
    raf = requestAnimationFrame(frame)

    // Blink every few seconds, sometimes twice.
    const blink = () => { body.classList.add('is-blink'); later(() => body.classList.remove('is-blink'), 120) }
    ;(function blinkLoop() {
      later(() => { if (visible) { blink(); if (Math.random() < 0.25) later(blink, 260) } blinkLoop() }, rand(2000, 5000))
    })()
    if (hint) later(() => hint.classList.add('is-gone'), 9000)

    return {
      play(id) {
        const r = play(id)
        if (r === 'walk') walking = true
        else flowAt = performance.now() + r + 1000
        return r
      },
      setMood,
      face,
      jump: (p) => jump(p),
      /** Pose name for two-pet scenes, or null. */
      pose(name) {
        pet.className = pet.className.replace(/\bpose-\S+/g, '').trim()
        if (name) pet.classList.add('pose-' + name)
      },
      walking(on) { pet.classList.toggle('is-walking', !!on) },
      look(l) { lookHold = l },
      destroy() {
        alive = false
        cancelAnimationFrame(raf)
        timers.forEach(clearTimeout); clearTimeout(moodTimer)
        io && io.disconnect()
        window.removeEventListener('pointermove', onPointerMove)
        window.removeEventListener('scroll', activity)
        window.removeEventListener('touchstart', activity)
        window.removeEventListener('resize', onResize)
        body.removeEventListener('pointerdown', onDown)
        body.removeEventListener('pointermove', onMove)
        body.removeEventListener('pointerup', onUp)
        body.removeEventListener('pointercancel', onUp)
        body.removeEventListener('click', onClick)
      },
    }
  }

  // ---------------------------------------------------------------------------
  // Markup shared by <pet-buddy> and <pet-duo>
  // ---------------------------------------------------------------------------
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])

  const petHtml = (m, acc, cls, hint) => `
    <div class="pet ${cls}${isPhoto(m) ? ' is-photo' : ''}" part="pet"${isPhoto(m) ? ` style="--pb-ratio:${m.ratio || 1.12}"` : ''}>
      ${hint ? `<div class="hint" part="hint">${esc(hint)}</div>` : ''}
      <div class="lean"><div class="flip">
        <button class="body" type="button" data-mood="normal" aria-label="${esc(m.name)}, a pet. Tap to play.">
          <div class="bob">${drawPet(m, acc || 'none')}</div>
        </button>
      </div></div>
    </div>`

  const partsOf = (el) => {
    const $ = (s) => el.querySelector(s)
    return { pet: el, lean: $('.lean'), flip: $('.flip'), body: $('.body'), pupils: $('.pupils'), hint: $(':scope > .hint') }
  }

  // ---------------------------------------------------------------------------
  // <pet-buddy> element
  // ---------------------------------------------------------------------------
  class PetBuddyElement extends HTMLElement {
    static get observedAttributes() { return ['pet', 'action', 'mode', 'size', 'accessory', 'hint', 'side', 'once'] }
    constructor() {
      super()
      this.attachShadow({ mode: 'open' })
      this._queued = false
      this._schedule = () => {
        if (this._queued) return
        this._queued = true
        queueMicrotask(() => { this._queued = false; if (this.isConnected) this._render() })
      }
    }
    connectedCallback() { this._schedule() }
    disconnectedCallback() { this._engine && this._engine.destroy(); this._engine = null }
    attributeChangedCallback() { this._schedule() }

    _render() {
      this._engine && this._engine.destroy()
      const m = mascot(this.getAttribute('pet') || 'bubu')
      const roam = (this.getAttribute('mode') || 'roam') !== 'inline'
      const size = clamp(parseFloat(this.getAttribute('size')) || (roam ? 104 : 160), 32, 600)
      const hintAttr = this.getAttribute('hint')
      const hint = hintAttr === 'none' ? '' : hintAttr || (roam ? `Hi! I'm ${m.name}. Tap me or drag me` : '')
      this.shadowRoot.innerHTML = `<style>${CSS}</style>` + petHtml(m, this.getAttribute('accessory'), roam ? 'is-roam' : 'is-inline', hint)
      const pet = this.shadowRoot.querySelector('.pet')
      pet.style.setProperty('--pb-base', `${size}px`)
      this._engine = createEngine(partsOf(pet), {
        roam,
        photo: isPhoto(m),
        reduced: reducedMotion(),
        action: this.getAttribute('action') || 'flow',
        side: this.getAttribute('side') || 'right',
        once: this.hasAttribute('once'),
        onTap: (a) => this.dispatchEvent(new CustomEvent('pet-tap', { detail: { action: a }, bubbles: true })),
      })
    }

    /** Play one action now, e.g. el.play('dance'). */
    play(action) {
      if (!this._engine) this._render()
      return this._engine ? this._engine.play(action) : 0
    }
  }

  // ---------------------------------------------------------------------------
  // <pet-duo>: two pets and the scenes they play together
  // ---------------------------------------------------------------------------
  const STOP = Symbol('stop')

  function createDuo(root, A, B, o) {
    const reduced = o.reduced, roam = o.roam
    let alive = true, token = 0, step = 0
    const timers = new Set()
    const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); if (alive) fn() }, ms); timers.add(id); return id }
    const size = () => A.slot.getBoundingClientRect().width || o.size
    const fxBox = root.querySelector('.duo__fx')
    A.left = true; B.left = false

    // ---------- small helpers that scenes are written with ----------
    function move(P, frac, ms = 650) {
      const dx = frac * size()
      const prev = P.dx || 0
      P.dx = dx
      P.slot.style.setProperty('--t', `${reduced ? 0 : ms}ms`)
      P.slot.style.setProperty('--dx', `${dx.toFixed(1)}px`)
      if (Math.abs(dx - prev) > 2 && !reduced) {
        P.eng.walking(true)
        clearTimeout(P.walkT); P.walkT = later(() => P.eng.walking(false), ms)
      }
    }
    const tilt = (P, deg) => P.slot.style.setProperty('--tilt', `${deg}deg`)
    const face = (P, dir) => { P.dir = dir; P.eng.face(dir) }
    const faceEach = () => { face(A, 1); face(B, -1) }
    const pose = (P, name) => P.eng.pose(name)
    const mood = (P, m, ms) => P.eng.setMood(m, ms)
    const act = (P, id) => P.eng.play(id)
    const look = (P, l) => P.eng.look(l)
    const towards = (P) => (P === A ? 1 : -1)
    const other = (P) => (P === A ? B : A)
    const holdPose = (P) => ((P.left !== (P.dir < 0)) ? 'hold-r' : 'hold-l')
    function fx(kind, text, x = 50, y = 18, extra) {
      const el = document.createElement('span')
      el.className = `dfx dfx-${kind}`
      el.textContent = text
      el.style.setProperty('--x', `${x}%`); el.style.setProperty('--y', `${y}%`)
      if (extra) Object.entries(extra).forEach(([k, v]) => el.style.setProperty(k, v))
      fxBox.append(el)
      setTimeout(() => el.remove(), 2200)
    }
    function hearts(n, x = 50) {
      for (let i = 0; i < n; i++) later(() => fx('mini', '\u2665', x + rand(-14, 14), 40, { '--mx': `${rand(-30, 30).toFixed(0)}px` }), i * 160)
    }
    function reset(ms = 600) {
      ;[A, B].forEach((P) => { move(P, 0, ms); tilt(P, 0); pose(P, null); face(P, 1); look(P, null); P.slot.classList.remove('is-front', 'is-back') })
    }

    // ---------- the scenes ----------
    const SCRIPTS = {
      async hug(w) {
        faceEach(); mood(A, 'excited', 700); mood(B, 'excited', 700); await w(450)
        move(A, 0.34, 700); move(B, -0.34, 700); await w(700)
        pose(A, 'hug'); pose(B, 'hug'); tilt(A, 7); tilt(B, -7)
        mood(A, 'love'); mood(B, 'love'); fx('heart', '\u2665', 50, 10); hearts(4); await w(2400)
        pose(A, null); pose(B, null); tilt(A, 0); tilt(B, 0); mood(A, 'happy', 1200); mood(B, 'happy', 1200)
        reset(); await w(900)
      },
      async kiss(w, P) {
        const Q = other(P), d = towards(P)
        faceEach(); look(Q, { x: -4 * d, y: 0 }); move(P, 0.36 * d, 700); await w(750)
        mood(P, 'kiss', 1300); tilt(P, 8 * d); await w(450)
        fx('mini', '\u2665', P === A ? 58 : 42, 45); tilt(P, 0); await w(300)
        mood(Q, 'shy', 1500); act(Q, 'jump'); hearts(3, P === A ? 75 : 25); await w(1500)
        mood(Q, 'love', 1600); mood(P, 'happy', 1600); await w(1200)
        reset(); await w(800)
      },
      async highfive(w) {
        faceEach(); move(A, 0.18, 550); move(B, -0.18, 550); await w(600)
        mood(A, 'excited', 900); mood(B, 'excited', 900); pose(A, 'high'); pose(B, 'high'); await w(300)
        A.eng.jump(11); B.eng.jump(11); await w(330)
        fx('clap', '\u2726', 50, 8); fx('word', 'Yay!', 50, -6); await w(500)
        mood(A, 'cheer', 1500); mood(B, 'cheer', 1500); pose(A, null); pose(B, null); await w(1500)
        reset(); await w(800)
      },
      async holdhands(w) {
        const dir = roam ? walkDir() : Math.random() < 0.5 ? 1 : -1
        face(A, dir); face(B, dir)
        move(A, 0.16, 450); move(B, -0.16, 450); await w(450)
        pose(A, holdPose(A)); pose(B, holdPose(B)); mood(A, 'happy'); mood(B, 'happy'); hearts(2)
        if (roam) await walkTogether(w, dir)
        else { A.eng.walking(true); B.eng.walking(true); await w(2800); A.eng.walking(false); B.eng.walking(false) }
        mood(A, 'love', 1200); mood(B, 'love', 1200); faceEach(); fx('heart', '\u2665', 50, 8); await w(1300)
        reset(); await w(700)
      },
      async dance(w) {
        face(A, 1); face(B, 1)
        act(A, 'dance'); later(() => act(B, 'dance'), 120); await w(1500)
        mood(A, 'cheer', 1600); mood(B, 'cheer', 1600); A.eng.jump(8); B.eng.jump(8); await w(1600)
        act(A, 'spin'); later(() => act(B, 'spin'), 150); await w(3100)
        mood(A, 'laugh', 1300); mood(B, 'laugh', 1300); await w(1300)
      },
      async cheerup(w, P) {
        const Q = other(P), d = towards(P)
        mood(Q, 'cry'); await w(1300)
        face(P, d); mood(P, 'surprised', 800); look(P, { x: 4, y: 0 }); await w(800)
        move(P, 0.32 * d, 650); await w(700)
        pose(P, 'pat'); mood(P, 'happy'); await w(1500)
        pose(P, null); mood(Q, 'surprised', 600); await w(600)
        faceEach(); pose(P, 'hug'); pose(Q, 'hug'); tilt(P, 7 * d); tilt(Q, -7 * d); move(Q, -0.1 * d, 400)
        mood(P, 'love'); mood(Q, 'love'); fx('heart', '\u2665', 50, 10); await w(2000)
        mood(A, 'happy', 1200); mood(B, 'happy', 1200); reset(); await w(900)
      },
      async peekaboo(w, P) {
        const Q = other(P), d = towards(P)
        P.slot.classList.add('is-back'); Q.slot.classList.add('is-front')
        face(P, d); mood(P, 'shy'); move(P, 1.12 * d, 900); await w(1000)
        mood(Q, 'curious'); look(Q, { x: -5, y: 0 }); await w(700); look(Q, { x: 5, y: 0 }); await w(700); look(Q, null)
        mood(Q, 'think'); await w(900)
        face(P, -d); move(P, 0.55 * d, 220); P.eng.jump(9); mood(P, 'excited', 1200); fx('word', 'Boo!', P === A ? 70 : 30, -2)
        mood(Q, 'surprised', 900); Q.eng.jump(7); await w(1100)
        mood(A, 'laugh', 1500); mood(B, 'laugh', 1500); await w(1500)
        reset(); await w(900)
      },
      async poke(w, P) {
        const Q = other(P), d = towards(P)
        faceEach(); move(P, 0.2 * d, 500); await w(550)
        pose(P, 'poke'); mood(P, 'wink'); mood(Q, 'surprised'); await w(800)
        pose(P, null); mood(Q, 'grumpy'); await w(1000)
        move(Q, -0.12 * d, 300); pose(Q, 'poke'); mood(Q, 'wink'); mood(P, 'laugh'); await w(900)
        pose(Q, null); mood(A, 'laugh', 1500); mood(B, 'laugh', 1500); await w(1500)
        reset(); await w(800)
      },
      async tickle(w, P) {
        const Q = other(P), d = towards(P)
        faceEach(); mood(P, 'wink'); move(P, 0.3 * d, 600); await w(650)
        pose(P, 'tickle'); mood(P, 'happy'); mood(Q, 'laugh'); fx('word', 'hehe', P === A ? 75 : 25, -2); await w(2600)
        pose(P, null); mood(Q, 'dizzy', 1800); mood(P, 'laugh', 1800); await w(1800)
        reset(); await w(800)
      },
      async share(w, P) {
        const Q = other(P), d = towards(P)
        face(P, 1); mood(P, 'eat'); face(Q, -d); look(Q, { x: 4, y: 1 }); mood(Q, 'curious'); await w(1500)
        mood(Q, 'cry'); await w(1200)
        mood(P, 'surprised', 700); face(P, d); await w(700)
        move(P, 0.25 * d, 500); pose(P, 'reach'); mood(P, 'happy'); await w(700)
        pose(P, null); mood(Q, 'eat'); mood(P, 'eat'); await w(2200)
        mood(A, 'love', 1500); mood(B, 'love', 1500); hearts(4); await w(1500)
        reset(); await w(800)
      },
      async makeup(w) {
        faceEach(); mood(A, 'grumpy'); mood(B, 'grumpy'); fx('word', 'Hmph!', 50, -4); await w(1600)
        face(A, -1); face(B, 1); await w(1300)
        face(A, 1); face(B, -1); mood(A, 'shy'); mood(B, 'shy'); await w(1200)
        move(A, 0.34, 600); move(B, -0.34, 600); await w(600)
        pose(A, 'hug'); pose(B, 'hug'); tilt(A, 7); tilt(B, -7); mood(A, 'love'); mood(B, 'love'); fx('heart', '\u2665', 50, 10); await w(2200)
        mood(A, 'happy', 1200); mood(B, 'happy', 1200); reset(); await w(900)
      },
      async nap(w) {
        face(A, 1); face(B, 1)
        act(A, 'yawn'); later(() => act(B, 'yawn'), 400); await w(2300)
        move(A, 0.14, 700); move(B, -0.14, 700); tilt(A, 9); tilt(B, -9); mood(A, 'sleepy'); mood(B, 'sleepy'); await w(4200)
        tilt(A, 0); tilt(B, 0); mood(A, 'surprised', 900); mood(B, 'surprised', 900); A.eng.jump(7); B.eng.jump(7); await w(1000)
        mood(A, 'laugh', 1200); mood(B, 'laugh', 1200); reset(); await w(1200)
      },
    }

    // ---------- roaming: the pair strolls along the bottom of the screen ----------
    let x = 0
    const vw = () => document.documentElement.clientWidth
    const duoW = () => root.getBoundingClientRect().width
    const maxX = () => Math.max(12, vw() - duoW() - 12)
    function setX(nx, ms) {
      x = nx
      root.style.transitionProperty = 'transform'
      root.style.transitionDuration = `${reduced ? 0 : ms}ms`
      root.style.transform = `translateX(${x.toFixed(1)}px)`
    }
    function walkDir() { return x > maxX() / 2 ? -1 : 1 }
    async function walkTogether(w, dir, to) {
      const target = to != null ? to : dir > 0 ? rand(maxX() * 0.6, maxX()) : rand(12, maxX() * 0.4)
      const ms = Math.max(600, (Math.abs(target - x) / 80) * 1000)
      A.eng.walking(true); B.eng.walking(true)
      setX(target, ms); await w(ms)
      A.eng.walking(false); B.eng.walking(false)
    }
    const onResize = () => { if (roam) setX(clamp(x, 12, maxX()), 0) }
    window.addEventListener('resize', onResize)

    // ---------- director ----------
    const seq = o.scene && o.scene !== 'flow' && SCENE_IDS.has(o.scene) ? [o.scene] : SCENES.map((s) => s.id)

    async function run(id, tk) {
      const w = (ms) => new Promise((res, rej) => later(() => (tk === token ? res() : rej(STOP)), ms))
      const P = Math.random() < 0.5 ? A : B
      reset(0)
      await SCRIPTS[id](w, P)
    }
    async function loop(first) {
      const tk = ++token
      const w = (ms) => new Promise((res, rej) => later(() => (tk === token ? res() : rej(STOP)), ms))
      try {
        if (roam) {
          setX(o.side === 'left' ? -duoW() - 20 : vw() + 20, 0)
          await w(60)
          face(A, o.side === 'left' ? 1 : -1); face(B, o.side === 'left' ? 1 : -1)
          await walkTogether(w, 0, o.side === 'left' ? 24 : maxX())
          reset(0)
        }
        await w(first ? 500 : 0)
        while (alive && tk === token) {
          if (o.once && step >= seq.length) return
          const id = seq[step % seq.length]; step++
          await run(id, tk)
          reset(); await w(seq.length === 1 ? rand(500, 900) : rand(900, 1600))
          if (roam && seq.length > 1 && step % 2 === 0) {
            const dir = walkDir(); face(A, dir); face(B, dir)
            pose(A, holdPose(A)); pose(B, holdPose(B))
            await walkTogether(w, dir); reset(); await w(500)
          }
        }
      } catch (e) { if (e !== STOP) throw e }
    }
    loop(true)

    return {
      async play(id) {
        if (!SCENE_IDS.has(id)) return
        const tk = ++token
        try {
          await run(id, tk)
          reset()
          if (tk === token) later(() => { if (tk === token) loopFrom() }, 1500)
        } catch (e) { if (e !== STOP) throw e }
      },
      destroy() {
        alive = false; token++
        timers.forEach(clearTimeout)
        window.removeEventListener('resize', onResize)
        A.eng.destroy(); B.eng.destroy()
      },
    }
    function loopFrom() {
      const tk = ++token
      ;(async () => {
        const w = (ms) => new Promise((res, rej) => later(() => (tk === token ? res() : rej(STOP)), ms))
        try {
          while (alive && tk === token) {
            if (o.once) return
            const id = seq[step % seq.length]; step++
            await run(id, tk); reset(); await w(rand(900, 1600))
          }
        } catch (e) { if (e !== STOP) throw e }
      })()
    }
  }

  class PetDuoElement extends HTMLElement {
    static get observedAttributes() { return ['pets', 'scene', 'mode', 'size', 'accessory', 'hint', 'side', 'once'] }
    constructor() {
      super()
      this.attachShadow({ mode: 'open' })
      this._queued = false
      this._schedule = () => {
        if (this._queued) return
        this._queued = true
        queueMicrotask(() => { this._queued = false; if (this.isConnected) this._render() })
      }
    }
    connectedCallback() { this._schedule() }
    disconnectedCallback() { this._duo && this._duo.destroy(); this._duo = null }
    attributeChangedCallback() { this._schedule() }

    _render() {
      this._duo && this._duo.destroy()
      const ids = (this.getAttribute('pets') || 'bubu dudu').trim().split(/[\s,]+/)
      const ma = mascot(ids[0] || 'bubu'), mb = mascot(ids[1] || (ids[0] === 'dudu' ? 'bubu' : 'dudu'))
      const accs = (this.getAttribute('accessory') || 'none').trim().split(/[\s,]+/)
      const roam = (this.getAttribute('mode') || 'roam') !== 'inline'
      const size = clamp(parseFloat(this.getAttribute('size')) || (roam ? 96 : 150), 32, 500)
      const hintAttr = this.getAttribute('hint')
      const hint = hintAttr === 'none' ? '' : hintAttr || (roam ? `${ma.name} & ${mb.name} say hi!` : '')
      this.shadowRoot.innerHTML = `<style>${CSS}</style>
        <div class="duo ${roam ? 'is-roam' : 'is-inline'}" style="--pb-base:${size}px" part="duo" role="group" aria-label="${esc(ma.name)} and ${esc(mb.name)}">
          ${hint ? `<div class="hint" part="hint">${esc(hint)}</div>` : ''}
          <div class="duo__fx"></div>
          <div class="slot slot-a">${petHtml(ma, accs[0], 'is-inline')}</div>
          <div class="slot slot-b">${petHtml(mb, accs[1] || accs[0], 'is-inline')}</div>
        </div>`
      const root = this.shadowRoot.querySelector('.duo')
      const reduced = reducedMotion()
      const mk = (slot) => ({ slot, eng: createEngine(partsOf(slot.querySelector('.pet')), { roam: false, manual: true, reduced }) })
      const A = mk(root.querySelector('.slot-a')), B = mk(root.querySelector('.slot-b'))
      const h = root.querySelector(':scope > .hint')
      if (h) setTimeout(() => h.classList.add('is-gone'), 9000)
      this._duo = createDuo(root, A, B, {
        roam, reduced, size,
        scene: this.getAttribute('scene') || 'flow',
        side: this.getAttribute('side') || 'right',
        once: this.hasAttribute('once'),
      })
    }

    /** Play one scene now, e.g. el.play('hug'). */
    play(scene) {
      if (!this._duo) this._render()
      return this._duo && this._duo.play(scene)
    }
  }

  window.PetBuddy = {
    version: '1.1.0',
    register,
    get pets() { return Object.values(MASCOTS).map((m) => ({ id: m.id, name: m.name, tagline: m.tagline || '', type: m.type || 'drawn' })) },
    actions: ACTIONS.filter((a) => !a.photo).map((a) => Object.assign({}, a)),
    /** The actions a given pet can do (photo pets swap wink for a sword slash). */
    actionsFor: (id) => actionsFor(mascot(id)).map((a) => Object.assign({}, a)),
    scenes: SCENES.map((s) => Object.assign({}, s)),
    accessories: ['none', 'bowtie', 'flower', 'crown', 'headphones'],
    /** The pet drawing as an SVG string, for thumbnails. */
    svg: (id, acc) => drawPet(mascot(id), acc || 'none'),
    /** A small picture of the pet for buttons and lists. */
    thumb: (id) => { const m = mascot(id); return isPhoto(m) ? `<img src="${esc(new URL(m.src, BASE).href)}" alt="">` : drawPet(m, 'none') },
  }
  if (!customElements.get('pet-buddy')) customElements.define('pet-buddy', PetBuddyElement)
  if (!customElements.get('pet-duo')) customElements.define('pet-duo', PetDuoElement)

  // One-line install: data-pet / data-pets on the <script> tag adds the pet by itself.
  function mount(script) {
    const ds = script && script.dataset
    if (!ds || !(ds.pet || ds.pets)) return
    const add = () => {
      const el = document.createElement(ds.pets ? 'pet-duo' : 'pet-buddy')
      ;['pet', 'pets', 'action', 'scene', 'mode', 'size', 'accessory', 'hint', 'side'].forEach((k) => ds[k] != null && el.setAttribute(k, ds[k]))
      if (ds.once != null) el.setAttribute('once', '')
      ;((ds.target && document.querySelector(ds.target)) || document.body).append(el)
    }
    if (document.body) add()
    else document.addEventListener('DOMContentLoaded', add)
  }
  window.PetBuddy.mount = mount
  mount(ME)
})()
