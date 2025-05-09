import * as THREE from 'three';

// Shield visualization for hero section
export function createShieldScene(container: HTMLElement) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    70, 
    container.clientWidth / container.clientHeight, 
    0.1, 
    1000
  );
  
  const renderer = new THREE.WebGLRenderer({ 
    antialias: true, 
    alpha: true 
  });
  
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);
  
  // Create a shield-like shape
  const geometry = new THREE.SphereGeometry(2, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2);
  const material = new THREE.MeshStandardMaterial({ 
    color: 0x1A6DB3,
    metalness: 0.8,
    roughness: 0.2,
    transparent: true,
    opacity: 0.9
  });
  
  const shield = new THREE.Mesh(geometry, material);
  shield.rotation.x = Math.PI;
  shield.position.y = -0.5;
  scene.add(shield);
  
  // Add ambient light
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);
  
  // Add directional light
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(5, 10, 7);
  scene.add(directionalLight);
  
  camera.position.z = 5;
  
  // Animation function
  function animate() {
    shield.rotation.y += 0.01;
    renderer.render(scene, camera);
  }
  
  // Handle window resize
  const handleResize = () => {
    if (!container) return;
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  };
  
  window.addEventListener('resize', handleResize);
  
  return {
    animate,
    cleanup: () => {
      window.removeEventListener('resize', handleResize);
      container.removeChild(renderer.domElement);
      renderer.dispose();
    }
  };
}

// Deepfake visualization 
export function createDeepfakeScene(container: HTMLElement) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    70, 
    container.clientWidth / container.clientHeight, 
    0.1, 
    1000
  );
  
  const renderer = new THREE.WebGLRenderer({ 
    antialias: true, 
    alpha: true 
  });
  
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);
  
  // Create a face-like wireframe
  const geometry = new THREE.SphereGeometry(1.5, 16, 16);
  const material = new THREE.MeshBasicMaterial({ 
    color: 0x0F4C81,
    wireframe: true
  });
  
  const faceWireframe = new THREE.Mesh(geometry, material);
  scene.add(faceWireframe);
  
  // Add points to represent facial landmarks
  const pointsGeometry = new THREE.BufferGeometry();
  const pointsMaterial = new THREE.PointsMaterial({ 
    color: 0x00A878, 
    size: 0.1
  });
  
  // Generate points on sphere surface
  const pointsCount = 50;
  const positions = [];
  for (let i = 0; i < pointsCount; i++) {
    const phi = Math.acos(-1 + (2 * i) / pointsCount);
    const theta = Math.sqrt(pointsCount * Math.PI) * phi;
    
    positions.push(
      1.5 * Math.cos(theta) * Math.sin(phi),
      1.5 * Math.sin(theta) * Math.sin(phi),
      1.5 * Math.cos(phi)
    );
  }
  
  pointsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  const points = new THREE.Points(pointsGeometry, pointsMaterial);
  scene.add(points);
  
  camera.position.z = 4;
  
  // Animation function
  function animate() {
    faceWireframe.rotation.y += 0.005;
    points.rotation.y += 0.005;
    renderer.render(scene, camera);
  }
  
  // Handle window resize
  const handleResize = () => {
    if (!container) return;
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  };
  
  window.addEventListener('resize', handleResize);
  
  return {
    animate,
    cleanup: () => {
      window.removeEventListener('resize', handleResize);
      container.removeChild(renderer.domElement);
      renderer.dispose();
    }
  };
}
