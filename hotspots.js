/* ═══════════════════════════════════════════════════════
   TOY LAB OS — Hotspot Interaction Logic
   ═══════════════════════════════════════════════════════ */

(function () {
  'use strict'

  function init() {
    const scene = document.querySelector('.desk-scene')
    if (!scene) return

    // Parallax on mouse move
    scene.addEventListener('mousemove', handleParallax)

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

    // Debug: force-hover a hotspot via URL hash, e.g. index.html#hover-hs-toy1
    if (location.hash.startsWith('#hover-')) {
      const target = document.getElementById(location.hash.slice(7))
      if (target) {
        target.classList.add('force-hover')
        scene.classList.add('has-hover')
      }
    }
  }

  function handleParallax(e) {
    const bg = document.querySelector('.desk-bg')
    if (!bg) return

    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5

    bg.style.transform = `translate(${x * -6}px, ${y * -4}px) scale(1.01)`
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
