import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function Background3D() {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // 1. Scene setup
    const scene = new THREE.Scene();
    
    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(
      50, 
      window.innerWidth / window.innerHeight, 
      0.1, 
      100
    );
    camera.position.z = 6;

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // 4. Spawn Glowing Pollen Particles (Environmental 3D Effect)
    const particleCount = 180;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const speeds = [];

    for (let i = 0; i < particleCount; i++) {
      // Random coordinates inside a bounding box in front of camera
      positions[i * 3] = (Math.random() - 0.5) * 12;      // X
      positions[i * 3 + 1] = (Math.random() - 0.5) * 8;     // Y
      positions[i * 3 + 2] = (Math.random() - 0.5) * 2 + 1; // Z (closer to camera)

      // Random speed and drift frequencies
      speeds.push({
        y: Math.random() * 0.005 + 0.002,
        xOffset: Math.random() * 100,
        xDrift: Math.random() * 0.002 + 0.001
      });
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Soft glowing green/amber particle materials
    const particleMaterial = new THREE.PointsMaterial({
      color: 0xa7f3d0, // soft mint green
      size: 0.05,
      transparent: true,
      opacity: 0.7,
      sizeAttenuation: true
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // 5. Interactive Parallax Mouse Listeners
    let targetMouseX = 0;
    let targetMouseY = 0;

    const onMouseMove = (e) => {
      // Normalize to range [-0.5, 0.5]
      targetMouseX = (e.clientX / window.innerWidth - 0.5) * 0.6;
      targetMouseY = (e.clientY / window.innerHeight - 0.5) * 0.6;
    };

    window.addEventListener('mousemove', onMouseMove);

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    window.addEventListener('resize', handleResize);

    // 6. Animation loop
    let animationFrameId;
    const lerpFactor = 0.05;

    const tick = () => {
      // Interactive parallax on particles
      particles.position.x += (targetMouseX * 1.5 - particles.position.x) * lerpFactor;
      particles.position.y += (-targetMouseY * 1.5 - particles.position.y) * lerpFactor;
      particles.rotation.y += (targetMouseX * 0.2 - particles.rotation.y) * lerpFactor;
      particles.rotation.x += (targetMouseY * 0.2 - particles.rotation.x) * lerpFactor;

      // Floating particles movement
      const posAttr = particleGeometry.attributes.position;
      const array = posAttr.array;

      for (let i = 0; i < particleCount; i++) {
        // Drift upward
        array[i * 3 + 1] += speeds[i].y;
        // Sway side to side using sine wave offsets
        array[i * 3] += Math.sin(Date.now() * 0.001 + speeds[i].xOffset) * speeds[i].xDrift;

        // Wrap around boundaries
        if (array[i * 3 + 1] > 4.5) {
          array[i * 3 + 1] = -4.5;
          array[i * 3] = (Math.random() - 0.5) * 12;
        }
      }
      posAttr.needsUpdate = true;

      // Rotate particle cloud subtly
      particles.rotation.y += 0.0003;

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
      particleGeometry.dispose();
      particleMaterial.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} id="canvas-3d" aria-hidden="true" />;
}
