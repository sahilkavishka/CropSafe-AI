import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreePlantCanvas({ symptom = 'yellow_lower' }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    const width = currentMount.clientWidth || 320;
    const height = currentMount.clientHeight || 280;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 1.8, 4.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    currentMount.appendChild(renderer.domElement);

    // Plant Root Group
    const plantGroup = new THREE.Group();
    scene.add(plantGroup);

    // Muddy Paddy Field Base
    const soilGeo = new THREE.CylinderGeometry(1.2, 1.0, 0.35, 32);
    const soilMat = new THREE.MeshStandardMaterial({
      color: 0x3e2723, // Deep moist clay soil
      roughness: 0.9,
      metalness: 0.05
    });
    const soilMesh = new THREE.Mesh(soilGeo, soilMat);
    soilMesh.position.y = -0.17;
    soilMesh.receiveShadow = true;
    plantGroup.add(soilMesh);

    // Water Film on Mud
    const waterGeo = new THREE.CylinderGeometry(1.22, 1.22, 0.05, 32);
    const waterMat = new THREE.MeshPhysicalMaterial({
      color: 0x4fc3f7,
      transmission: 0.8,
      opacity: 0.7,
      transparent: true,
      roughness: 0.1,
      ior: 1.33
    });
    const waterMesh = new THREE.Mesh(waterGeo, waterMat);
    waterMesh.position.y = 0.02;
    plantGroup.add(waterMesh);

    // Central Paddy Stem / Culm
    const stemCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0.05, 0.8, 0),
      new THREE.Vector3(-0.03, 1.6, 0.02),
      new THREE.Vector3(0, 2.3, 0)
    ]);
    const stemGeo = new THREE.TubeGeometry(stemCurve, 24, 0.045, 12, false);
    const stemMat = new THREE.MeshStandardMaterial({
      color: 0x2e7d32,
      roughness: 0.5
    });
    const stemMesh = new THREE.Mesh(stemGeo, stemMat);
    stemMesh.castShadow = true;
    plantGroup.add(stemMesh);

    // Determine colors based on diagnosed deficiency
    let lowerColor = 0x2e7d32; // Normal healthy green
    let middleColor = 0x388e3c;
    let upperColor = 0x4caf50;
    let edgeColor = null;

    if (symptom === 'yellow_lower') {
      // Nitrogen Deficiency: Lower leaves strongly chlorotic yellow
      lowerColor = 0xfbc02d; // Bright warning yellow
      middleColor = 0x8bc34a; // Fading pale green
      upperColor = 0x2e7d32;  // Top stays dark green
    } else if (symptom === 'scorch_edges') {
      // Potassium Deficiency: Marginal leaf scorch / burnt brown edges
      lowerColor = 0x8d6e63; // Burnt terracotta
      middleColor = 0x689f38;
      edgeColor = 0xd84315;
    } else if (symptom === 'purple_leaves') {
      // Phosphorus Deficiency: Purple / reddish-bronze anthocyanin
      lowerColor = 0x4a148c; // Deep purple
      middleColor = 0x6a1b9a;
      upperColor = 0x8e24aa;
    } else if (symptom === 'veins_green') {
      // Magnesium Deficiency: Interveinal chlorosis (pale lime with dark green veins)
      lowerColor = 0xcddc39; // Lime chlorosis
      middleColor = 0xdce775;
    }

    // Helper: Create an arched blade leaf
    const createLeaf = (startPos, length, curveDir, color, tiltAngle, rotationY) => {
      const leafGroup = new THREE.Group();
      leafGroup.position.copy(startPos);
      leafGroup.rotation.y = rotationY;
      leafGroup.rotation.z = tiltAngle;

      const leafCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(curveDir.x * 0.4, length * 0.4, curveDir.z * 0.4),
        new THREE.Vector3(curveDir.x * 0.9, length * 0.75, curveDir.z * 0.9),
        new THREE.Vector3(curveDir.x * 1.3, length * 0.6, curveDir.z * 1.3),
        new THREE.Vector3(curveDir.x * 1.6, length * 0.35, curveDir.z * 1.6)
      ]);

      const leafGeo = new THREE.TubeGeometry(leafCurve, 20, 0.05, 8, false);
      const leafMat = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.45,
        metalness: 0.1,
        side: THREE.DoubleSide
      });
      const leafMesh = new THREE.Mesh(leafGeo, leafMat);
      leafMesh.castShadow = true;
      leafGroup.add(leafMesh);

      return leafGroup;
    };

    // Lower leaves (Oldest)
    const lowerLeaves = [
      createLeaf(new THREE.Vector3(0, 0.4, 0), 1.1, new THREE.Vector3(1, 0.1, 0.2), lowerColor, -0.4, 0.2),
      createLeaf(new THREE.Vector3(0, 0.5, 0), 1.05, new THREE.Vector3(-1, 0.1, -0.3), lowerColor, 0.4, 2.9),
      createLeaf(new THREE.Vector3(0, 0.6, 0), 0.95, new THREE.Vector3(0.3, 0.1, -1), lowerColor, -0.3, 4.4)
    ];
    lowerLeaves.forEach(l => plantGroup.add(l));

    // Middle leaves
    const midLeaves = [
      createLeaf(new THREE.Vector3(0, 0.95, 0), 1.3, new THREE.Vector3(0.9, 0.3, -0.4), middleColor, -0.25, 1.2),
      createLeaf(new THREE.Vector3(0, 1.15, 0), 1.25, new THREE.Vector3(-0.8, 0.3, 0.5), middleColor, 0.25, 3.8)
    ];
    midLeaves.forEach(l => plantGroup.add(l));

    // Upper canopy & Flag leaf
    const upperLeaves = [
      createLeaf(new THREE.Vector3(0, 1.6, 0), 1.4, new THREE.Vector3(0.6, 0.6, 0.3), upperColor, -0.15, 0.8),
      createLeaf(new THREE.Vector3(0, 1.8, 0), 1.35, new THREE.Vector3(-0.5, 0.6, -0.4), upperColor, 0.15, 3.2),
      createLeaf(new THREE.Vector3(0, 2.1, 0), 1.2, new THREE.Vector3(0.1, 0.8, 0.2), upperColor, -0.05, 1.9)
    ];
    upperLeaves.forEach(l => plantGroup.add(l));

    // Lighting: Sun & Skylight
    const sunLight = new THREE.DirectionalLight(0xfff8e1, 1.6);
    sunLight.position.set(4, 6, 4);
    sunLight.castShadow = true;
    scene.add(sunLight);

    const ambientLight = new THREE.AmbientLight(0xe8f5e9, 1.2);
    scene.add(ambientLight);

    const groundLight = new THREE.DirectionalLight(0xa5d6a7, 0.5);
    groundLight.position.set(-3, -2, -3);
    scene.add(groundLight);

    // Interactive Drag Rotation
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

      plantGroup.rotation.y += deltaX * 0.015;
      camera.position.y = Math.max(0.8, Math.min(3.0, camera.position.y - deltaY * 0.01));
      camera.lookAt(0, 1.2, 0);

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

    // Animation Loop (Gentle Breeze Sway)
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Gentle natural paddy wind sway
      plantGroup.rotation.z = Math.sin(t * 1.5) * 0.035;
      plantGroup.rotation.x = Math.cos(t * 1.2) * 0.02;

      if (!isDragging) {
        plantGroup.rotation.y += 0.005; // Idle slow spin
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
  }, [symptom]);

  return (
    <div className="relative w-full h-64 sm:h-72 rounded-2xl overflow-hidden bg-gradient-to-b from-sky-50 via-emerald-50/40 to-emerald-100/60 border border-emerald-200 shadow-inner flex items-center justify-center select-none cursor-grab active:cursor-grabbing">
      <div ref={mountRef} className="w-full h-full" />
      <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur text-[10px] font-black text-emerald-900 border border-emerald-300 shadow-sm flex items-center space-x-1.5 pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span>3D සජීවී බෝග ආකෘතිය</span>
      </div>
      <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-slate-900/70 text-white text-[10px] font-medium pointer-events-none">
        👆 ඇඟිල්ලෙන් කරකවන්න (Touch & Rotate 360°)
      </div>
    </div>
  );
}
