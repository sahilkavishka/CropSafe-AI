import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const SRI_LANKA_KEY_DISTRICTS = [
  { name: "Anuradhapura", name_si: "අනුරාධපුරය", x: -0.4, y: 1.0, z: 0.1, risk: "moderate", allocation_mt: 38500 },
  { name: "Polonnaruwa", name_si: "පොලොන්නරුව", x: 0.3, y: 0.6, z: 0.1, risk: "low", allocation_mt: 32000 },
  { name: "Ampara", name_si: "අම්පාර", x: 0.8, y: -0.2, z: 0.1, risk: "high", allocation_mt: 29500 },
  { name: "Kurunegala", name_si: "කුරුණෑගල", x: -0.5, y: 0.2, z: 0.2, risk: "moderate", allocation_mt: 41000 },
  { name: "Jaffna", name_si: "යාපනය", x: -0.6, y: 2.2, z: 0.05, risk: "high", allocation_mt: 18500 },
  { name: "Nuwara Eliya", name_si: "නුවරඑළිය", x: 0.0, y: -0.5, z: 0.55, risk: "low", allocation_mt: 24000 },
  { name: "Badulla", name_si: "බදුල්ල", x: 0.4, y: -0.6, z: 0.45, risk: "low", allocation_mt: 21000 },
  { name: "Hambantota", name_si: "හම්බන්තොට", x: 0.3, y: -1.4, z: 0.1, risk: "low", allocation_mt: 23500 },
  { name: "Colombo Port", name_si: "කොළඹ වරාය", x: -0.9, y: -0.5, z: 0.05, risk: "hub", allocation_mt: 120000 },
  { name: "Ratnapura", name_si: "රත්නපුර", x: -0.4, y: -0.8, z: 0.3, risk: "low", allocation_mt: 19500 }
];

export default function ThreeSriLankaMap({ onSelectDistrict }) {
  const mountRef = useRef(null);
  const [activeDistrict, setActiveDistrict] = useState(SRI_LANKA_KEY_DISTRICTS[0]);

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    const width = currentMount.clientWidth;
    const height = currentMount.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, -1.8, 4.0);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    currentMount.appendChild(renderer.domElement);

    const mapGroup = new THREE.Group();
    scene.add(mapGroup);

    // Island Topography Mesh (Teardrop contour shape)
    const islandShape = new THREE.Shape();
    // Approximate coastal perimeter of Sri Lanka in normalized coordinates
    islandShape.moveTo(-0.6, 2.3);    // Jaffna northern tip
    islandShape.bezierCurveTo(-0.8, 1.8, -1.1, 0.8, -1.0, -0.3); // West coast down to Colombo
    islandShape.bezierCurveTo(-0.9, -1.0, -0.4, -1.7, 0.1, -1.8);  // South coast down to Dondra head
    islandShape.bezierCurveTo(0.6, -1.7, 1.0, -0.8, 0.9, 0.2);   // East coast (Arugam Bay to Batticaloa)
    islandShape.bezierCurveTo(0.8, 1.0, 0.2, 1.8, -0.2, 2.3);     // Trincomalee up to Point Pedro
    islandShape.closePath();

    const extrudeSettings = {
      depth: 0.18,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 2,
      bevelSize: 0.05,
      bevelThickness: 0.05,
    };

    const islandGeometry = new THREE.ExtrudeGeometry(islandShape, extrudeSettings);
    const islandMaterial = new THREE.MeshStandardMaterial({
      color: 0x0f291e, // Deep emerald dark terrain
      roughness: 0.6,
      metalness: 0.3,
      wireframe: false,
    });
    const islandMesh = new THREE.Mesh(islandGeometry, islandMaterial);
    islandMesh.position.set(0, 0, -0.1);
    mapGroup.add(islandMesh);

    // Glowing Central Highlands Mountain Dome
    const highlandsGeom = new THREE.ConeGeometry(0.85, 0.55, 32);
    const highlandsMat = new THREE.MeshStandardMaterial({
      color: 0x166534,
      roughness: 0.5,
      metalness: 0.2,
      flatShading: true
    });
    const highlandsMesh = new THREE.Mesh(highlandsGeom, highlandsMat);
    highlandsMesh.rotation.x = Math.PI / 2;
    highlandsMesh.position.set(0.05, -0.5, 0.18);
    mapGroup.add(highlandsMesh);

    // Transit supply lines from Colombo Port to Northern/Eastern Agrarian Centers
    const colombo = new THREE.Vector3(-0.9, -0.5, 0.15);
    const targets = [
      new THREE.Vector3(-0.4, 1.0, 0.15),  // Anuradhapura
      new THREE.Vector3(0.3, 0.6, 0.15),   // Polonnaruwa
      new THREE.Vector3(0.8, -0.2, 0.15),  // Ampara
      new THREE.Vector3(-0.6, 2.2, 0.15)   // Jaffna
    ];

    targets.forEach(tgt => {
      const curve = new THREE.QuadraticBezierCurve3(
        colombo,
        new THREE.Vector3((colombo.x + tgt.x) / 2, (colombo.y + tgt.y) / 2, 0.75), // Arched transit line
        tgt
      );
      const points = curve.getPoints(24);
      const lineGeom = new THREE.BufferGeometry().setFromPoints(points);
      const lineMat = new THREE.LineDashedMaterial({
        color: 0x22c55e,
        dashSize: 0.1,
        gapSize: 0.05,
        linewidth: 2
      });
      const line = new THREE.Line(lineGeom, lineMat);
      line.computeLineDistances();
      mapGroup.add(line);
    });

    // District Beacon Pins
    const pinObjects = [];
    SRI_LANKA_KEY_DISTRICTS.forEach(d => {
      let pinColor = 0x22c55e;
      if (d.risk === 'high') pinColor = 0xef4444;
      else if (d.risk === 'moderate') pinColor = 0xf59e0b;
      else if (d.risk === 'hub') pinColor = 0x38bdf8;

      const pinGeom = new THREE.SphereGeometry(0.07, 16, 16);
      const pinMat = new THREE.MeshBasicMaterial({ color: pinColor });
      const pinMesh = new THREE.Mesh(pinGeom, pinMat);
      pinMesh.position.set(d.x, d.y, d.z + 0.2);

      // Pin stem
      const stemGeom = new THREE.CylinderGeometry(0.015, 0.015, 0.2, 8);
      const stemMat = new THREE.MeshBasicMaterial({ color: 0x94a3b8 });
      const stemMesh = new THREE.Mesh(stemGeom, stemMat);
      stemMesh.rotation.x = Math.PI / 2;
      stemMesh.position.set(d.x, d.y, d.z + 0.1);

      mapGroup.add(pinMesh);
      mapGroup.add(stemMesh);
      pinObjects.push({ mesh: pinMesh, district: d });
    });

    // Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0x86efac, 1.5);
    dirLight.position.set(3, 3, 6);
    scene.add(dirLight);

    const blueRim = new THREE.PointLight(0x38bdf8, 2, 8);
    blueRim.position.set(-3, -2, 2);
    scene.add(blueRim);

    // Mouse Controls
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
      mapGroup.rotation.z += dx * 0.005;
      mapGroup.rotation.x += dy * 0.005;
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
      const dy = e.touches[0].clientY - prevMouse.y;
      mapGroup.rotation.z += dx * 0.005;
      mapGroup.rotation.x += dy * 0.005;
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

      // Gentle floating oscillation
      if (!isDragging) {
        mapGroup.position.z = Math.sin(elapsed * 1.2) * 0.08;
        mapGroup.rotation.z = Math.sin(elapsed * 0.4) * 0.05;
      }

      // Pulsing Pins
      pinObjects.forEach((po, idx) => {
        const s = 1.0 + Math.sin(elapsed * 3.5 + idx) * 0.25;
        po.mesh.scale.set(s, s, s);
      });

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
      islandGeometry.dispose();
      islandMaterial.dispose();
      highlandsGeom.dispose();
      highlandsMat.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-80 rounded-2xl overflow-hidden glass-panel border border-emerald-500/20 shadow-xl group">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating Header */}
      <div className="absolute top-3 left-3 bg-slate-950/85 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-700/80 text-xs">
        <div className="text-emerald-400 font-bold flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          3D Sri Lanka Geospatial Relief
        </div>
        <div className="text-slate-300 text-xs mt-0.5 font-medium">
          දිස්ත්‍රික්ක 25 හි පොහොර අවදානම් සහ බෙදාහැරීම් සිතියම
        </div>
      </div>

      {/* Quick Select District Bar */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {SRI_LANKA_KEY_DISTRICTS.map((d, i) => (
          <button
            key={i}
            onClick={() => {
              setActiveDistrict(d);
              if (onSelectDistrict) onSelectDistrict(d);
            }}
            className={`whitespace-nowrap px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
              activeDistrict?.name === d.name
                ? 'bg-emerald-600 text-white border-emerald-400 shadow-md'
                : 'bg-slate-900/85 text-slate-300 border-slate-700 hover:border-slate-500'
            }`}
          >
            {d.name_si}
          </button>
        ))}
      </div>
    </div>
  );
}
