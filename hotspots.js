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

    // Stagger entrance animation
    const allHotspots = document.querySelectorAll('.hotspot')
    allHotspots.forEach((hs, i) => {
      hs.style.opacity = '0'
      hs.style.transform = 'translateY(20px)'
      setTimeout(() => {
        hs.style.transition = 'opacity 0.6s ease, transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)'
        hs.style.opacity = '1'
        hs.style.transform = 'translateY(0)'
      }, 400 + i * 150)
    })

    // Keyboard support
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
