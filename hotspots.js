/* ═══════════════════════════════════════════════════════
   TOY LAB OS — Hotspot Interaction Logic
   ═══════════════════════════════════════════════════════ */

(function () {
  'use strict'

  // ─── Hotspot Data ──────────────────────────────────────
  const hotspots = {
    monitor: {
      label: '查看作品集',
      href: '#gallery',
      sound: 'click'
    },
    poster: {
      label: '关于我',
      href: 'about.html',
      sound: 'paper'
    },
    teddy: {
      label: 'Soft Orbit',
      href: 'project.html?id=soft-orbit',
      sound: 'soft'
    },
    dino: {
      label: 'Lucky Garden',
      href: 'project.html?id=lucky-garden',
      sound: 'click'
    },
    star: {
      label: 'Daydream.exe',
      href: 'project.html?id=daydream',
      sound: 'sparkle'
    },
    calc: {
      label: 'Sweet Signal',
      href: 'project.html?id=sweet-signal',
      sound: 'click'
    }
  }

  // ─── Initialize ────────────────────────────────────────
  function init() {
    const scene = document.querySelector('.desk-scene')
    if (!scene) return

    // Add subtle parallax on mouse move
    scene.addEventListener('mousemove', handleParallax)

    // Add entrance animation to hotspots
    const allHotspots = document.querySelectorAll('.hotspot')
    allHotspots.forEach((hs, i) => {
      hs.style.opacity = '0'
      hs.style.transform = 'scale(0.8)'
      setTimeout(() => {
        hs.style.transition = 'opacity 0.6s ease, transform 0.6s ease'
        hs.style.opacity = '1'
        hs.style.transform = 'scale(1)'
      }, 300 + i * 120)
    })

    // Keyboard navigation support
    allHotspots.forEach(hs => {
      hs.setAttribute('tabindex', '0')
      hs.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          hs.click()
        }
      })
    })

    console.log('🎮 TOY LAB OS — Hotspots initialized')
  }

  // ─── Parallax Effect ──────────────────────────────────
  function handleParallax(e) {
    const bg = document.querySelector('.desk-bg')
    if (!bg) return

    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5

    // Subtle background shift
    bg.style.transform = `translate(${x * -8}px, ${y * -5}px) scale(1.02)`

    // Move hotspots slightly for depth
    const hotspotsLayer = document.querySelector('.hotspots-layer')
    if (hotspotsLayer) {
      hotspotsLayer.style.transform = `translate(${x * 4}px, ${y * 3}px)`
    }
  }

  // ─── Smooth page transition ───────────────────────────
  document.addEventListener('click', (e) => {
    const hotspot = e.target.closest('.hotspot')
    if (!hotspot) return

    const href = hotspot.getAttribute('href')
    if (!href || href.startsWith('#')) return // internal anchors don't need transition

    e.preventDefault()

    // Fade out effect
    document.body.style.transition = 'opacity 0.3s ease'
    document.body.style.opacity = '0'

    setTimeout(() => {
      window.location.href = href
    }, 300)
  })

  // ─── Fade in on page load ─────────────────────────────
  window.addEventListener('load', () => {
    document.body.style.opacity = '0'
    document.body.style.transition = 'opacity 0.5s ease'
    requestAnimationFrame(() => {
      document.body.style.opacity = '1'
    })
  })

  // ─── Start ────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }
})()
