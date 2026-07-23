/* TOY LAB OS — Object link initialization */
(function () {
  'use strict'

  function init() {
    const hotspots = document.querySelectorAll('.hotspot')
    if (!hotspots.length) return

    hotspots.forEach((hotspot, index) => {
      hotspot.style.opacity = '0'
      hotspot.style.transform = 'translateY(16px)'

      window.setTimeout(() => {
        hotspot.style.transition = 'opacity 0.6s ease, transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)'
        hotspot.style.opacity = '1'
        hotspot.style.transform = 'translateY(0)'
      }, 320 + index * 140)

      hotspot.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          hotspot.click()
        }
      })
    })
  }

  document.addEventListener('click', event => {
    const hotspot = event.target.closest('.hotspot')
    if (!hotspot) return

    const href = hotspot.getAttribute('href')
    if (!href || href.startsWith('#')) return

    event.preventDefault()
    document.body.classList.add('route-leaving')
    window.setTimeout(() => {
      window.location.href = href
    }, 240)
  })

  window.addEventListener('load', () => {
    document.body.style.opacity = '0'
    document.body.style.transition = 'opacity 0.5s ease'
    requestAnimationFrame(() => {
      document.body.style.opacity = '1'
    })
  })

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }
})()
