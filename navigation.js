/* Shared navigation and scroll routing */
(function () {
  'use strict'

  const page = document.body.dataset.page || ''
  const navLinks = Array.from(document.querySelectorAll('[data-nav]'))
  const detailOrder = ['easel', 'sculpture', 'art-toy']
  let navigating = false
  let wheelDistance = 0
  let wheelDirection = 0
  let wheelResetTimer = 0
  let touchStartY = 0
  let lanyardVisible = false

  function setActiveNav(key) {
    navLinks.forEach(link => {
      link.classList.toggle('active', link.dataset.nav === key)
    })
  }

  function triggerLanyardGravity() {
    window.__lanyardGravityPending = true
    window.setTimeout(() => {
      window.dispatchEvent(new CustomEvent('lanyard:gravity'))
    }, 560)
  }

  function activateHomeSection(sectionId) {
    setActiveNav(sectionId === 'lanyard' ? 'about' : 'home')

    if (sectionId === 'lanyard' && !lanyardVisible) {
      lanyardVisible = true
      triggerLanyardGravity()
    } else if (sectionId !== 'lanyard') {
      lanyardVisible = false
    }
  }

  function isIndexPath(pathname) {
    const fileName = pathname.split('/').pop()
    return fileName === '' || fileName === 'index.html'
  }

  function initHomeNavigation() {
    const homeSection = document.getElementById('home')
    const lanyardSection = document.getElementById('lanyard')
    if (!homeSection || !lanyardSection) return

    navLinks.forEach(link => {
      const targetUrl = new URL(link.href, window.location.href)
      if (!isIndexPath(targetUrl.pathname) || !targetUrl.hash) return

      link.addEventListener('click', event => {
        const target = document.querySelector(targetUrl.hash)
        if (!target) return

        event.preventDefault()
        target.scrollIntoView({ behavior: 'smooth', block: 'start' })
        history.replaceState(null, '', targetUrl.hash)
        activateHomeSection(target.id)
      })
    })

    const observer = new IntersectionObserver(entries => {
      const mostVisible = entries
        .filter(entry => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]

      if (mostVisible) activateHomeSection(mostVisible.target.id)
    }, { threshold: [0.35, 0.6, 0.85] })

    observer.observe(homeSection)
    observer.observe(lanyardSection)

    if (location.hash === '#lanyard') {
      activateHomeSection('lanyard')
    } else {
      activateHomeSection('home')
    }
  }

  function routeForDirection(direction) {
    if (page === 'home') {
      return direction > 0 ? 'section.html?id=easel' : null
    }

    if (page === 'works') {
      const currentId = new URLSearchParams(location.search).get('id')
      const currentIndex = Math.max(0, detailOrder.indexOf(currentId))
      const nextIndex = currentIndex + direction

      if (nextIndex < 0) return 'index.html#lanyard'
      if (nextIndex >= detailOrder.length) return null
      return `section.html?id=${detailOrder[nextIndex]}`
    }

    return null
  }

  function navigateTo(url) {
    if (!url || navigating) return
    navigating = true
    document.body.classList.add('route-leaving')
    window.setTimeout(() => {
      window.location.href = url
    }, 240)
  }

  function isAtBoundary(direction) {
    if (direction < 0) return window.scrollY <= 2
    return window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2
  }

  function handleBoundaryScroll(direction, distance) {
    if (!isAtBoundary(direction)) {
      wheelDistance = 0
      wheelDirection = 0
      return
    }

    if (wheelDirection !== direction) {
      wheelDistance = 0
      wheelDirection = direction
    }

    wheelDistance += Math.min(Math.abs(distance), 80)
    window.clearTimeout(wheelResetTimer)
    wheelResetTimer = window.setTimeout(() => {
      wheelDistance = 0
      wheelDirection = 0
    }, 420)

    if (wheelDistance >= 180) {
      wheelDistance = 0
      navigateTo(routeForDirection(direction))
    }
  }

  window.addEventListener('wheel', event => {
    if (event.ctrlKey || navigating || Math.abs(event.deltaY) < 4) return
    handleBoundaryScroll(event.deltaY > 0 ? 1 : -1, event.deltaY)
  }, { passive: true })

  window.addEventListener('touchstart', event => {
    if (event.touches.length === 1) touchStartY = event.touches[0].clientY
  }, { passive: true })

  window.addEventListener('touchend', event => {
    if (!touchStartY || navigating) return
    const endY = event.changedTouches[0]?.clientY || touchStartY
    const delta = touchStartY - endY
    touchStartY = 0
    if (Math.abs(delta) < 70) return

    const direction = delta > 0 ? 1 : -1
    if (isAtBoundary(direction)) navigateTo(routeForDirection(direction))
  }, { passive: true })

  if (page === 'home') {
    initHomeNavigation()
  } else {
    setActiveNav(page)
  }
})()
