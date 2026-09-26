import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeBagCanvas({ isAuthentic = true, brand = 'ceylon_fertilizer_lakpohora' }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    const width = currentMount.clientWidth || 320;
    const height = currentMount.clientHeight || 280;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0.2, 4.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    currentMount.appendChild(renderer.domElement);

    const bagGroup = new THREE.Group();
    scene.add(bagGroup);

    // 1. 50kg Fertilizer Sack Geometry (Slightly bulging sack)
    const bagGeo = new THREE.BoxGeometry(1.4, 2.1, 0.7, 16, 16, 16);
    const pos = bagGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);

      // Bulge belly outwards from granular fertilizer weight
      const bulge = Math.cos((y / 2.1) * Math.PI) * 0.18;
      pos.setZ(i, z + (z > 0 ? bulge : -bulge));
      pos.setX(i, x + (x > 0 ? bulge * 0.5 : -bulge * 0.5));
    }
    bagGeo.computeVertexNormals();

    // Woven polypropylene sack material
    const bagMat = new THREE.MeshStandardMaterial({
      color: isAuthentic ? 0xf8fafc : 0xf1f5f9, // Clean woven white
      roughness: 0.8,
      metalness: 0.05
    });
    const bagMesh = new THREE.Mesh(bagGeo, bagMat);
    bagMesh.castShadow = true;
    bagGroup.add(bagMesh);

    // 2. Printed Brand Banner & Emblem
    const bannerGeo = new THREE.PlaneGeometry(1.1, 0.65);
    const bannerCanvas = document.createElement('canvas');
    bannerCanvas.width = 512;
    bannerCanvas.height = 256;
    const ctx = bannerCanvas.getContext('2d');
    
    // Draw printed sack graphics
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 512, 256);
    ctx.fillStyle = isAuthentic ? '#166534' : '#991b1b';
    ctx.fillRect(20, 20, 472, 50);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ලක්පොහොර • 50 KG', 256, 56);
    
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText('ශ්‍රී ලංකා රජයේ පොහොර සමාගම', 256, 115);
    ctx.font = 'normal 18px monospace';
    ctx.fillText('SLSI 644 : 2024 CERTIFIED', 256, 155);
    ctx.fillStyle = '#059669';
    ctx.fillRect(80, 185, 352, 35);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('BATCH: LP-2026-M892', 256, 210);

    const bannerTexture = new THREE.CanvasTexture(bannerCanvas);
    const bannerMat = new THREE.MeshBasicMaterial({ map: bannerTexture });
    const bannerMesh = new THREE.Mesh(bannerGeo, bannerMat);
    bannerMesh.position.set(0, 0.35, 0.38 + 0.16);
    bagGroup.add(bannerMesh);

    // 3. Shimmering Hologram Sticker
    const holoGeo = new THREE.PlaneGeometry(0.38, 0.38);
    const holoMat = new THREE.MeshPhysicalMaterial({
      color: isAuthentic ? 0x00e676 : 0x78909c,
      metalness: 0.95,
      roughness: isAuthentic ? 0.08 : 0.7,
      clearcoat: isAuthentic ? 1.0 : 0.2,
      clearcoatRoughness: 0.1,
      reflectivity: 0.9
    });
    const holoMesh = new THREE.Mesh(holoGeo, holoMat);
    holoMesh.position.set(0, -0.32, 0.38 + 0.17);
    bagGroup.add(holoMesh);

    // 4. Double Chainstitch Top Seam
    const seamGeo = new THREE.BoxGeometry(1.48, 0.08, 0.22);
    const seamMat = new THREE.MeshStandardMaterial({
      color: isAuthentic ? 0x0284c7 : 0xd97706, // Blue or Orange safety twine
      roughness: 0.9
    });
    const seamMesh = new THREE.Mesh(seamGeo, seamMat);
    seamMesh.position.set(0, 1.05, 0);
    bagGroup.add(seamMesh);

    // Bottom stitch seam
    const bottomSeam = new THREE.Mesh(seamGeo, seamMat);
    bottomSeam.position.set(0, -1.05, 0);
    bagGroup.add(bottomSeam);

    // Ground Shadow Plate
    const floorGeo = new THREE.CylinderGeometry(1.6, 1.6, 0.02, 32);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.8
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.position.y = -1.08;
    floorMesh.receiveShadow = true;
    bagGroup.add(floorMesh);

    // Lighting
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.4);
    keyLight.position.set(3, 4, 4);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const rainbowLight = new THREE.PointLight(isAuthentic ? 0x00e5ff : 0xff5252, 2.0, 6);
    rainbowLight.position.set(0, -0.3, 1.8);
    scene.add(rainbowLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.1);
    scene.add(ambientLight);

    // Mouse / Touch Drag Rotation
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const onMouseDown = (e) => {
      isDragging = true;
      prevMouseX = e.clientX || (e.touches && e.touches[0].clientX);
      prevMouseY = e.clientY || (e.touches && e.touches[0].clientY);
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;
      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      const clientY = e.clientY || (e.touches && e.touches[0].clientY);
      const deltaX = clientX - prevMouseX;
      const deltaY = clientY - prevMouseY;

      bagGroup.rotation.y += deltaX * 0.015;
      bagGroup.rotation.x = Math.max(-0.25, Math.min(0.25, bagGroup.rotation.x + deltaY * 0.005));

      prevMouseX = clientX;
      prevMouseY = clientY;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    currentMount.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    currentMount.addEventListener('touchstart', onMouseDown, { passive: true });
    window.addEventListener('touchmove', onMouseMove, { passive: true });
    window.addEventListener('touchend', onMouseUp);

    // Animation Loop
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Shimmer hologram color cycle if authentic
      if (isAuthentic) {
        rainbowLight.color.setHSL((t * 0.25) % 1.0, 0.9, 0.6);
      }

      if (!isDragging) {
        bagGroup.rotation.y += 0.006; // Slow automatic idle turn
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      currentMount.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      currentMount.removeEventListener('touchstart', onMouseDown);
      window.removeEventListener('touchmove', onMouseMove);
      window.removeEventListener('touchend', onMouseUp);
      if (renderer.domElement && currentMount.contains(renderer.domElement)) {
        currentMount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [isAuthentic, brand]);

  return (
    <div className="relative w-full h-64 sm:h-72 rounded-2xl overflow-hidden bg-gradient-to-b from-slate-100 via-emerald-50/30 to-slate-200/50 border border-slate-300 shadow-inner flex items-center justify-center select-none cursor-grab active:cursor-grabbing">
      <div ref={mountRef} className="w-full h-full" />
      <div className={`absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full text-[10px] font-black border shadow-sm flex items-center space-x-1.5 pointer-events-none ${
        isAuthentic 
          ? 'bg-emerald-600 text-white border-emerald-400' 
          : 'bg-red-600 text-white border-red-400'
      }`}>
        <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
        <span>{isAuthentic ? '✓ 3D නියම රජයේ උරය' : '⚠️ 3D ව්‍යාජ හොර උරය'}</span>
      </div>
      <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-slate-900/70 text-white text-[10px] font-medium pointer-events-none">
        👆 ඇඟිල්ලෙන් කරකවන්න (Touch & Rotate 360°)
      </div>
    </div>
  );
}
