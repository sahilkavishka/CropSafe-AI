import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * ThreeDroneFieldCanvas
 * Interactive 3D Autonomous Agricultural Drone & Multispectral NDVI Field Scanner.
 * Shows variable-rate nitrogen zones, paddy bunds, and an autonomous drone scanning overhead.
 * 
 * Props:
 * - isScanning: boolean
 * - healthyPct: number
 * - stressPct: number
 */
export default function ThreeDroneFieldCanvas({ 
  isScanning = false, 
  healthyPct = 65, 
  stressPct = 35 
}) {
  const mountRef = useRef(null);

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    const width = currentMount.clientWidth || 320;
    const height = currentMount.clientHeight || 260;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x06140e);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(4.0, 4.5, 5.0);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    currentMount.appendChild(renderer.domElement);

    // 2. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfef08a, 1.4);
    sunLight.position.set(6, 9, 5);
    scene.add(sunLight);

    const fieldGroup = new THREE.Group();
    scene.add(fieldGroup);

    // 3. 3D Paddy Field Grid with Variable-Rate Stress Zones
    // Create an 8x8 segmented terrain representing liyadi (ලියදි)
    const gridSize = 6;
    const cellSize = 0.55;
    const halfGrid = (gridSize * cellSize) / 2;

    const tilesGroup = new THREE.Group();
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        // Pseudo-random zones (deficient near top-left, healthy elsewhere)
        const isDeficient = (r < 2 && c < 3) || (r === 2 && c === 1);
        const isModerate = (r >= 2 && r <= 3 && c < 4);
        
        let tileColor = 0x16a34a; // Emerald Healthy
        let heightVal = 0.15;
        if (isDeficient) {
          tileColor = 0xef4444; // Deficient Nitrogen zone (needs extra urea)
          heightVal = 0.08;
        } else if (isModerate) {
          tileColor = 0xeab308; // Moderate stress
          heightVal = 0.11;
        }

        const tileGeo = new THREE.BoxGeometry(cellSize * 0.9, heightVal, cellSize * 0.9);
        const tileMat = new THREE.MeshStandardMaterial({
          color: tileColor,
          roughness: 0.7,
          metalness: 0.1
        });
        const tile = new THREE.Mesh(tileGeo, tileMat);
        tile.position.set(
          c * cellSize - halfGrid + cellSize / 2,
          heightVal / 2,
          r * cellSize - halfGrid + cellSize / 2
        );
        tilesGroup.add(tile);
      }
    }
    fieldGroup.add(tilesGroup);

    // Water canals & bunds (නියර) base
    const bundBaseGeo = new THREE.BoxGeometry(gridSize * cellSize + 0.4, 0.06, gridSize * cellSize + 0.4);
    const bundMat = new THREE.MeshStandardMaterial({
      color: 0x3d2719, // Wet fertile mud bund
      roughness: 0.9
    });
    const bundBase = new THREE.Mesh(bundBaseGeo, bundMat);
    bundBase.position.y = -0.01;
    fieldGroup.add(bundBase);

    // 4. Autonomous Agri-Drone Model
    const droneGroup = new THREE.Group();
    droneGroup.position.set(0, 1.8, 0);
    scene.add(droneGroup);

    // Drone central body
    const bodyGeo = new THREE.CylinderGeometry(0.18, 0.22, 0.08, 8);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.3,
      metalness: 0.8
    });
    const droneBody = new THREE.Mesh(bodyGeo, bodyMat);
    droneGroup.add(droneBody);

    // Drone 4 arms & rotors
    const propMeshes = [];
    const armGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.5, 6);
    const armMat = new THREE.MeshStandardMaterial({ color: 0x334155 });
    const propGeo = new THREE.BoxGeometry(0.35, 0.005, 0.03);
    const propMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });

    const armAngles = [Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4, (7 * Math.PI) / 4];
    armAngles.forEach(ang => {
      const arm = new THREE.Mesh(armGeo, armMat);
      arm.rotation.z = Math.PI / 2;
      arm.rotation.y = ang;
      arm.position.set(Math.cos(ang) * 0.25, 0, Math.sin(ang) * 0.25);
      droneGroup.add(arm);

      // Motor pod
      const motorGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.06, 8);
      const motorMat = new THREE.MeshStandardMaterial({ color: 0x0284c7 });
      const motor = new THREE.Mesh(motorGeo, motorMat);
      motor.position.set(Math.cos(ang) * 0.5, 0.04, Math.sin(ang) * 0.5);
      droneGroup.add(motor);

      // Propeller
      const prop = new THREE.Mesh(propGeo, propMat);
      prop.position.set(Math.cos(ang) * 0.5, 0.08, Math.sin(ang) * 0.5);
      droneGroup.add(prop);
      propMeshes.push(prop);
    });

    // 5. Multispectral Scanner Beam (Pyramid Cone)
    const beamGeo = new THREE.ConeGeometry(0.85, 1.8, 4, 1, true);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.28,
      side: THREE.DoubleSide
    });
    const beamMesh = new THREE.Mesh(beamGeo, beamMat);
    beamMesh.position.y = -0.9;
    beamMesh.rotation.y = Math.PI / 4;
    droneGroup.add(beamMesh);

    // 6. Interaction: Drag / Touch to Rotate
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

      fieldGroup.rotation.y += deltaX * 0.012;
      fieldGroup.rotation.x += deltaY * 0.008;

      fieldGroup.rotation.x = Math.max(-0.6, Math.min(0.6, fieldGroup.rotation.x));
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

    // Initial angle
    fieldGroup.rotation.y = 0.5;
    fieldGroup.rotation.x = 0.3;

    // 7. Animation Loop
    let animId;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Spin propellers rapidly
      propMeshes.forEach((p, idx) => {
        p.rotation.y += 0.35 * (idx % 2 === 0 ? 1 : -1);
      });

      // Drone flight path (Figure-8 scanning grid)
      droneGroup.position.x = Math.sin(t * 1.2) * 1.1;
      droneGroup.position.z = Math.cos(t * 0.8) * 0.9;
      droneGroup.position.y = 1.7 + Math.sin(t * 2.5) * 0.08;

      // Slight banking tilt
      droneGroup.rotation.z = -Math.cos(t * 1.2) * 0.12;
      droneGroup.rotation.x = Math.sin(t * 0.8) * 0.1;

      // Pulse sensor beam
      beamMat.opacity = 0.2 + Math.sin(t * 4.0) * 0.12;

      // Gentle field spin when not dragging
      if (!isDragging) {
        fieldGroup.rotation.y += 0.003;
      }

      renderer.render(scene, camera);
    };

    animate();

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
  }, []);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center select-none overflow-hidden rounded-2xl bg-gradient-to-b from-slate-950 via-slate-900 to-sky-950">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating 3D Drone Status HUD */}
      <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-sky-500/20 text-white text-[11px] font-bold space-y-0.5 pointer-events-none">
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-ping" />
          <span>ස්වයංක්‍රීය ඩ්‍රෝන පරීක්ෂාව (NDVI Multispectral)</span>
        </div>
        <div className="text-[10px] text-slate-300 font-medium flex items-center space-x-2">
          <span>🟩 නිරෝගී: <strong className="text-emerald-400">{healthyPct}%</strong></span>
          <span>🟥 නයිට්‍රජන් ඌන: <strong className="text-rose-400">{stressPct}%</strong></span>
        </div>
      </div>

      {/* Touch/Drag hint */}
      <div className="absolute bottom-2.5 right-3 bg-black/50 px-2.5 py-1 rounded-lg text-[10px] text-slate-300 font-semibold pointer-events-none border border-white/5">
        🔄 කුඹුර 3D කරකවා බලන්න (360° Rotate)
      </div>
    </div>
  );
}
