import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Sparkles, Activity, ShieldCheck } from 'lucide-react';

interface InteractiveGlobeProps {
  progressPercent: number; // 0 to 100+
  size?: 'sm' | 'md' | 'lg';
}

export const InteractiveGlobe: React.FC<InteractiveGlobeProps> = ({ 
  progressPercent, 
  size = 'md' 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hovered, setHovered] = useState(false);
  
  // Track rotational velocities and mouse drags
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const rotationVelocityRef = useRef({ x: 0.003, y: 0.004 });
  const lastMousePosRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!canvasRef.current || !mountRef.current) return;

    const container = mountRef.current;
    const canvas = canvasRef.current;

    // Standard Three.js setups
    const scene = new THREE.Scene();
    
    // Camera Setup - dynamic field of view
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.z = 6;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Create a group that will hold all globe visual elements
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    // Dynamic color matching based on user footprint percentage
    const isWarming = progressPercent > 60;
    const coreColorHex = isWarming ? 0xef4444 : 0x10b981; // Red vs Emerald Green
    const atmosphereColorHex = isWarming ? 0xf59e0b : 0x34d399; // Amber vs Mint Green

    // 1. Core Wireframe Sphere for physical boundaries
    const coreRadius = 1.9;
    const coreGeometry = new THREE.SphereGeometry(coreRadius, 24, 24);
    const coreMaterial = new THREE.MeshBasicMaterial({
      color: coreColorHex,
      wireframe: true,
      transparent: true,
      opacity: 0.08,
    });
    const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
    globeGroup.add(coreMesh);

    // 2. Beautiful procedural Fibonacci Dot Matrix Globe
    const particleCount = 750;
    const dotGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    const goldenRatio = (1 + Math.sqrt(5)) / 2;
    const colorTool = new THREE.Color();

    for (let i = 0; i < particleCount; i++) {
      // Fibonacci distribution of points over a sphere
      const y = 1 - (i / (particleCount - 1)) * 2; // -1 to 1
      const radiusAtY = Math.sqrt(1 - y * y);
      const theta = (2 * Math.PI * i) / goldenRatio;

      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;

      // Add slight randomized altitude fluctuation for holographic visual depth
      const altFactor = 1.0 + (Math.sin(i * 0.15) * 0.03); 
      const finalRadius = coreRadius * altFactor;

      positions[i * 3] = x * finalRadius;
      positions[i * 3 + 1] = y * finalRadius;
      positions[i * 3 + 2] = z * finalRadius;

      // Color mapping: interpolate color index per dot based on user emissions
      const progressRatio = Math.min(100, Math.max(0, progressPercent)) / 100;
      
      // Seed some random deviations so planet has rich multi-tone textures
      const randDev = Math.random() * 0.2;
      if (Math.random() < progressRatio) {
        // Red, Amber, or Orange (Ecological strain)
        const hue = 0.0 + randDev * 0.12; // ranges from bright crimson to amber orange
        colorTool.setHSL(hue, 0.9, 0.5 + Math.random() * 0.1);
      } else {
        // Forest green, Emerald, Teal, or Sapphire (Sustainability offset)
        const hue = 0.35 + randDev * 0.16; // ranges from rich green to sapphire teal
        colorTool.setHSL(hue, 0.85, 0.45 + Math.random() * 0.15);
      }

      colors[i * 3] = colorTool.r;
      colors[i * 3 + 1] = colorTool.g;
      colors[i * 3 + 2] = colorTool.b;

      // Varied size of hologram dots
      sizes[i] = Math.random() * 2.0 + 1.0;
    }

    dotGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    dotGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Particle shader material
    const dotMaterial = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });

    const pointCloud = new THREE.Points(dotGeometry, dotMaterial);
    globeGroup.add(pointCloud);

    // 3. Ambient Star / Carbon particulate field swimming around
    const environmentCount = 180;
    const envGeometry = new THREE.BufferGeometry();
    const envPositions = new Float32Array(environmentCount * 3);
    const envColors = new Float32Array(environmentCount * 3);

    for (let i = 0; i < environmentCount; i++) {
      // Space particles scattered around the globe
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const dist = 2.5 + Math.random() * 3.5; // distance from core

      envPositions[i * 3] = dist * Math.sin(phi) * Math.cos(theta);
      envPositions[i * 3 + 1] = dist * Math.sin(phi) * Math.sin(theta);
      envPositions[i * 3 + 2] = dist * Math.cos(phi);

      // Environmental particles: red/ash if warming, white/green if sustainable
      if (isWarming) {
        colorTool.setHex(0xfca5a5); // light pink-red
      } else {
        colorTool.setHex(0xa7f3d0); // minty green-white
      }
      envColors[i * 3] = colorTool.r;
      envColors[i * 3 + 1] = colorTool.g;
      envColors[i * 3 + 2] = colorTool.b;
    }

    envGeometry.setAttribute('position', new THREE.BufferAttribute(envPositions, 3));
    envGeometry.setAttribute('color', new THREE.BufferAttribute(envColors, 3));

    const envMaterial = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.5,
    });

    const envPointCloud = new THREE.Points(envGeometry, envMaterial);
    scene.add(envPointCloud);

    // 4. Glowing Orbit Ring representing Offset Circulation
    const ringSegments = 64;
    const ringGeometry = new THREE.BufferGeometry();
    const ringPositions = new Float32Array((ringSegments + 1) * 3);

    const ringRadius = 2.4;
    for (let i = 0; i <= ringSegments; i++) {
      const theta = (i / ringSegments) * Math.PI * 2;
      ringPositions[i * 3] = Math.cos(theta) * ringRadius;
      ringPositions[i * 3 + 1] = 0; // flat horizontal planar ring
      ringPositions[i * 3 + 2] = Math.sin(theta) * ringRadius;
    }

    ringGeometry.setAttribute('position', new THREE.BufferAttribute(ringPositions, 3));
    const ringMaterial = new THREE.LineBasicMaterial({
      color: atmosphereColorHex,
      transparent: true,
      opacity: 0.35,
    });

    const orbitRing = new THREE.Line(ringGeometry, ringMaterial);
    // tilt the orbital ring slightly for visual dynamic appeal
    orbitRing.rotation.x = 0.5;
    orbitRing.rotation.z = 0.25;
    scene.add(orbitRing);

    // Ring Offset Satellites orbiting the planet
    const satCount = 3;
    const satellites: THREE.Mesh[] = [];
    
    for (let i = 0; i < satCount; i++) {
      const satGeo = new THREE.SphereGeometry(0.12, 8, 8);
      const satMat = new THREE.MeshBasicMaterial({
        color: atmosphereColorHex,
        transparent: true,
        opacity: 0.9,
      });
      const satMesh = new THREE.Mesh(satGeo, satMat);
      scene.add(satMesh);
      satellites.push(satMesh);
    }

    // Resize observer to auto-adapt sizes natively based on canvas parents (no absolute window.innerWidth reliance)
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        const w = width || 300;
        const h = height || 300;
        
        renderer.setSize(w, h);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      }
    });
    
    resizeObserver.observe(container);

    // Interaction mouse drag listeners
    const onMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      dragStartRef.current = { x: e.clientX, y: e.clientY };
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      
      const deltaX = e.clientX - lastMousePosRef.current.x;
      const deltaY = e.clientY - lastMousePosRef.current.y;

      globeGroup.rotation.y += deltaX * 0.005;
      globeGroup.rotation.x += deltaY * 0.005;

      // Speed up decay velocity during drag
      rotationVelocityRef.current = {
        x: deltaY * 0.001,
        y: deltaX * 0.001,
      };

      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
    };

    // Touch event compatibility for mobile devices
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDraggingRef.current = true;
        dragStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        lastMousePosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - lastMousePosRef.current.x;
      const deltaY = e.touches[0].clientY - lastMousePosRef.current.y;

      globeGroup.rotation.y += deltaX * 0.005;
      globeGroup.rotation.x += deltaY * 0.005;

      rotationVelocityRef.current = {
        x: deltaY * 0.001,
        y: deltaX * 0.001,
      };

      lastMousePosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    
    canvas.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onMouseUp);

    // Animation frames execution loop
    let animationId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Continuous slow orbital spin
      if (!isDraggingRef.current) {
        globeGroup.rotation.y += rotationVelocityRef.current.y;
        globeGroup.rotation.x += rotationVelocityRef.current.x;

        // Decelerate back to baseline spin speeds
        rotationVelocityRef.current.y += (0.0018 - rotationVelocityRef.current.y) * 0.05;
        rotationVelocityRef.current.x += (0.0007 - rotationVelocityRef.current.x) * 0.05;
      }

      // Rotate background stars/carbon particles slowly
      envPointCloud.rotation.y = elapsedTime * 0.02;
      envPointCloud.rotation.x = elapsedTime * 0.01;

      // Animate orbiting satellites
      satellites.forEach((sat, idx) => {
        const offsetAngle = (idx * Math.PI * 2) / satCount;
        const speedMultiplier = 0.8 + idx * 0.2;
        const currentAngle = elapsedTime * 0.4 * speedMultiplier + offsetAngle;

        // Position on horizontal plane tipped matching orbitRing
        const localX = Math.cos(currentAngle) * ringRadius;
        const localZ = Math.sin(currentAngle) * ringRadius;

        // Apply tilts to position mapping matched with orbitRing
        sat.position.x = localX * Math.cos(0.25) - localZ * Math.sin(0.25);
        sat.position.y = localX * Math.sin(0.5);
        sat.position.z = localZ * Math.cos(0.5);
      });

      // Pulse ring scaling subtly to symbolize ecological ventilation
      const ringScaleFactor = 1.0 + Math.sin(elapsedTime * 2.5) * 0.02;
      orbitRing.scale.set(ringScaleFactor, ringScaleFactor, ringScaleFactor);

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup resources strictly
    return () => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);

      canvas.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onMouseUp);

      // Dispose buffers
      coreGeometry.dispose();
      coreMaterial.dispose();
      dotGeometry.dispose();
      dotMaterial.dispose();
      envGeometry.dispose();
      envMaterial.dispose();
      ringGeometry.dispose();
      ringMaterial.dispose();
      renderer.dispose();
    };
  }, [progressPercent]);

  const heightClass = size === 'sm' ? 'h-40 md:h-48' : size === 'md' ? 'h-64' : 'h-80 sm:h-96 w-full';

  return (
    <div 
      ref={mountRef} 
      className={`relative w-full ${heightClass} flex items-center justify-center rounded-2xl bg-gradient-to-b from-stone-900/30 to-stone-950/60 p-2 border border-stone-800/40 cursor-grab active:cursor-grabbing overflow-hidden group`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      id="3d-interactive-globe-container"
    >
      {/* Background ambient radial glow matching active progress state */}
      <div 
        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out pointer-events-none opacity-20 blur-3xl ${
          progressPercent > 60 ? 'bg-radial-gradient from-rose-500/20 to-transparent' : 'bg-radial-gradient from-emerald-500/20 to-transparent'
        }`}
      />

      <canvas ref={canvasRef} className="w-full h-full block focus:outline-hidden" />

      {/* Floating Indicators */}
      <div className="absolute top-3.5 left-4 pointer-events-none flex items-center space-x-1.5 bg-stone-950/80 backdrop-blur-md border border-stone-850 px-2.5 py-1 rounded-full text-[9px] font-mono font-bold tracking-wide uppercase text-stone-200">
        <Activity className={`h-3 w-3 ${progressPercent > 60 ? 'text-rose-550 animate-pulse' : 'text-emerald-500 animate-pulse'}`} />
        <span>Planet Vital: {progressPercent > 60 ? 'Atmosphere Strain' : 'Eco Balance'}</span>
      </div>

      <div className="absolute bottom-3.5 right-4 pointer-events-none text-[8px] font-mono text-stone-400 select-none bg-stone-950/70 backdrop-blur-md px-2 py-0.5 rounded border border-stone-850 transition-opacity duration-300 opacity-70 group-hover:opacity-100">
        Drag to Orbit Globe
      </div>

      {hovered && (
        <div className="absolute bottom-3.5 left-4 pointer-events-none text-[8px] font-mono text-emerald-400 select-none bg-stone-950/80 backdrop-blur-md px-2.5 py-1 rounded border border-stone-850 flex items-center gap-1 animate-fade-in">
          <Sparkles className="h-3 w-3 text-emerald-400" />
          <span>Hologram Live: {Math.max(100 - progressPercent, 0)}% Carbon Savings</span>
        </div>
      )}
    </div>
  );
};
