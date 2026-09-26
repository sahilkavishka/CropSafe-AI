import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function ThreeWarehouseCanvas({ humidity = 74.5, temperature = 29.8, depotName = "Anuradhapura Central Depot" }) {
  const mountRef = useRef(null);
  const [selectedPallet, setSelectedPallet] = useState(null);

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    const width = currentMount.clientWidth;
    const height = currentMount.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0f1d);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(10, 8, 12);
    camera.lookAt(0, 1, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    currentMount.appendChild(renderer.domElement);

    // Warehouse Floor
    const floorGeometry = new THREE.PlaneGeometry(16, 16);
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.8,
      metalness: 0.2,
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Grid Floor Guide
    const gridHelper = new THREE.GridHelper(16, 16, 0x334155, 0x1e293b);
    gridHelper.position.y = 0.01;
    scene.add(gridHelper);

    // Stacking Pallets (4 rows x 3 columns)
    const warehouseGroup = new THREE.Group();
    scene.add(warehouseGroup);

    // Color based on critical humidity (Urea CRH = 72.5%)
    let palletColor = 0x22c55e; // Green
    if (humidity > 78.0) {
      palletColor = 0xef4444; // Red danger
    } else if (humidity > 72.5) {
      palletColor = 0xf59e0b; // Amber caution
    }

    const boxGeometry = new THREE.BoxGeometry(1.6, 1.2, 1.6);
    const boxMaterial = new THREE.MeshStandardMaterial({
      color: palletColor,
      roughness: 0.6,
      metalness: 0.1,
    });

    const pallets = [];
    for (let x = -3; x <= 3; x += 2.2) {
      for (let z = -3; z <= 3; z += 2.2) {
        const stackHeight = Math.floor(Math.random() * 2) + 1;
        for (let y = 0; y < stackHeight; y++) {
          const pallet = new THREE.Mesh(boxGeometry, boxMaterial);
          pallet.position.set(x, (y * 1.2) + 0.6, z);
          pallet.castShadow = true;
          pallet.receiveShadow = true;
          warehouseGroup.add(pallet);
          pallets.push(pallet);
        }
      }
    }

    // IoT Sensor Node (Pulsing glowing sphere in center)
    const sensorGeom = new THREE.SphereGeometry(0.3, 16, 16);
    const sensorMat = new THREE.MeshBasicMaterial({ color: humidity > 72.5 ? 0xf59e0b : 0x22c55e });
    const sensorNode = new THREE.Mesh(sensorGeom, sensorMat);
    sensorNode.position.set(0, 3.5, 0);
    scene.add(sensorNode);

    // Sensor Beacon Point Light
    const sensorLight = new THREE.PointLight(palletColor, 3, 12);
    sensorLight.position.set(0, 3.5, 0);
    scene.add(sensorLight);

    // Ambient & Directional Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(8, 12, 8);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // Orbit Controls Interaction
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };

    const onMouseDown = (e) => {
      isDragging = true;
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;
      const dx = e.clientX - prevMouse.x;
      const dy = e.clientY - prevMouse.y;
      warehouseGroup.rotation.y += dx * 0.005;
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Touch support for mobile devices
    const onTouchStart = (e) => {
      if (e.touches.length === 1) {
        isDragging = true;
        prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };
    const onTouchMove = (e) => {
      if (!isDragging || e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - prevMouse.x;
      warehouseGroup.rotation.y += dx * 0.005;
      prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };
    const onTouchEnd = () => {
      isDragging = false;
    };
    domElement.addEventListener('touchstart', onTouchStart);
    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', onTouchEnd);

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

    // Animation Loop
    let animId;
    let clock = new THREE.Clock();
    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Pulsing IoT light
      sensorLight.intensity = 2.0 + Math.sin(elapsed * 4.0) * 1.5;

      if (!isDragging) {
        warehouseGroup.rotation.y += 0.002;
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
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
      floorGeometry.dispose();
      floorMaterial.dispose();
      boxGeometry.dispose();
      boxMaterial.dispose();
      sensorGeom.dispose();
      sensorMat.dispose();
      renderer.dispose();
    };
  }, [humidity, temperature]);

  return (
    <div className="relative w-full h-80 rounded-2xl overflow-hidden glass-panel border border-slate-700 shadow-xl group">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Warehouse Telemetry Heads-Up Display */}
      <div className="absolute top-3 left-3 bg-slate-950/85 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-700/80 text-xs font-mono">
        <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">3D IoT Digital Twin</div>
        <div className="text-white font-semibold flex items-center gap-1.5 mt-0.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          {depotName}
        </div>
      </div>

      <div className="absolute top-3 right-3 flex gap-2">
        <div className="bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700 text-xs">
          <span className="text-slate-400 block text-[10px]">Temperature</span>
          <span className="font-bold text-amber-400 font-mono">{temperature.toFixed(1)}°C</span>
        </div>
        <div className="bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700 text-xs">
          <span className="text-slate-400 block text-[10px]">Humidity (RH)</span>
          <span className={`font-bold font-mono ${humidity > 72.5 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {humidity.toFixed(1)}%
          </span>
        </div>
      </div>

      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none text-xs">
        <div className="bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/80 text-[11px]">
          {humidity > 72.5 ? (
            <span className="text-amber-400 font-semibold">⚠️ Caking Alert: Ambient RH exceeds Urea CRH (72.5%)</span>
          ) : (
            <span className="text-emerald-400 font-semibold">✅ Optimum Storage Condition: Dry Free-Flowing</span>
          )}
        </div>
        <div className="bg-slate-950/85 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700/80 text-slate-400 text-[11px]">
          🔄 Drag to Inspect
        </div>
      </div>
    </div>
  );
}
