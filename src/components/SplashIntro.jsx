import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function SplashIntro({ totalSpecies, totalPhotos, onGetInfo }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isFading, setIsFading] = useState(false);
  const isWarpingRef = useRef(false);

  useEffect(() => {
    if (!canvasRef.current) return;

    // 1. Scene setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.05);

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.z = 5;

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: false,
      alpha: false,
      powerPreference: 'high-performance'
    });
    renderer.setClearColor(0x020202, 1);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

    // 4. Generate 3D Space Warp Tunnel Particles
    const particleCount = 1800;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    const speeds = new Float32Array(particleCount);
    const angles = new Float32Array(particleCount);
    const radii = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      // Random radius from center (tunnel walls)
      const r = Math.random() * 5 + 0.2;
      const angle = Math.random() * Math.PI * 2;
      
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r;
      // Z spread from -20 to 5
      const z = Math.random() * 25 - 20;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      radii[i] = r;
      angles[i] = angle;
      // Random speed for warp effect
      speeds[i] = Math.random() * 0.08 + 0.04;

      // Color scheme: Emerald green, teal, gold stardust
      const rand = Math.random();
      if (rand > 0.6) {
        colors[i * 3] = 0.96;     // Gold (R)
        colors[i * 3 + 1] = 0.62; // G
        colors[i * 3 + 2] = 0.04; // B
      } else if (rand > 0.2) {
        colors[i * 3] = 0.06;     // Emerald (R)
        colors[i * 3 + 1] = 0.72; // G
        colors[i * 3 + 2] = 0.5;  // B
      } else {
        colors[i * 3] = 0.06;    // Cyan/Teal (R)
        colors[i * 3 + 1] = 0.65; // G
        colors[i * 3 + 2] = 0.93; // B
      }
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Custom Points Material
    const material = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      sizeAttenuation: true
    });

    const particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);

    // 5. Interactive Mouse Listeners
    let targetMouseX = 0;
    let targetMouseY = 0;

    const onMouseMove = (e) => {
      targetMouseX = (e.clientX / window.innerWidth - 0.5) * 0.5;
      targetMouseY = (e.clientY / window.innerHeight - 0.5) * 0.5;
    };

    window.addEventListener('mousemove', onMouseMove);

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // 6. Animation Loop
    let animationFrameId;
    const lerpFactor = 0.05;

    const tick = () => {
      const posAttr = geometry.attributes.position;
      const array = posAttr.array;

      for (let i = 0; i < particleCount; i++) {
        // Accelerate if user clicked "Get Info" to enter website (Warp Speed!)
        if (isWarpingRef.current) {
          speeds[i] += 0.015; // accelerate stardust forward
        }

        // Move particles forward on Z axis
        array[i * 3 + 2] += speeds[i];

        // Swirl around Z-axis (vortex effect)
        angles[i] += isWarpingRef.current ? 0.015 : 0.003;
        array[i * 3] = Math.cos(angles[i]) * radii[i];
        array[i * 3 + 1] = Math.sin(angles[i]) * radii[i];

        // Reset particles that pass the camera back to the far end
        if (array[i * 3 + 2] > 5) {
          if (isWarpingRef.current) {
            // During warping, don't loop them back, let them burst out of the camera!
            array[i * 3 + 2] = -999; 
          } else {
            array[i * 3 + 2] = -20;
            speeds[i] = Math.random() * 0.08 + 0.04;
            radii[i] = Math.random() * 5 + 0.2;
          }
        }
      }
      posAttr.needsUpdate = true;

      // Slowly rotate the particle system container on Z
      particleSystem.rotation.z += isWarpingRef.current ? 0.02 : 0.001;

      // Mouse Parallax camera rotation
      camera.position.x += (targetMouseX * 4 - camera.position.x) * lerpFactor;
      camera.position.y += (-targetMouseY * 4 - camera.position.y) * lerpFactor;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(tick);
    };

    tick();

    // Cleanups
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
    };
  }, []);

  const handleEnterClick = () => {
    isWarpingRef.current = true;
    setIsFading(true);
    setTimeout(() => {
      onGetInfo();
    }, 850); // slightly longer transition for warp speed effect
  };

  return (
    <div 
      ref={containerRef} 
      className={`splash-overlay-wrapper ${isFading ? 'fade-out' : ''}`}
      role="dialog"
      aria-label="Welcome to Rexopro Animals Book World"
    >
      {/* 3D WebGL space stardust warp tunnel background */}
      <canvas ref={canvasRef} className="splash-canvas-3d" />

      {/* Foreground Content */}
      <div className="splash-content-panel">
        <div className="splash-badge">REXOPRO DIGITAL EXHIBITION</div>
        <h1 className="splash-headline-container">
          <span className="splash-sub-line">Welcome to</span>
          <span className="splash-main-line">REXOPRO</span>
          <span className="splash-desc-line">Animals Book World</span>
        </h1>
        <p className="splash-description">
          A premium interactive wildlife catalog featuring <strong style={{ color: '#10b981' }}>{totalSpecies}</strong> unique species and <strong style={{ color: '#10b981' }}>{totalPhotos.toLocaleString()}</strong> high-resolution 4K wallpapers optimized for laptop and mobile layouts.
        </p>
        <button 
          id="btn-splash-enter" 
          className="btn-splash-primary" 
          onClick={handleEnterClick}
          aria-label="Enter animal catalog website"
        >
          <span>Get Info</span> <i className="arrow-icon">➔</i>
        </button>
      </div>
    </div>
  );
}
