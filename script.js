console.log('Script loaded, THREE defined:', typeof THREE !== 'undefined');

if (typeof THREE === 'undefined') {
  document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:monospace;font-size:18px;color:#333">Three.js 加载失败，请检查网络连接</div>';
} else {
  initThree();
}

function initThree() {
  const canvas = document.getElementById('three-canvas');
  if (!canvas) {
    console.error('Canvas element not found');
    return;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  camera.position.z = 12;

  const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 0.3);
  scene.add(hemi);

  const keyLight = new THREE.DirectionalLight(0xffffff, 1.6);
  keyLight.position.set(6, 6, 6);
  scene.add(keyLight);

  const fill = new THREE.DirectionalLight(0x8888ff, 0.4);
  fill.position.set(-4, 2, 3);
  scene.add(fill);

  const backLight = new THREE.DirectionalLight(0xffffff, 0.5);
  backLight.position.set(-2, -3, -6);
  scene.add(backLight);

  const rim = new THREE.PointLight(0xffffcc, 0.7, 20);
  rim.position.set(0, -4, 4);
  scene.add(rim);

  const orbit = new THREE.DirectionalLight(0xffccaa, 0.5);
  scene.add(orbit);

  const letters = [];
  const letterFiles = ['L', 'B', 'L', 'D', 'E', 'S', 'I', 'G', 'N'];

  const positions = [
    { x: -3.5, y: 1.5, z: 0, rot: -0.2 },
    { x: -1.5, y: -0.5, z: 1, rot: 0.15 },
    { x: 0.5, y: 2, z: -1, rot: -0.1 },
    { x: -2.5, y: -2, z: 0.5, rot: 0.25 },
    { x: 2, y: 0.5, z: 0.5, rot: -0.18 },
    { x: 3.5, y: -0.5, z: -0.5, rot: 0.12 },
    { x: 1, y: -1.5, z: 1, rot: -0.22 },
    { x: 2.5, y: 2, z: -1, rot: 0.2 },
    { x: 4, y: 0, z: 0, rot: -0.15 }
  ];

  let loadedCount = 0;

  if (typeof THREE.GLTFLoader === 'undefined') {
    console.error('GLTFLoader not loaded');
    document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:monospace;font-size:18px;color:#333">GLTFLoader 加载失败 — 请通过 http://localhost:8080 访问</div>';
    return;
  }

  console.log('GLTFLoader ready, loading GLB files...');
  const loader = new THREE.GLTFLoader();

  letterFiles.forEach((letter, i) => {
    const pos = positions[i];
    const url = letter + '.glb';
    console.log('Loading:', url);

    loader.load(
      url,
      (gltf) => {
        const model = gltf.scene;

        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 2.2 / maxDim;
        model.scale.setScalar(scale);

        const center = box.getCenter(new THREE.Vector3());
        model.position.set(
          pos.x - center.x * scale,
          pos.y - center.y * scale,
          pos.z - center.z * scale
        );

        model.rotation.z = pos.rot;

        model.userData = {
          baseX: model.position.x,
          baseY: model.position.y,
          baseZ: model.position.z,
          baseRot: pos.rot,
          speedX: 0.3 + Math.random() * 0.4,
          speedY: 0.2 + Math.random() * 0.3,
          speedZ: 0.15 + Math.random() * 0.2,
          phaseX: Math.random() * Math.PI * 2,
          phaseY: Math.random() * Math.PI * 2,
          phaseZ: Math.random() * Math.PI * 2,
          rotSpeed: 0.2 + Math.random() * 0.3,
          rotPhase: Math.random() * Math.PI * 2
        };

        scene.add(model);
        letters.push(model);
        loadedCount++;
        console.log('✓ Loaded:', letter, '(' + loadedCount + '/9)', 'pos:', model.position);
      },
      (progress) => {
        if (progress.total) console.log('Loading:', letter, Math.round(progress.loaded / progress.total * 100) + '%');
      },
      (error) => {
        console.error('✗ Failed to load:', letter, url, error);
      }
    );
  });

  const clock = new THREE.Clock();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    orbit.position.x = Math.sin(t * 0.7) * 10;
    orbit.position.y = Math.cos(t * 0.5) * 7;
    orbit.position.z = Math.sin(t * 0.4 + 1) * 8;

    letters.forEach((m) => {
      const d = m.userData;
      const tX = t * d.speedX + d.phaseX;
      const tY = t * d.speedY + d.phaseY;
      m.position.x = d.baseX + Math.sin(tX) * 0.8;
      m.position.y = d.baseY + Math.sin(tY) * 0.6;
      m.position.z = d.baseZ + Math.sin(t * d.speedZ + d.phaseZ) * 0.4;
      m.rotation.z = d.baseRot + Math.sin(t * d.rotSpeed + d.rotPhase) * 0.15;
      m.rotation.x = Math.sin(tX * 0.6 + d.phaseX) * 0.1;
      m.rotation.y = Math.cos(tY * 0.6 + d.phaseY) * 0.08;
    });

    renderer.render(scene, camera);
  }

  animate();

  document.querySelectorAll('.nav-btn').forEach((btn) => {
    btn.addEventListener('click', (event) => {
      event.preventDefault();
      const targetId = btn.getAttribute('href');
      const targetSection = document.querySelector(targetId);
      if (targetSection) {
        targetSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}
