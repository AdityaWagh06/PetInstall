/* PetInstall website: playground, gallery and page animations. */
;(function () {
  'use strict'
  const $ = (s, r = document) => r.querySelector(s)
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s))
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // Where other people load the script from. On a real domain this is the live URL.
  const SCRIPT_URL = location.protocol.startsWith('http')
    ? new URL('petbuddy.js', location.href).href
    : 'https://your-domain.com/petbuddy.js'

  const PETS_INFO = {
    bubu: {
      blurb: 'A fluffy white panda who waves at everyone, blushes at compliments and naps whenever the page goes quiet.',
      traits: ['Gentle', 'Blushes a lot', 'Loves bow ties'],
      accessory: 'bowtie',
    },
    dudu: {
      blurb: "Bubu's brown bear best friend. Same squishy shape, extra bounce, always first on the dance floor and first in line for hugs.",
      traits: ['Bouncy', 'Big hugger', 'Snack lover'],
      accessory: 'none',
    },
  }
  const DUO = 'duo' // playground / gallery value for "Bubu & Dudu together"

  function whenReady(fn) {
    if (window.PetBuddy) fn()
    else window.addEventListener('load', fn, { once: true })
  }

  whenReady(() => {
    const PB = window.PetBuddy
    const pets = PB.pets
    const actions = PB.actions
    const scenes = PB.scenes
    const petName = (id) => (id === DUO ? 'Bubu & Dudu' : (pets.find((p) => p.id === id) || {}).name || id)
    const miniPet = (id) => `<span class="mini">${PB.thumb(id)}</span>`
    const miniDuo = `<span class="mini mini--duo">${PB.svg('bubu')}${PB.svg('dudu')}</span>`

    // ------------------------------------------------------------------ toast
    const toastEl = $('#toast')
    let toastT
    function toast(msg) {
      toastEl.textContent = msg
      toastEl.classList.add('is-on')
      clearTimeout(toastT)
      toastT = setTimeout(() => toastEl.classList.remove('is-on'), 2200)
    }
    async function copy(text, label = 'Copied!') {
      try { await navigator.clipboard.writeText(text) }
      catch {
        const ta = document.createElement('textarea')
        ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0'
        document.body.append(ta); ta.select(); document.execCommand('copy'); ta.remove()
      }
      toast(label)
    }

    // ------------------------------------------------------------- highlight
    const escHtml = (s) => s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c])
    const TOKEN = /(<!--[\s\S]*?-->|\/\/[^\n]*|\{\/\*[\s\S]*?\*\/\})|("[^"\n]*"|'[^'\n]*'|`[^`]*`)|(<\/?[a-zA-Z][\w-]*|\/?>)|(\b(?:const|let|import|export|default|function|return|from|new)\b)|((?<=\s)[a-zA-Z-]+(?==))/g
    function highlight(code) {
      let out = '', last = 0
      code.replace(TOKEN, (m, com, str, tag, kw, attr, i) => {
        out += escHtml(code.slice(last, i))
        const cls = com ? 'c' : str ? 's' : tag ? 't' : kw ? 'k' : 'a'
        out += `<span class="tk-${cls}">${escHtml(m)}</span>`
        last = i + m.length
        return m
      })
      return out + escHtml(code.slice(last))
    }

    // ------------------------------------------------------------- marquee
    const words = actions.map((a) => a.label).concat(scenes.map((s) => s.label), ['Bubu', 'Dudu'])
    const track = $('.marquee__track')
    const row = words.map((w) => `<span>${w}</span><i aria-hidden="true">✦</i>`).join('')
    track.innerHTML = row + row

    // ------------------------------------------------------------- pet cards
    $('#petCards').innerHTML = pets.map((p) => {
      const info = PETS_INFO[p.id] || { blurb: p.tagline, traits: [], accessory: 'none' }
      return `<article class="pet-card pet-card--${p.id} reveal">
        <div class="pet-card__stage">
          <pet-buddy pet="${p.id}" mode="inline" size="${info.size || 170}" action="flow" accessory="${info.accessory}"></pet-buddy>
        </div>
        <div class="pet-card__body">
          <h3>${p.name}</h3>
          <p class="pet-card__tag">${p.tagline}</p>
          <p>${info.blurb}</p>
          <ul class="tags">${info.traits.map((t) => `<li>${t}</li>`).join('')}</ul>
          <button type="button" class="btn btn--dark btn--sm" data-use="${p.id}">Use ${p.name} <span aria-hidden="true">→</span></button>
        </div>
      </article>`
    }).join('') + `<article class="pet-card pet-card--soon reveal">
        <div class="pet-card__stage"><span class="soon__q">?</span></div>
        <div class="pet-card__body">
          <h3>More friends soon</h3>
          <p class="pet-card__tag">New pets are on the way</p>
          <p>Every new pet gets all ${actions.length} actions and every together scene automatically. Want a custom mascot for your brand? Developers can add one with a few lines.</p>
          <a class="btn btn--ghost btn--sm" href="#install">Make your own</a>
        </div>
      </article>`

    // ------------------------------------------------------------- together
    const tgDuo = $('#tgDuo')
    $('#tgList').innerHTML = scenes.map((s, i) => `
      <button type="button" class="tg__item" data-scene="${s.id}" style="--i:${i}">
        <b>${s.label}</b><span>${s.about}</span>
      </button>`).join('') +
      `<button type="button" class="tg__item tg__item--code" data-use="${DUO}"><b>Get the code</b><span>Put them on your site</span></button>`
    $('#tgList').addEventListener('click', (e) => {
      const b = e.target.closest('[data-scene]')
      if (!b) return
      $$('.tg__item', $('#tgList')).forEach((x) => x.classList.toggle('is-on', x === b))
      tgDuo.play(b.dataset.scene)
      $('#tgNow').textContent = `Now playing: ${b.querySelector('b').textContent}`
    })

    // ------------------------------------------------------------- playground
    const defSize = (pet, mode) => (pet === DUO ? (mode === 'inline' ? 150 : 96) : mode === 'inline' ? 160 : 104)
    const state = { pet: 'bubu', action: 'flow', once: false, mode: 'roam', side: 'right', size: 104, acc: 'none', hint: '', noHint: false, tab: 'html' }

    $('#ctlPet').innerHTML = pets.map((p) =>
      `<button type="button" data-v="${p.id}" aria-pressed="${p.id === state.pet}">${miniPet(p.id)}${p.name}</button>`).join('') +
      `<button type="button" data-v="${DUO}" aria-pressed="false">${miniDuo}Both together</button>`
    const listFor = (pet) => (pet === DUO ? scenes : PB.actionsFor(pet))
    const isPhoto = (pet) => (pets.find((p) => p.id === pet) || {}).type === 'photo'
    function renderActionChips() {
      const list = listFor(state.pet)
      if (state.action !== 'flow' && !list.some((a) => a.id === state.action)) state.action = 'flow'
      $('#ctlAction').innerHTML = `<button type="button" class="chip chip--all" data-v="flow" aria-pressed="${state.action === 'flow'}">✨ Everything (loop)</button>` +
        list.map((a) => `<button type="button" class="chip" data-v="${a.id}" aria-pressed="${state.action === a.id}" title="${a.about}">${a.label}</button>`).join('')
      $('#ctlAction').closest('fieldset').querySelector('legend').textContent = state.pet === DUO ? '2. Scene' : '2. Action'
    }
    const ACC_LABEL = { none: 'None', bowtie: 'Bow tie', flower: 'Flower', crown: 'Crown', headphones: 'Headphones' }
    $('#ctlAcc').innerHTML = PB.accessories.map((a) =>
      `<button type="button" data-v="${a}" aria-pressed="${a === state.acc}">${ACC_LABEL[a] || a}</button>`).join('')

    function bindSeg(el, key, after) {
      el.addEventListener('click', (e) => {
        const b = e.target.closest('button[data-v]')
        if (!b) return
        const prev = state[key]
        state[key] = b.dataset.v
        $$('button[data-v]', el).forEach((x) => x.setAttribute('aria-pressed', String(x === b)))
        after && after(b.dataset.v, prev)
        update()
      })
    }
    function setSeg(el, v) { $$('button[data-v]', el).forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.v === v))) }
    function resize(prevPet, prevMode) {
      if (state.size === defSize(prevPet, prevMode)) { state.size = defSize(state.pet, state.mode); $('#ctlSize').value = state.size }
    }

    bindSeg($('#ctlPet'), 'pet', (v, prev) => {
      if ((v === DUO) !== (prev === DUO)) state.action = 'flow'
      renderActionChips()
      resize(prev, state.mode)
    })
    bindSeg($('#ctlAction'), 'action', () => { pendingPlay = true })
    bindSeg($('#ctlMode'), 'mode', (v, prev) => resize(state.pet, prev))
    bindSeg($('#ctlSide'), 'side')
    bindSeg($('#ctlAcc'), 'acc')
    $('#ctlSize').addEventListener('input', (e) => { state.size = +e.target.value; update() })
    $('#ctlHint').addEventListener('input', (e) => { state.hint = e.target.value; update() })
    $('#ctlNoHint').addEventListener('change', (e) => { state.noHint = e.target.checked; $('#ctlHint').disabled = e.target.checked; update() })
    $('#ctlOnce').addEventListener('change', (e) => { state.once = e.target.checked; update() })

    const tagOf = (s = state) => (s.pet === DUO ? 'pet-duo' : 'pet-buddy')
    function attrs(s = state) {
      const duo = s.pet === DUO
      const a = duo ? [['pets', 'bubu dudu']] : [['pet', s.pet]]
      if (s.action !== 'flow') a.push([duo ? 'scene' : 'action', s.action])
      if (s.mode === 'inline') a.push(['mode', 'inline'])
      if (s.size !== defSize(s.pet, s.mode)) a.push(['size', String(s.size)])
      if (!duo && !isPhoto(s.pet) && s.acc !== 'none') a.push(['accessory', s.acc])
      if (s.noHint) a.push(['hint', 'none'])
      else if (s.hint.trim()) a.push(['hint', s.hint.trim()])
      if (s.mode === 'roam' && s.side === 'left') a.push(['side', 'left'])
      if (s.once && s.action !== 'flow') a.push(['once', ''])
      return a
    }
    const dataHtml = (a) => a.map(([k, v]) => (v === '' ? ` data-${k}` : ` data-${k}="${v.replace(/"/g, '&quot;')}"`)).join('')
    const oneLine = (a) => `<script src="${SCRIPT_URL}"${dataHtml(a)} defer></script>`
    const attrHtml = (a) => a.map(([k, v]) => (v === '' ? ` ${k}` : ` ${k}="${v.replace(/"/g, '&quot;')}"`)).join('')

    function snippet(tab) {
      const a = attrs(), tag = tagOf()
      const html = `<${tag}${attrHtml(a)}></${tag}>`
      if (tab === 'html' || tab === 'wp') {
        const help = tab === 'wp'
          ? '<!-- WordPress: a "Custom HTML" block, or Appearance > Theme File Editor > footer.php.\n     Wix / Squarespace / Shopify: Settings > Custom code > Body end. -->\n'
          : ''
        if (state.mode === 'inline') {
          return `${help}<!-- ${petName(state.pet)}: paste the tag where you want them to sit, and the script once anywhere. No CSS needed. -->\n${html}\n<script src="${SCRIPT_URL}" defer></script>`
        }
        return `${help}<!-- ${petName(state.pet)}: paste this one line right before </body>. No CSS needed. -->\n${oneLine(a)}`
      }
      if (tab === 'react') {
        const jsx = `<${tag}${a.map(([k, v]) => (v === '' ? ` ${k}=""` : ` ${k}="${v.replace(/"/g, '&quot;')}"`)).join('')} />`
        return `// 1. Add once to index.html (or app/layout.tsx in Next.js):\n//    <script src="${SCRIPT_URL}" defer></script>\n\n// 2. Use it like any other element:\nexport default function MyPet() {\n  return ${jsx}\n}`
      }
      if (tab === 'js') {
        const lines = a.map(([k, v]) => `pet.setAttribute('${k}', '${v.replace(/'/g, "\\'")}')`).join('\n')
        const example = state.pet === DUO ? "pet.play('hug')" : "pet.play('dance')"
        return `// Loads the script, then adds ${petName(state.pet)} to the page.\nconst s = document.createElement('script')\ns.src = '${SCRIPT_URL}'\ns.onload = () => {\n  const pet = document.createElement('${tag}')\n${lines.replace(/^/gm, '  ')}\n  document.body.append(pet)\n\n  // Make it do something whenever you like:\n  // ${example}\n}\ndocument.head.append(s)`
      }
      return ''
    }

    const previewWrap = $('#previewWrap')
    let preview = null, pendingPlay = false
    function renderPreview() {
      const s = state, tag = tagOf()
      if (!preview || preview.localName !== tag) {
        preview && preview.remove()
        preview = document.createElement(tag); previewWrap.append(preview)
      }
      const set = (k, v) => (v == null ? preview.removeAttribute(k) : preview.setAttribute(k, v))
      const duo = s.pet === DUO
      set(duo ? 'pets' : 'pet', duo ? 'bubu dudu' : s.pet)
      set('mode', 'inline')
      set(duo ? 'scene' : 'action', s.action)
      set('size', String(Math.min(s.size, duo ? 150 : 230)))
      set('accessory', duo ? null : s.acc)
      set('once', s.once && s.action !== 'flow' ? '' : null)
      const hint = s.noHint ? 'none' : s.hint.trim() || (s.mode === 'roam' && !duo ? `Hi! I'm ${petName(s.pet)}. Tap me or drag me` : 'none')
      set('hint', hint)
      if (pendingPlay && s.action !== 'flow') { pendingPlay = false; setTimeout(() => preview.play(s.action), 60) }
    }

    function update() {
      const duo = state.pet === DUO
      $('#sizeOut').textContent = `${state.size}px`
      $('#sideWrap').hidden = state.mode !== 'roam'
      $('#ctlAcc').parentElement.hidden = duo || isPhoto(state.pet)
      $('#ctlHint').placeholder = duo ? 'Bubu & Dudu say hi!' : `Hi! I'm ${petName(state.pet)}. Tap me or drag me`
      $('#modeNote').textContent = state.mode === 'roam'
        ? `Roam mode: ${petName(state.pet)} ${duo ? 'stroll' : 'walks'} along the bottom of the visitor's screen${duo ? ', hand in hand' : ' and can be dragged and thrown'}. Press "Try it live" to see it on this page.`
        : `Sit-in-place mode: ${petName(state.pet)} ${duo ? 'stay' : 'stays'} inside your layout, right where you paste the tag.`
      renderPreview()
      $('#codeOut').innerHTML = highlight(snippet(state.tab))
    }

    $$('.code__tabs [role=tab]').forEach((t) => t.addEventListener('click', () => {
      state.tab = t.dataset.tab
      $$('.code__tabs [role=tab]').forEach((x) => x.setAttribute('aria-selected', String(x === t)))
      update()
    }))
    $('#copyBtn').addEventListener('click', () => copy(snippet(state.tab), 'Code copied! Paste it into your site'))
    $('#replay').addEventListener('click', () => {
      if (!preview) return
      const list = listFor(state.pet)
      preview.play(state.action === 'flow' ? list[Math.floor(Math.random() * list.length)].id : state.action)
    })

    // "Try it live" puts the configured pet on this very page.
    $('#tryLive').addEventListener('click', () => {
      if (state.mode === 'inline') { toast('Switch to "Roam the page" to try it live'); return }
      let live = $('#livePet')
      if (live && live.localName !== tagOf()) { live.remove(); live = null }
      if (!live) { live = document.createElement(tagOf()); live.id = 'livePet'; document.body.append(live) }
      Array.from(live.attributes).forEach((at) => at.name !== 'id' && live.removeAttribute(at.name))
      attrs().forEach(([k, v]) => live.setAttribute(k, v))
      toast(`${petName(state.pet)} just moved in. Look at the bottom of the screen!`)
    })

    // Cards and gallery buttons that jump into the playground.
    function usePet(id, action) {
      const prev = state.pet
      state.pet = id; setSeg($('#ctlPet'), id)
      if ((id === DUO) !== (prev === DUO)) state.action = 'flow'
      if (action) { state.action = action; pendingPlay = true }
      resize(prev, state.mode)
      renderActionChips()
      update()
      $('#playground').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' })
    }
    document.addEventListener('click', (e) => {
      const u = e.target.closest('[data-use]')
      if (u) usePet(u.dataset.use, u.dataset.action)
    })

    renderActionChips()
    update()

    // ------------------------------------------------------------- gallery
    let galleryPet = 'bubu'
    $('#galleryPet').innerHTML = pets.map((p) =>
      `<button type="button" data-v="${p.id}" aria-pressed="${p.id === galleryPet}">${miniPet(p.id)}${p.name}</button>`).join('') +
      `<button type="button" data-v="${DUO}" aria-pressed="false">${miniDuo}Together</button>`
    function renderGallery() {
      const duo = galleryPet === DUO
      const list = listFor(galleryPet)
      $('#gallery').classList.toggle('gallery--duo', duo)
      $('#gallery').innerHTML = list.map((a, i) => `
        <article class="act reveal is-in" style="--i:${i}">
          <div class="act__stage">${duo
            ? `<pet-duo pets="bubu dudu" mode="inline" size="92" scene="${a.id}" hint="none"></pet-duo>`
            : `<pet-buddy pet="${galleryPet}" mode="inline" size="${isPhoto(galleryPet) ? 100 : 112}" action="${a.id}" hint="none"></pet-buddy>`}</div>
          <h3>${a.label}</h3>
          <p>${a.about}</p>
          <code>${duo ? 'scene' : 'action'}="${a.id}"</code>
          <div class="act__btns">
            <button type="button" class="mini-btn" data-copy="${a.id}">Copy</button>
            <button type="button" class="mini-btn mini-btn--ghost" data-use="${galleryPet}" data-action="${a.id}">Customize</button>
          </div>
        </article>`).join('')
    }
    $('#galleryPet').addEventListener('click', (e) => {
      const b = e.target.closest('button[data-v]')
      if (!b) return
      galleryPet = b.dataset.v; setSeg($('#galleryPet'), galleryPet)
      renderGallery()
    })
    $('#gallery').addEventListener('click', (e) => {
      const b = e.target.closest('[data-copy]')
      if (!b) return
      const id = b.dataset.copy
      const line = galleryPet === DUO ? oneLine([['pets', 'bubu dudu'], ['scene', id]]) : oneLine([['pet', galleryPet], ['action', id]])
      copy(line, `${petName(galleryPet)} · ${id} copied. Paste it before </body>`)
    })
    renderGallery()

    // ------------------------------------------------------------- install code
    $('#stepScript').innerHTML = highlight(oneLine([['pet', 'dudu']]))
    $('#stepDuo').innerHTML = highlight(oneLine([['pets', 'bubu dudu']]))
    $$('[data-copy-from]').forEach((b) => b.addEventListener('click', () => copy($('#' + b.dataset.copyFrom).textContent, 'Copied! Paste it before </body>')))
    $('#registerCode').innerHTML = highlight(`// After petbuddy.js has loaded:
PetBuddy.register({
  id: 'mochi',            // <pet-buddy pet="mochi">
  name: 'Mochi',
  ears: 'bear',           // 'bear' or 'panda'
  fur: '#ffd9e4',
  ear: '#ffd9e4',
  earInner: '#f39bb5',
  ink: '#5b3140',          // outlines
  eye: '#3d1f2a',
  blush: '#ff9fb8',
})`)

    // ------------------------------------------------------------- hero
    const heroDuo = $('#heroDuo')
    $$('.stage__chips [data-scene]').forEach((b) => b.addEventListener('click', () => {
      heroDuo.play(b.dataset.scene)
      if (b.dataset.scene === 'hug' || b.dataset.scene === 'kiss') burstHearts(10)
    }))

    const heartsBox = $('.stage__hearts')
    function burstHearts(n) {
      if (reduced) return
      for (let i = 0; i < n; i++) {
        const h = document.createElement('span')
        h.textContent = ['♥', '❤', '♡'][i % 3]
        h.style.left = `${20 + Math.random() * 60}%`
        h.style.setProperty('--d', `${(Math.random() * 0.8).toFixed(2)}s`)
        h.style.setProperty('--x', `${(Math.random() * 80 - 40).toFixed(0)}px`)
        h.style.fontSize = `${14 + Math.random() * 18}px`
        heartsBox.append(h)
        setTimeout(() => h.remove(), 2800)
      }
    }
    if (!reduced) setInterval(() => !document.hidden && burstHearts(1), 1400)

    // Stage tilts gently toward the pointer.
    const stage = $('.stage')
    if (!reduced && window.matchMedia('(pointer: fine)').matches) {
      stage.addEventListener('pointermove', (e) => {
        const r = stage.getBoundingClientRect()
        const px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5
        stage.style.setProperty('--rx', `${(-py * 6).toFixed(2)}deg`)
        stage.style.setProperty('--ry', `${(px * 8).toFixed(2)}deg`)
      })
      stage.addEventListener('pointerleave', () => { stage.style.setProperty('--rx', '0deg'); stage.style.setProperty('--ry', '0deg') })
    }

    // ------------------------------------------------------------- reveal + counters
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return
        en.target.classList.add('is-in')
        io.unobserve(en.target)
        $$('[data-count]', en.target).forEach(countUp)
      })
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' })
    $$('.reveal').forEach((el) => io.observe(el))

    function countUp(el) {
      const to = +el.dataset.count, t0 = performance.now(), dur = reduced ? 0 : 1100
      const tick = (t) => {
        const k = dur ? Math.min(1, (t - t0) / dur) : 1
        el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3)))
        if (k < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }

    // Nav gets a backdrop once you scroll.
    const nav = $('.nav')
    const onScroll = () => nav.classList.toggle('is-stuck', window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true }); onScroll()

    document.documentElement.classList.add('is-ready')
  })
})()
