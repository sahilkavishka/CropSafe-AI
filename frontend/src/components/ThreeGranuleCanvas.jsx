import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeGranuleCanvas({ granuleType = 'urea', sphericity = 0.94, purityScore = 98.5 }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    // Dimensions
    const width = currentMount.clientWidth;
    const height = currentMount.clientHeight;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 4.2;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    currentMount.appendChild(renderer.domElement);

    // Group for the granule
    const granuleGroup = new THREE.Group();
    scene.add(granuleGroup);

    // Material & Geometry based on granule type
    let geometry;
    let material;

    if (granuleType === 'urea') {
      // Pure prilled Urea: Smooth translucent white pearl with crystal sheen
      geometry = new THREE.DodecahedronGeometry(1.2, 5);
      material = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        roughness: 0.18,
        metalness: 0.05,
        transmission: 0.65, // glass-like translucency
        ior: 1.48,
        reflectivity: 0.6,
        clearcoat: 0.8,
        clearcoatRoughness: 0.15,
      });
    } else if (granuleType === 'marble') {
      // Crushed Marble / Dolomite filler: Irregular rough angular polyhedron
      geometry = new THREE.DodecahedronGeometry(1.15, 1);
      material = new THREE.MeshStandardMaterial({
        color: 0xdcdde1,
        roughness: 0.85,
        metalness: 0.1,
        flatShading: true,
      });
    } else if (granuleType === 'mop') {
      // Muriate of Potash: Pinkish-reddish crystalline salt
      geometry = new THREE.OctahedronGeometry(1.2, 3);
      material = new THREE.MeshStandardMaterial({
        color: 0xeb4d4b,
        roughness: 0.45,
        metalness: 0.15,
        flatShading: true,
      });
    } else {
      // Substandard Gypsum blend: Dull chalky matte
      geometry = new THREE.SphereGeometry(1.2, 32, 32);
      material = new THREE.MeshStandardMaterial({
        color: 0xf1f2f6,
        roughness: 0.95,
        metalness: 0.0,
      });
    }

    // Apply vertex deformation based on sphericity to show physical distortion
    const pos = geometry.attributes.position;
    const distortionFactor = (1.0 - sphericity) * 0.4;
    for (let i = 0; i < pos.count; i++) {
      const vx = pos.getX(i);
      const vy = pos.getY(i);
      const vz = pos.getZ(i);
      const noise = (Math.sin(vx * 4.0) + Math.cos(vy * 4.0) + Math.sin(vz * 4.0)) * distortionFactor;
      pos.setXYZ(i, vx + vx * noise, vy + vy * noise, vz + vz * noise);
    }
    geometry.computeVertexNormals();

    const granuleMesh = new THREE.Mesh(geometry, material);
    granuleMesh.castShadow = true;
    granuleMesh.receiveShadow = true;
    granuleGroup.add(granuleMesh);

    // Floating ambient micro-particles (fertilizer dust / aerosol)
    const particleCount = 75;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 6;
      particlePositions[i + 1] = (Math.random() - 0.5) * 6;
      particlePositions[i + 2] = (Math.random() - 0.5) * 6;
    }
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      color: 0x22c55e,
      size: 0.035,
      transparent: true,
      opacity: 0.6,
    });
    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleSystem);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.4);
    keyLight.position.set(4, 5, 5);
    scene.add(keyLight);

    const rimLight = new THREE.PointLight(0x22c55e, 2.5, 10);
    rimLight.position.set(-3, -2, -2);
    scene.add(rimLight);

    // Mouse Interaction for 3D Orbiting
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const onMouseDown = (e) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      granuleGroup.rotation.y += deltaX * 0.008;
      granuleGroup.rotation.x += deltaY * 0.008;

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Touch support for mobile / tablets
    const onTouchStart = (e) => {
      if (e.touches.length === 1) {
        isDragging = true;
        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };
    const onTouchMove = (e) => {
      if (!isDragging || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - previousMousePosition.x;
      const deltaY = e.touches[0].clientY - previousMousePosition.y;
      granuleGroup.rotation.y += deltaX * 0.008;
      granuleGroup.rotation.x += deltaY * 0.008;
      previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };
    const onTouchEnd = () => {
      isDragging = false;
    };
    domElement.addEventListener('touchstart', onTouchStart);
    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', onTouchEnd);

    // Handle Window Resize
    const handleResize = () => {
      if (!currentMount) return;
      const w = currentMount.clientWidth;
      const h = currentMount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!isDragging) {
        granuleGroup.rotation.y += 0.005;
        granuleGroup.rotation.x += 0.002;
      }
      particleSystem.rotation.y += 0.001;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      domElement.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      if (currentMount && renderer.domElement) {
        currentMount.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
      renderer.dispose();
    };
  }, [granuleType, sphericity]);

  return (
    <div className="relative w-full h-80 rounded-2xl overflow-hidden glass-panel border border-emerald-500/20 shadow-xl group">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
      
      {/* 3D Telemetry Overlay */}
      <div className="absolute top-3 left-3 pointer-events-none bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-mono text-slate-300">
        <span className="text-emerald-400 font-bold">3D WebGL:</span> {granuleType.toUpperCase()} Granulometry
      </div>

      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
        <div className="bg-slate-950/85 backdrop-blur-md px-3 py-1 rounded-lg border border-slate-700/80 text-xs">
          <span className="text-slate-400">Sphericity (ගෝලාකාර බව):</span>{' '}
          <span className="font-bold text-emerald-400">{(sphericity * 100).toFixed(1)}%</span>
        </div>
        <div className="bg-slate-950/85 backdrop-blur-md px-3 py-1 rounded-lg border border-slate-700/80 text-xs text-slate-400">
          🔄 360° Drag to Rotate
        </div>
      </div>
    </div>
  );
}
