/* ═══════════════════════════════════════════════════════
   TOY LAB OS — Hotspot Interaction Logic
   ═══════════════════════════════════════════════════════ */

(function () {
  'use strict'

  let pointerFrame = 0
  let pendingPointer = null

  function init() {
    const scene = document.querySelector('.desk-scene')
    if (!scene) return

    initLanyardNavigation()

    // Cursor-following light and subtle scene parallax
    scene.addEventListener('pointermove', handleLight)
    scene.addEventListener('pointerleave', resetLight)

    // Add has-hover class to scene when any hotspot is hovered
    const hotspots = document.querySelectorAll('.hotspot')
    hotspots.forEach(hs => {
      hs.addEventListener('mouseenter', () => scene.classList.add('has-hover'))
      hs.addEventListener('mouseleave', () => scene.classList.remove('has-hover'))
    })

    // Stagger entrance animation
    hotspots.forEach((hs, i) => {
      hs.style.opacity = '0'
      hs.style.transform = 'translateY(16px)'
      setTimeout(() => {
        hs.style.transition = 'opacity 0.6s ease, transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)'
        hs.style.opacity = '1'
        hs.style.transform = 'translateY(0)'
      }, 400 + i * 150)
    })

    // Keyboard support
    hotspots.forEach(hs => {
      hs.setAttribute('tabindex', '0')
      hs.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          hs.click()
        }
      })
    })

    console.log('🎮 TOY LAB OS — Hotspots initialized')

    // Debug: force-hover a hotspot via URL hash, e.g. index.html#hover-hs-easel
    if (location.hash.startsWith('#hover-')) {
      const target = document.getElementById(location.hash.slice(7))
      if (target) {
        target.classList.add('force-hover')
        scene.classList.add('has-hover')
      }
    }
  }

  function initLanyardNavigation() {
    const link = document.querySelector('[data-lanyard-link]')
    const section = document.getElementById('lanyard')
    if (!link || !section) return

    const dispatchGravity = () => {
      window.dispatchEvent(new CustomEvent('lanyard:gravity'))
    }

    link.addEventListener('click', (event) => {
      event.preventDefault()
      window.__lanyardGravityPending = true
      section.scrollIntoView({ behavior: 'smooth', block: 'start' })
      history.replaceState(null, '', '#lanyard')
      setTimeout(dispatchGravity, 650)
    })

    if (location.hash === '#lanyard') {
      window.__lanyardGravityPending = true
      setTimeout(dispatchGravity, 650)
    }
  }
  function handleLight(e) {
    if (e.pointerType === 'touch') return

    const scene = e.currentTarget
    const stage = scene.querySelector('.desk-stage')
    if (!stage) return

    const rect = scene.getBoundingClientRect()
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height))

    pendingPointer = { scene, stage, x, y }
    if (pointerFrame) return

    pointerFrame = requestAnimationFrame(() => {
      const { scene: activeScene, stage: activeStage, x: activeX, y: activeY } = pendingPointer
      activeScene.style.setProperty('--light-x', `${(activeX * 100).toFixed(2)}%`)
      activeScene.style.setProperty('--light-y', `${(activeY * 100).toFixed(2)}%`)
      activeStage.style.setProperty('--stage-x', `${(activeX - 0.5) * -14}px`)
      activeStage.style.setProperty('--stage-y', `${(activeY - 0.5) * -9}px`)
      pointerFrame = 0
    })
  }

  function resetLight(e) {
    const scene = e.currentTarget
    const stage = scene.querySelector('.desk-stage')
    scene.style.setProperty('--light-x', '50%')
    scene.style.setProperty('--light-y', '34%')
    if (stage) {
      stage.style.setProperty('--stage-x', '0px')
      stage.style.setProperty('--stage-y', '0px')
    }
  }

  // Smooth page transition on click
  document.addEventListener('click', (e) => {
    const hotspot = e.target.closest('.hotspot')
    if (!hotspot) return

    const href = hotspot.getAttribute('href')
    if (!href || href.startsWith('#')) return

    e.preventDefault()
    document.body.style.transition = 'opacity 0.3s ease'
    document.body.style.opacity = '0'
    setTimeout(() => { window.location.href = href }, 300)
  })

  // Fade in on load
  window.addEventListener('load', () => {
    document.body.style.opacity = '0'
    document.body.style.transition = 'opacity 0.5s ease'
    requestAnimationFrame(() => { document.body.style.opacity = '1' })
  })

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }
})()
