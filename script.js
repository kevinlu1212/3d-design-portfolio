console.log('Glass Portfolio — loading...')

if (typeof THREE === 'undefined') {
  document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:monospace;font-size:18px;color:#333">Three.js 加载失败</div>'
} else {
  initScene()
}

function initScene() {
  const canvas = document.getElementById('three-canvas')
  if (!canvas) { console.error('Canvas not found'); return }

  // ─── Renderer ───────────────────────────────────────────
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setClearColor(0x000000, 0)
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.0
  renderer.outputEncoding = THREE.sRGBEncoding

  // ─── Scene & Camera ──────────────────────────────────────
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 100)
  camera.position.set(0, 0, 8)

  // ─── Controls (mouse drag) ───────────────────────────────
  const controls = new THREE.OrbitControls(camera, canvas)
  controls.enableZoom = false
  controls.enablePan = false
  controls.maxPolarAngle = Math.PI / 2
  controls.minPolarAngle = Math.PI / 2
  controls.autoRotate = true
  controls.autoRotateSpeed = 1.0
  controls.target.set(0, 0, 0)
  controls.update()

  // ─── Lights ──────────────────────────────────────────────
  const ambient = new THREE.AmbientLight(0x222244, 0.1)
  scene.add(ambient)

  const keyLight = new THREE.DirectionalLight(0xffffff, 2.0)
  keyLight.position.set(5, 5, 5)
  scene.add(keyLight)

  const fillLight = new THREE.DirectionalLight(0x4488ff, 0.6)
  fillLight.position.set(-5, -5, 2)
  scene.add(fillLight)

  const rimLight = new THREE.DirectionalLight(0xff6644, 0.4)
  rimLight.position.set(0, -5, -3)
  scene.add(rimLight)

  // ─── Environment Map ────────────────────────────────────
  const pmrem = new THREE.PMREMGenerator(renderer)
  pmrem.compileEquirectangularShader()

  const envCanvas = document.createElement('canvas')
  envCanvas.width = 1024
  envCanvas.height = 512
  const ctx = envCanvas.getContext('2d')

  // Warm-to-cool gradient sky
  const grad = ctx.createLinearGradient(0, 0, 1024, 0)
  grad.addColorStop(0.0, '#ff6b35')
  grad.addColorStop(0.2, '#ffd23f')
  grad.addColorStop(0.4, '#6bcb77')
  grad.addColorStop(0.6, '#4d96ff')
  grad.addColorStop(0.8, '#9b5de5')
  grad.addColorStop(1.0, '#ff6b35')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 1024, 512)

  // Bright specular hotspots
  ctx.fillStyle = 'rgba(255,255,255,0.7)'
  for (let i = 0; i < 40; i++) {
    const x = Math.random() * 1024
    const y = Math.random() * 512
    const r = 8 + Math.random() * 32
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }

  const envTexture = new THREE.CanvasTexture(envCanvas)
  envTexture.mapping = THREE.EquirectangularReflectionMapping
  const envMap = pmrem.fromEquirectangular(envTexture).texture
  pmrem.dispose()
  envTexture.dispose()

  scene.environment = envMap
  scene.environmentIntensity = 1.5

  // ─── Glass Material ────────────────────────────────────
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0.0,
    roughness: 0.02,
    transmission: 1.0,
    thickness: 0.6,
    ior: 1.5,
    clearcoat: 1.0,
    clearcoatRoughness: 0.0,
    reflectivity: 0.8,
    envMapIntensity: 2.0,
    transparent: true,
    opacity: 0.95,
    side: THREE.DoubleSide,
    attenuationColor: new THREE.Color(0xffffff),
    attenuationDistance: 0.5
  })

  // ─── Font & Text ─────────────────────────────────────────
  const letters = []
  const letterData = [
    { char: 'D', pos: [-4.5, 0.2, 0] },
    { char: 'E', pos: [-2.7, -0.3, 0.5] },
    { char: 'S', pos: [-0.9, 0.5, -0.3] },
    { char: 'I', pos: [0.9, -0.4, 0.2] },
    { char: 'G', pos: [2.7, 0.3, -0.4] },
    { char: 'N', pos: [4.5, -0.2, 0] }
  ]

  const fontLoader = new THREE.FontLoader()

  fontLoader.load(
    './helvetiker_regular.typeface.json',
    (font) => {
      letterData.forEach((item) => {
        const geom = new THREE.TextGeometry(item.char, {
          font,
          size: 1.3,
          height: 0.35,
          curveSegments: 12,
          bevelEnabled: true,
          bevelThickness: 0.03,
          bevelSize: 0.02,
          bevelOffset: 0,
          bevelSegments: 5
        })

        // Center geometry
        geom.computeBoundingBox()
        const bb = geom.boundingBox
        const cx = (bb.max.x + bb.min.x) / 2
        const cy = (bb.max.y + bb.min.y) / 2
        const cz = (bb.max.z + bb.min.z) / 2
        geom.translate(-cx, -cy, -cz)

        const mesh = new THREE.Mesh(geom, glassMat.clone())
        mesh.position.set(item.pos[0], item.pos[1], item.pos[2])
        mesh.userData = {
          baseX: item.pos[0],
          baseY: item.pos[1],
          baseZ: item.pos[2],
          phase: Math.random() * Math.PI * 2,
          speed: 1.5 + Math.random() * 0.8,
          floatAmp: 0.25 + Math.random() * 0.15,
          rotAmp: 0.06 + Math.random() * 0.04
        }

        scene.add(mesh)
        letters.push(mesh)
      })
    },
    undefined,
    (err) => console.error('Font load error:', err)
  )

  // ─── Window Resize ───────────────────────────────────────
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
  })

  // ─── Animation Loop ──────────────────────────────────────
  const clock = new THREE.Clock()

  function animate() {
    requestAnimationFrame(animate)
    const t = clock.getElapsedTime()

    // Float animation — mimics @react-three/drei <Float>
    letters.forEach((mesh) => {
      const d = mesh.userData
      const ft = t * d.speed + d.phase
      mesh.position.x = d.baseX + Math.sin(ft * 0.7) * d.floatAmp
      mesh.position.y = d.baseY + Math.sin(ft) * d.floatAmp * 1.2
      mesh.position.z = d.baseZ + Math.sin(ft * 0.5 + 1.3) * d.floatAmp * 0.6
      mesh.rotation.x = Math.sin(ft * 0.5) * d.rotAmp
      mesh.rotation.y = Math.sin(ft * 0.6 + 0.8) * d.rotAmp * 1.2
      mesh.rotation.z = Math.sin(ft * 0.4 + 1.5) * d.rotAmp * 0.8
    })

    controls.update()
    renderer.render(scene, camera)
  }

  animate()

  // ─── Scroll nav ─────────────────────────────────────────
  document.querySelectorAll('.nav-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault()
      const target = document.querySelector(btn.getAttribute('href'))
      if (target) target.scrollIntoView({ behavior: 'smooth' })
    })
  })
}
