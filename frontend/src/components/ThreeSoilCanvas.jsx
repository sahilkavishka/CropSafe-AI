import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * ThreeSoilCanvas
 * Interactive 3D Soil Horizon & Acidity Neutralization Visualizer.
 * Shows topsoil, subsoil, root structures, and dynamic neutralization with Dolomite.
 * 
 * Props:
 * - phValue: number (e.g. 4.5 to 7.5)
 * - dolomiteAppliedKg: number (e.g. 0 to 500)
 */
export default function ThreeSoilCanvas({ phValue = 5.0, dolomiteAppliedKg = 150 }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    const width = currentMount.clientWidth || 320;
    const height = currentMount.clientHeight || 260;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a140d); // Deep fertile agrarian night

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(3.5, 3.0, 4.5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    currentMount.appendChild(renderer.domElement);

    // 2. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff7ed, 1.6);
    sunLight.position.set(5, 8, 4);
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0x34d399, 0.8);
    rimLight.position.set(-5, -2, -4);
    scene.add(rimLight);

    // Group for soil block
    const soilGroup = new THREE.Group();
    scene.add(soilGroup);

    // Dynamic soil color based on pH
    // Highly acidic (pH 4.0-5.0): Reddish-ochre stressed soil (0xa14420)
    // Moderate acid (pH 5.1-5.9): Stressed clay (0x854d0e)
    // Healthy Neutral (pH 6.0-7.0): Rich fertile dark loamy humus (0x1b4332 / 0x27272a)
    let topsoilColor = 0x22c55e;
    let soilBodyColor = 0x3d2719;

    if (phValue < 5.0) {
      topsoilColor = 0xd97706; // Yellowed grass
      soilBodyColor = 0x7c2d12; // Acidic burned earth
    } else if (phValue < 5.8) {
      topsoilColor = 0x84cc16; // Moderate pale grass
      soilBodyColor = 0x5a3825; // Moderate soil
    } else {
      topsoilColor = 0x16a34a; // Lush emerald rice paddy grass
      soilBodyColor = 0x2d1e14; // Fertile black/dark humus
    }

    // 3. Topsoil Grass Layer (Cuboid slice)
    const grassGeo = new THREE.BoxGeometry(2.4, 0.25, 2.4);
    const grassMat = new THREE.MeshStandardMaterial({
      color: topsoilColor,
      roughness: 0.6,
      metalness: 0.1
    });
    const grassMesh = new THREE.Mesh(grassGeo, grassMat);
    grassMesh.position.y = 0.8;
    soilGroup.add(grassMesh);

    // 4. Subsoil Humus Core (A horizon & B horizon)
    const soilGeo = new THREE.BoxGeometry(2.35, 1.5, 2.35);
    const soilMat = new THREE.MeshStandardMaterial({
      color: soilBodyColor,
      roughness: 0.9,
      metalness: 0.05
    });
    const soilMesh = new THREE.Mesh(soilGeo, soilMat);
    soilMesh.position.y = -0.05;
    soilGroup.add(soilMesh);

    // 5. Parent Bedrock base (C horizon)
    const rockGeo = new THREE.BoxGeometry(2.3, 0.4, 2.3);
    const rockMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.95
    });
    const rockMesh = new THREE.Mesh(rockGeo, rockMat);
    rockMesh.position.y = -1.0;
    soilGroup.add(rockMesh);

    // 6. Root System inside Soil
    const rootMat = new THREE.MeshStandardMaterial({
      color: phValue < 5.2 ? 0xa16207 : 0xfef08a,
      roughness: 0.7
    });

    const rootGroup = new THREE.Group();
    // Primary taproots and side roots
    const rootSegments = [
      { start: [0, 0.7, 0], end: [0, -0.6, 0], r: 0.035 },
      { start: [0, 0.4, 0], end: [-0.4, 0.0, 0.3], r: 0.025 },
      { start: [0, 0.3, 0], end: [0.5, -0.1, -0.2], r: 0.025 },
      { start: [0, 0.1, 0], end: [-0.3, -0.4, -0.4], r: 0.02 },
      { start: [0, 0.0, 0], end: [0.4, -0.5, 0.4], r: 0.02 },
      { start: [-0.4, 0.0, 0.3], end: [-0.7, -0.3, 0.5], r: 0.015 },
      { start: [0.5, -0.1, -0.2], end: [0.8, -0.4, -0.3], r: 0.015 }
    ];

    rootSegments.forEach(seg => {
      const p1 = new THREE.Vector3(...seg.start);
      const p2 = new THREE.Vector3(...seg.end);
      const dir = new THREE.Vector3().subVectors(p2, p1);
      const length = dir.length();
      const geom = new THREE.CylinderGeometry(seg.r * 0.8, seg.r, length, 6);
      geom.translate(0, length / 2, 0);
      geom.rotateX(Math.PI / 2);
      
      const mesh = new THREE.Mesh(geom, rootMat);
      mesh.position.copy(p1);
      mesh.lookAt(p2);
      rootGroup.add(mesh);
    });
    soilGroup.add(rootGroup);

    // 7. Calcium/Magnesium Dolomite Particles showering onto soil
    const particleCount = phValue < 5.8 ? 50 : 25;
    const particleGeo = new THREE.DodecahedronGeometry(0.045, 0);
    const particleMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.3,
      emissive: 0x6ee7b7,
      emissiveIntensity: 0.4
    });

    const particles = [];
    for (let i = 0; i < particleCount; i++) {
      const mesh = new THREE.Mesh(particleGeo, particleMat);
      mesh.position.set(
        (Math.random() - 0.5) * 2.0,
        1.0 + Math.random() * 1.5,
        (Math.random() - 0.5) * 2.0
      );
      mesh.userData = {
        speed: 0.015 + Math.random() * 0.02,
        rotSpeed: (Math.random() - 0.5) * 0.05
      };
      soilGroup.add(mesh);
      particles.push(mesh);
    }

    // 8. Interaction: Drag / Touch to Rotate
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const handlePointerDown = (e) => {
      isDragging = true;
      previousMousePosition = {
        x: e.clientX || (e.touches && e.touches[0].clientX) || 0,
        y: e.clientY || (e.touches && e.touches[0].clientY) || 0
      };
    };

    const handlePointerMove = (e) => {
      if (!isDragging) return;
      const currentX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      const currentY = e.clientY || (e.touches && e.touches[0].clientY) || 0;

      const deltaX = currentX - previousMousePosition.x;
      const deltaY = currentY - previousMousePosition.y;

      soilGroup.rotation.y += deltaX * 0.012;
      soilGroup.rotation.x += deltaY * 0.008;

      // Clamp X rotation to avoid full upside down
      soilGroup.rotation.x = Math.max(-0.6, Math.min(0.6, soilGroup.rotation.x));

      previousMousePosition = { x: currentX, y: currentY };
    };

    const handlePointerUp = () => {
      isDragging = false;
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', handlePointerDown);
    dom.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);

    dom.addEventListener('touchstart', handlePointerDown, { passive: true });
    dom.addEventListener('touchmove', handlePointerMove, { passive: true });
    window.addEventListener('touchend', handlePointerUp);

    // Initial slight angle
    soilGroup.rotation.y = 0.6;
    soilGroup.rotation.x = 0.2;

    // 9. Animation Loop
    let animId;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Gentle auto spin when not dragging
      if (!isDragging) {
        soilGroup.rotation.y += 0.004;
      }

      // Dolomite particle rain animation
      particles.forEach(p => {
        p.position.y -= p.userData.speed;
        p.rotation.x += p.userData.rotSpeed;
        p.rotation.y += p.userData.rotSpeed;

        // Reset to top when hits soil surface
        if (p.position.y < 0.9) {
          p.position.y = 2.4;
          p.position.x = (Math.random() - 0.5) * 2.0;
          p.position.z = (Math.random() - 0.5) * 2.0;
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!currentMount) return;
      const w = currentMount.clientWidth;
      const h = currentMount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      dom.removeEventListener('mousedown', handlePointerDown);
      dom.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      dom.removeEventListener('touchstart', handlePointerDown);
      dom.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
      if (currentMount && renderer.domElement) {
        currentMount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [phValue, dolomiteAppliedKg]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center select-none overflow-hidden rounded-2xl bg-gradient-to-b from-slate-950 via-slate-900 to-emerald-950">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
      
      {/* 3D Dynamic Legend Overlay */}
      <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-white text-[11px] font-bold space-y-0.5 pointer-events-none">
        <div className="flex items-center space-x-1.5">
          <span className={`w-2.5 h-2.5 rounded-full ${phValue < 5.2 ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`} />
          <span>පසේ තත්ත්වය: {phValue < 5.2 ? 'අධික ඇඹුල් (Acidic)' : (phValue < 5.8 ? 'මධ්‍යස්ථ (Mild Acid)' : 'නිරෝගී සාරවත් (Healthy)')}</span>
        </div>
        <div className="text-[10px] text-slate-300 font-medium">
          pH අගය: <strong className="text-white">{phValue.toFixed(1)}</strong> • ඩොලමයිට් මාත්‍රාව: <strong className="text-emerald-300">{dolomiteAppliedKg} kg/ac</strong>
        </div>
      </div>

      {/* Touch/Drag hint */}
      <div className="absolute bottom-2.5 right-3 bg-black/50 px-2.5 py-1 rounded-lg text-[10px] text-slate-300 font-semibold pointer-events-none border border-white/5">
        🔄 3D කරකවා බලන්න (360° Rotate)
      </div>
    </div>
  );
}
