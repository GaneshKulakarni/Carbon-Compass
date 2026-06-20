import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useApp } from '../context/AppContext';
import { Sparkles, Activity, ShieldCheck, TreePine, Leaf, Flame, Zap } from 'lucide-react';

interface InteractiveGlobeProps {
  progressPercent?: number; // Kept for interface compatibility
  size?: 'sm' | 'md' | 'lg';
  showOnlyGlobe?: boolean;
}

export const InteractiveGlobe: React.FC<InteractiveGlobeProps> = ({ 
  size = 'md',
  showOnlyGlobe = false
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const globeGroupRef = useRef<THREE.Group | null>(null);
  const rotationVelocityRef = useRef({ x: 0.001, y: 0.002 });
  const isDraggingRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });

  const { activityLogs, theme } = useApp();
  const isDarkTheme = theme === 'dark';

  // Calculate carbon-saving metrics
  const totalSavedKgs = activityLogs
    ? activityLogs.filter(l => l.estimatedEmission < 0).reduce((acc, l) => acc + Math.abs(l.estimatedEmission), 0)
    : 0;

  // Conversion: 1 kg carbon saved restores 0.225 square meters
  const restorationArea = Math.max(0.5, Number((totalSavedKgs * 0.225).toFixed(1)));

  // Calculate restoration progress factor (reaches 100% full visual coverage at 200 kg CO2 saved)
  const restorationProgress = Math.min(100, Math.round((totalSavedKgs / 200) * 100));

  // Determine Ecosystem Status Level
  let ecosystemStatus = 'Stable Standby';
  let statusColor = 'text-stone-500 bg-stone-100 dark:bg-stone-900/60 dark:text-stone-400';
  
  if (totalSavedKgs > 0) {
    if (totalSavedKgs < 30) {
      ecosystemStatus = 'Sprouting Seedling';
      statusColor = 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400';
    } else if (totalSavedKgs < 100) {
      ecosystemStatus = 'Growing Ecosystem';
      statusColor = 'text-green-600 bg-green-50 dark:bg-green-950/20 dark:text-green-400';
    } else if (totalSavedKgs < 220) {
      ecosystemStatus = 'Flourishing Habitat';
      statusColor = 'text-teal-600 bg-teal-50 dark:bg-teal-950/20 dark:text-teal-400';
    } else {
      ecosystemStatus = 'Ancient Carbon Sink';
      statusColor = 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/20 dark:text-indigo-400';
    }
  }

  // Animation triggers when action logged
  const prevLogsLengthRef = useRef(activityLogs ? activityLogs.length : 0);
  const [showRestorationPulse, setShowRestorationPulse] = useState(false);

  useEffect(() => {
    if (activityLogs && activityLogs.length > prevLogsLengthRef.current) {
      const latestLog = activityLogs[0];
      if (latestLog && latestLog.estimatedEmission < 0) {
        setShowRestorationPulse(true);
        
        // Spin the globe slightly faster as feedback
        rotationVelocityRef.current.y = 0.035;

        const timer = setTimeout(() => {
          setShowRestorationPulse(false);
        }, 5000);
        
        return () => clearTimeout(timer);
      }
      prevLogsLengthRef.current = activityLogs.length;
    }
  }, [activityLogs]);

  useEffect(() => {
    if (!canvasRef.current || !mountRef.current) return;

    const container = mountRef.current;
    const canvas = canvasRef.current;

    const scene = new THREE.Scene();
    
    // Position camera
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.z = 5.2;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const globeGroup = new THREE.Group();
    scene.add(globeGroup);
    globeGroupRef.current = globeGroup;

    // Radius of Earth
    const coreRadius = 1.65;

    // -------------------------------------------------------------
    // PROCEDURAL EARTH SURFACE GENERATION
    // -------------------------------------------------------------
    const createEarthTexture = (score: number) => {
      const texWidth = 512;
      const texHeight = 256;
      const texCanvas = document.createElement('canvas');
      texCanvas.width = texWidth;
      texCanvas.height = texHeight;
      const ctx = texCanvas.getContext('2d');
      if (!ctx) return new THREE.Texture();

      // Simple 3D Math Helper functions 
      const hash3D = (x: number, y: number, z: number) => {
        const s = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453123;
        return s - Math.floor(s);
      };

      const mixVal = (a: number, b: number, t: number) => a * (1 - t) + b * t;

      const noise3D = (x: number, y: number, z: number) => {
        const ix = Math.floor(x);
        const iy = Math.floor(y);
        const iz = Math.floor(z);
        const fx = x - ix;
        const fy = y - iy;
        const fz = z - iz;

        const ux = fx * fx * (3.0 - 2.0 * fx);
        const uy = fy * fy * (3.0 - 2.0 * fy);
        const uz = fz * fz * (3.0 - 2.0 * fz);

        const n000 = hash3D(ix, iy, iz);
        const n100 = hash3D(ix + 1, iy, iz);
        const n010 = hash3D(ix, iy + 1, iz);
        const n110 = hash3D(ix + 1, iy + 1, iz);
        const n001 = hash3D(ix, iy, iz + 1);
        const n101 = hash3D(ix + 1, iy, iz + 1);
        const n011 = hash3D(ix, iy + 1, iz + 1);
        const n111 = hash3D(ix + 1, iy + 1, iz + 1);

        const n00 = mixVal(n000, n100, ux);
        const n10 = mixVal(n010, n110, ux);
        const n01 = mixVal(n001, n101, ux);
        const n11 = mixVal(n011, n111, ux);

        const n0 = mixVal(n00, n10, uy);
        const n1 = mixVal(n01, n11, uy);

        return mixVal(n0, n1, uz);
      };

      const fbm3D = (x: number, y: number, z: number, octaves = 5) => {
        let value = 0;
        let amplitude = 0.5;
        let frequency = 1.0;
        for (let i = 0; i < octaves; i++) {
          value += amplitude * noise3D(x * frequency, y * frequency, z * frequency);
          frequency *= 2.0;
          amplitude *= 0.5;
        }
        return value;
      };

      const imgData = ctx.createImageData(texWidth, texHeight);
      const data = imgData.data;

      // Coordinate centers of the 6 major restoration zones (mapping to continents on a 512x256 map)
      const centers = [
        { cx: 120, cy: 185 }, // North America
        { cx: 160, cy: 95 },  // South America
        { cx: 270, cy: 125 }, // Africa
        { cx: 310, cy: 180 }, // Europe
        { cx: 400, cy: 175 }, // Asia
        { cx: 440, cy: 85 }   // Australia
      ];

      // Grow green zones proportional to ACTUAL carbon saved (fully grown at 200 kg)
      const growthFactor = Math.min(score / 200, 1.0);
      const baseRadius = 8;
      const maxGrowthRadius = 32;
      const activeRadius = baseRadius + growthFactor * maxGrowthRadius;

      for (let y = 0; y < texHeight; y++) {
        for (let x = 0; x < texWidth; x++) {
          // Equirectangular mapping to unit sphere
          const longitude = (x / texWidth) * Math.PI * 2;
          const latitude = (y / texHeight) * Math.PI - Math.PI / 2;

          const nx = Math.cos(latitude) * Math.cos(longitude);
          const ny = Math.cos(latitude) * Math.sin(longitude);
          const nz = Math.sin(latitude);

          // Get terrain value
          const h = fbm3D(nx * 3.8, ny * 3.8, nz * 3.8, 5);

          let r = 0, g = 0, b = 0;

          if (h < 0.46) {
            // OCEAN LAYER (Aesthetic Blue ocean depth mapping)
            const oceanF = h / 0.46; // 0..1
            if (oceanF < 0.5) {
              const t = oceanF / 0.5;
              r = Math.round(mixVal(10, 15, t));
              g = Math.round(mixVal(20, 32, t));
              b = Math.round(mixVal(45, 78, t));
            } else {
              const t = (oceanF - 0.5) / 0.5;
              r = Math.round(mixVal(15, 23, t));
              g = Math.round(mixVal(32, 60, t));
              b = Math.round(mixVal(78, 145, t));
            }
          } else {
            // LANDMASS LAYER (Neutral grey/brown landmasses with height-based texture)
            const landF = (h - 0.46) / (1.0 - 0.46); // 0..1
            
            // Soft taupe/sandy/rocky land shades
            r = Math.round(mixVal(118, 76, landF));
            g = Math.round(mixVal(108, 70, landF));
            b = Math.round(mixVal(98, 64, landF));

            // Small natural terrain shading
            const relief = noise3D(nx * 20, ny * 20, nz * 20) * 8;
            r = Math.max(0, Math.min(255, r + relief));
            g = Math.max(0, Math.min(255, g + relief));
            b = Math.max(0, Math.min(255, b + relief));

            // RESTORATION LAYER (Sprouted green ecosystem patches)
            let maxIntensity = 0;
            for (let i = 0; i < centers.length; i++) {
              const c = centers[i];
              let dx = Math.abs(x - c.cx);
              if (dx > 256) dx = 512 - dx; // wrap longitude
              const dy = y - c.cy;
              const dist = Math.sqrt(dx * dx + dy * dy);

              if (dist < activeRadius) {
                const intensity = 1.0 - (dist / activeRadius);
                if (intensity > maxIntensity) {
                  maxIntensity = intensity;
                }
              }
            }

            if (maxIntensity > 0) {
              // Blend elegant emerald forest green
              const forestR = 25;
              const forestG = 135;
              const forestB = 84;

              r = Math.round(mixVal(r, forestR, maxIntensity));
              g = Math.round(mixVal(g, forestG, maxIntensity));
              b = Math.round(mixVal(b, forestB, maxIntensity));
            }
          }

          const idx = (y * texWidth + x) * 4;
          data[idx] = r;
          data[idx + 1] = g;
          data[idx + 2] = b;
          data[idx + 3] = 255;
        }
      }

      ctx.putImageData(imgData, 0, 0);
      const tex = new THREE.CanvasTexture(texCanvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      return tex;
    };

    // -------------------------------------------------------------
    // PROCEDURAL CLOUD LAYER GENERATION
    // -------------------------------------------------------------
    const createCloudTexture = () => {
      const texWidth = 256;
      const texHeight = 128;
      const texCanvas = document.createElement('canvas');
      texCanvas.width = texWidth;
      texCanvas.height = texHeight;
      const ctx = texCanvas.getContext('2d');
      if (!ctx) return new THREE.Texture();

      const hash3D = (x: number, y: number, z: number) => {
        const s = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453123;
        return s - Math.floor(s);
      };

      const mixVal = (a: number, b: number, t: number) => a * (1 - t) + b * t;

      const noise3D = (x: number, y: number, z: number) => {
        const ix = Math.floor(x);
        const iy = Math.floor(y);
        const iz = Math.floor(z);
        const fx = x - ix;
        const fy = y - iy;
        const fz = z - iz;
        const ux = fx * fx * (3.0 - 2.0 * fx);
        const uy = fy * fy * (3.0 - 2.0 * fy);
        const uz = fz * fz * (3.0 - 2.0 * fz);

        const n000 = hash3D(ix, iy, iz);
        const n100 = hash3D(ix + 1, iy, iz);
        const n010 = hash3D(ix, iy + 1, iz);
        const n110 = hash3D(ix + 1, iy + 1, iz);
        const n001 = hash3D(ix, iy, iz + 1);
        const n101 = hash3D(ix + 1, iy, iz + 1);
        const n011 = hash3D(ix, iy + 1, iz + 1);
        const n111 = hash3D(ix + 1, iy + 1, iz + 1);

        const n00 = mixVal(n000, n100, ux);
        const n10 = mixVal(n010, n110, ux);
        const n01 = mixVal(n001, n101, ux);
        const n11 = mixVal(n011, n111, ux);

        const n0 = mixVal(n00, n10, uy);
        const n1 = mixVal(n01, n11, uy);

        return mixVal(n0, n1, uz);
      };

      const fbm3D = (x: number, y: number, z: number, octaves = 4) => {
        let value = 0;
        let amplitude = 0.5;
        let frequency = 1.0;
        for (let i = 0; i < octaves; i++) {
          value += amplitude * noise3D(x * frequency, y * frequency, z * frequency);
          frequency *= 2.0;
          amplitude *= 0.5;
        }
        return value;
      };

      const imgData = ctx.createImageData(texWidth, texHeight);
      const data = imgData.data;

      for (let y = 0; y < texHeight; y++) {
        for (let x = 0; x < texWidth; x++) {
          const longitude = (x / texWidth) * Math.PI * 2;
          const latitude = (y / texHeight) * Math.PI - Math.PI / 2;

          const nx = Math.cos(latitude) * Math.cos(longitude);
          const ny = Math.cos(latitude) * Math.sin(longitude);
          const nz = Math.sin(latitude);

          const h = fbm3D(nx * 4.0, ny * 4.0, nz * 4.0, 4);

          // Transparent cloud density
          const density = Math.max(0, (h - 0.44) / (1.0 - 0.44));
          const alpha = Math.round(density * 165); // Subtle soft clouds

          const idx = (y * texWidth + x) * 4;
          data[idx] = 255;
          data[idx + 1] = 255;
          data[idx + 2] = 255;
          data[idx + 3] = alpha;
        }
      }

      ctx.putImageData(imgData, 0, 0);
      return new THREE.CanvasTexture(texCanvas);
    };

    // 1. Build Base Earth mesh
    const earthGeometry = new THREE.SphereGeometry(coreRadius, 32, 32);
    const earthTexture = createEarthTexture(totalSavedKgs);
    const earthMaterial = new THREE.MeshPhongMaterial({
      map: earthTexture,
      shininess: 12,
      specular: new THREE.Color(0x222222),
    });
    const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
    globeGroup.add(earthMesh);

    // 2. Build Cloud layer mesh (slightly expanded radius)
    const cloudGeometry = new THREE.SphereGeometry(coreRadius * 1.014, 32, 32);
    const cloudTexture = createCloudTexture();
    const cloudMaterial = new THREE.MeshPhongMaterial({
      map: cloudTexture,
      transparent: true,
      opacity: 0.85,
      depthWrite: false, // eliminates boundary depth buffering artifacts
    });
    const cloudMesh = new THREE.Mesh(cloudGeometry, cloudMaterial);
    globeGroup.add(cloudMesh);

    // 3. Realistic Atmosphere Outer Glow Mesh
    const glowGeometry = new THREE.SphereGeometry(coreRadius * 1.055, 32, 32);
    const glowMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.65 - dot(vNormal, vec3(0, 0, 1.0)), 2.5);
          gl_FragColor = vec4(0.4, 0.65, 1.0, 1.0) * intensity * 0.55;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true
    });
    const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
    scene.add(glowMesh);

    // 4. Lighting setup (Day/night contrast)
    const ambientLight = new THREE.AmbientLight(isDarkTheme ? 0x111625 : 0xdddddf, isDarkTheme ? 0.35 : 0.65);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, isDarkTheme ? 0.95 : 0.75);
    sunLight.position.set(5, 3.2, 5.5);
    scene.add(sunLight);

    // Dynamic sizing helper
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        const w = width || 280;
        const h = height || 280;
        
        renderer.setSize(w, h);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      }
    });
    resizeObserver.observe(container);

    // Interactive Drag Orbit behaviors
    const onMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const deltaX = e.clientX - lastMousePosRef.current.x;
      const deltaY = e.clientY - lastMousePosRef.current.y;

      globeGroup.rotation.y += deltaX * 0.005;
      globeGroup.rotation.x += deltaY * 0.005;

      rotationVelocityRef.current = {
        x: deltaY * 0.0006,
        y: deltaX * 0.0006,
      };

      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
    };

    // Mobile touch behaviors
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDraggingRef.current = true;
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
        x: deltaY * 0.0006,
        y: deltaX * 0.0006,
      };

      lastMousePosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onMouseUp);

    // Animation execution loops
    let animationId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      if (!isDraggingRef.current) {
        globeGroup.rotation.y += rotationVelocityRef.current.y;
        globeGroup.rotation.x += rotationVelocityRef.current.x;

        // Inertial damping towards steady spin
        rotationVelocityRef.current.y += (0.0015 - rotationVelocityRef.current.y) * 0.05;
        rotationVelocityRef.current.x += (0.0004 - rotationVelocityRef.current.x) * 0.05;
      }

      // Smooth cloud movement (flows slightly faster than actual Earth rotation)
      cloudMesh.rotation.y = elapsed * 0.016;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onMouseUp);

      earthGeometry.dispose();
      earthMaterial.dispose();
      earthTexture.dispose();
      cloudGeometry.dispose();
      cloudTexture.dispose();
      cloudMaterial.dispose();
      glowGeometry.dispose();
      glowMaterial.dispose();
      renderer.dispose();
    };
  }, [totalSavedKgs, isDarkTheme]);

  if (showOnlyGlobe) {
    return (
      <div 
        ref={mountRef}
        className="w-full h-64 md:h-80 relative group rounded-2xl bg-gradient-to-b from-stone-900/40 to-stone-950/60 p-2 border border-stone-300 dark:border-stone-700 hover:border-emerald-500/40 dark:hover:border-emerald-400/35 transition-all duration-300 shadow-[0_0_12px_rgba(16,185,129,0.04)] hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] dark:hover:shadow-[0_0_25px_rgba(16,185,129,0.22)] cursor-grab active:cursor-grabbing overflow-hidden flex items-center justify-center animate-fade-in"
        id="3d-earth-camera-stage-isolated"
      >
        <div className="absolute inset-0 transition-opacity duration-1000 ease-in-out pointer-events-none opacity-25 blur-3xl bg-radial-gradient from-blue-500/25 via-emerald-500/10 to-transparent" />
        <canvas ref={canvasRef} className="w-full h-full block focus:outline-hidden" />
        
        <div className="absolute top-3.5 left-4 pointer-events-none flex items-center space-x-1.5 bg-stone-950/80 backdrop-blur-md border border-stone-800 px-2.5 py-1 rounded-full text-[9px] font-mono font-bold tracking-wide uppercase text-stone-200">
          <Activity className="h-3 w-3 text-emerald-400 animate-pulse" />
          <span>Interactive Earth Model</span>
        </div>

        <div className="absolute bottom-3.5 right-4 pointer-events-none text-[8.5px] font-mono text-stone-300 bg-stone-950/75 backdrop-blur-md px-2 py-0.5 rounded border border-stone-800 select-none opacity-60 group-hover:opacity-100 transition-opacity duration-300">
          Drag to Rotate
        </div>

        <div className="absolute bottom-3.5 left-4 pointer-events-none text-[8.5px] font-mono text-emerald-400 bg-stone-950/80 backdrop-blur-md px-2.5 py-1 rounded border border-stone-800 flex items-center gap-1">
          <Leaf className="h-3 w-3 text-emerald-400" />
          <span>{restorationProgress}% Habitat Active</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col space-y-6" id="earth-restoration-widget">
      {/* Dynamic Activity Registration Celebrate Banner */}
      {showRestorationPulse && (
        <div className="w-full px-4 py-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-between text-xs animate-pulse" id="restoration-triggered-banner">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold">
            <Sparkles className="h-4 w-4 text-emerald-500 animate-spin" />
            <span>Eco Check-in Confirmed! Restoration Zones Expanding...</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 dark:bg-emerald-950/65 dark:text-emerald-300 px-1.5 py-0.5 rounded">Action Logged</span>
        </div>
      )}

      {/* Grid Configuration: Globe left, Stats right */}
      <div className="grid gap-6 md:grid-cols-5 w-full items-center">
        
        {/* Globe Container (Takes 3 columns) */}
        <div 
          ref={mountRef}
          className="md:col-span-3 h-64 md:h-80 w-full relative group rounded-2xl bg-gradient-to-b from-stone-900/40 to-stone-950/60 p-2 border border-stone-300 dark:border-stone-700 hover:border-emerald-500/40 dark:hover:border-emerald-400/35 transition-all duration-300 shadow-[0_0_12px_rgba(16,185,129,0.04)] hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] dark:hover:shadow-[0_0_25px_rgba(16,185,129,0.22)] cursor-grab active:cursor-grabbing overflow-hidden flex items-center justify-center"
          id="3d-earth-camera-stage"
        >
          {/* Subtle localized glow inside the stage */}
          <div className="absolute inset-0 transition-opacity duration-1000 ease-in-out pointer-events-none opacity-25 blur-3xl bg-radial-gradient from-blue-500/25 via-emerald-500/10 to-transparent" />

          <canvas ref={canvasRef} className="w-full h-full block focus:outline-hidden" />

          {/* Floaters inside the canvas stage */}
          <div className="absolute top-3.5 left-4 pointer-events-none flex items-center space-x-1.5 bg-stone-950/80 backdrop-blur-md border border-stone-800 px-2.5 py-1 rounded-full text-[9px] font-mono font-bold tracking-wide uppercase text-stone-200">
            <Activity className="h-3 w-3 text-emerald-400 animate-pulse" />
            <span>Interactive Earth Model</span>
          </div>

          <div className="absolute bottom-3.5 right-4 pointer-events-none text-[8.5px] font-mono text-stone-300 bg-stone-950/75 backdrop-blur-md px-2 py-0.5 rounded border border-stone-800 select-none opacity-60 group-hover:opacity-100 transition-opacity duration-300">
            Hold & Drag to Rotate
          </div>

          <div className="absolute bottom-3.5 left-4 pointer-events-none text-[8.5px] font-mono text-emerald-400 bg-stone-950/80 backdrop-blur-md px-2.5 py-1 rounded border border-stone-800 flex items-center gap-1">
            <Leaf className="h-3 w-3 text-emerald-400" />
            <span>{restorationProgress}% Habitat Active</span>
          </div>
        </div>

        {/* Dashboard Metrics (Takes 2 columns) */}
        <div className="md:col-span-2 space-y-4" id="restoration-indicators-panel">
          
          {/* Top segment banner metadata */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider font-mono block">ECOLOGICAL RESTORATION MONITOR</span>
            <h4 className="text-xl font-display font-black text-stone-900 dark:text-stone-50 leading-tight">Your Restoration Impact</h4>
          </div>

          {/* Dynamic human-centered description required by user prompt */}
          <div className="bg-stone-50 dark:bg-stone-950/30 border border-stone-150 dark:border-stone-850 p-4 rounded-xl space-y-1">
            <p className="text-[11px] text-stone-500 dark:text-stone-400 font-sans leading-relaxed">
              Your actions have helped restore approximately <strong className="text-emerald-600 dark:text-emerald-400 font-mono text-xs">{restorationArea} square meters</strong> of ecological impact.
            </p>
          </div>

          {/* Bento metric blocks */}
          <div className="grid grid-cols-2 gap-3.5">
            
            {/* Carbon Saved metric block */}
            <div className="p-3.5 bg-white border border-stone-200/60 dark:border-stone-800 dark:bg-stone-900/40 rounded-xl flex flex-col justify-between">
              <div>
                <span className="text-[9px] font-mono text-stone-400 uppercase font-bold block">Carbon Saved</span>
                <span className="text-base font-display font-extrabold text-stone-800 dark:text-stone-100 flex items-baseline gap-0.5 mt-1 leading-none">
                  {totalSavedKgs.toFixed(1)} <span className="text-[9.5px] font-normal text-stone-500 font-sans">kg CO₂</span>
                </span>
              </div>
              <div className="flex items-center gap-1 text-[9.5px] font-sans text-stone-400 mt-2 border-t border-stone-100 dark:border-stone-800 pt-1.5">
                <Flame className="h-2.5 w-2.5 text-stone-400 shrink-0" />
                <span>Avoided burden</span>
              </div>
            </div>

            {/* Restoration Area metric block */}
            <div className="p-3.5 bg-white border border-stone-200/60 dark:border-stone-800 dark:bg-stone-900/40 rounded-xl flex flex-col justify-between">
              <div>
                <span className="text-[9px] font-mono text-stone-400 uppercase font-bold block">Restored Area</span>
                <span className="text-base font-display font-extrabold text-emerald-600 dark:text-emerald-400 flex items-baseline gap-0.5 mt-1 leading-none">
                  {restorationArea} <span className="text-[10px] font-normal text-stone-500 font-sans">m²</span>
                </span>
              </div>
              <div className="flex items-center gap-1 text-[9.5px] font-sans text-emerald-600 dark:text-emerald-400 mt-2 border-t border-stone-100 dark:border-stone-800 pt-1.5">
                <Leaf className="h-2.5 w-2.5 text-emerald-500 shrink-0" />
                <span className="font-semibold">Revegetated land</span>
              </div>
            </div>

            {/* Estimated Ecological Impact block */}
            <div className="p-3.5 bg-white border border-stone-200/60 dark:border-stone-800 dark:bg-stone-900/40 rounded-xl col-span-2 space-y-1">
              <span className="text-[9px] font-mono text-stone-400 uppercase font-bold block">Estimated Ecological Impact</span>
              <div className="flex items-center gap-2 pt-0.5">
                <div className="h-7 w-7 rounded-lg bg-teal-50 dark:bg-teal-950/40 flex items-center justify-center shrink-0">
                  <TreePine className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                </div>
                <div>
                  <span className="text-xs font-bold text-stone-800 dark:text-stone-100 block leading-tight">
                    🌲 {Math.max(1, Math.round(totalSavedKgs / 21))}-Tree Offset Equivalent
                  </span>
                  <span className="text-[9.5px] text-stone-400 font-sans block">
                    Secures carbon equivalent to deep forest photosynthetic containment bounds.
                  </span>
                </div>
              </div>
            </div>

            {/* Ecosystem Status block */}
            <div className={`col-span-2 p-3 border border-stone-200/50 dark:border-stone-800 rounded-xl flex items-center justify-between text-xs`}>
              <div className="flex items-center gap-2">
                <Zap className="h-3.5 w-3.5 text-amber-500 animate-bounce-slow" />
                <span className="font-bold text-stone-700 dark:text-stone-300">Planetary Growth State:</span>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono tracking-wide ${statusColor}`}>
                {ecosystemStatus}
              </span>
            </div>

          </div>

          {/* Smooth progress bar demonstrating recovery completeness */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] text-stone-400 font-mono">
              <span>RESTORATION THRESHOLD PROGRESS</span>
              <span>{restorationProgress}%</span>
            </div>
            <div className="h-1.5 w-full bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${restorationProgress}%` }}
              />
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
