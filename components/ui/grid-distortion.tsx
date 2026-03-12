"use client";

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const vertexShader = `
uniform float time;
varying vec2 vUv;
varying vec3 vPosition;
void main() {
  vUv = uv;
  vPosition = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
uniform sampler2D uDataTexture;
uniform sampler2D uTexture;
uniform vec4 resolution;
uniform float uTime;
uniform vec2 uMouse;
varying vec2 vUv;

vec4 blur(sampler2D tex, vec2 uv, float radius) {
  vec4 sum = vec4(0.0);
  float total = 0.0;
  for (float x = -3.0; x <= 3.0; x += 1.0) {
    for (float y = -3.0; y <= 3.0; y += 1.0) {
      float w = 1.0 - length(vec2(x, y)) / 4.2;
      if (w > 0.0) {
        sum += texture2D(tex, uv + vec2(x, y) * radius) * w;
        total += w;
      }
    }
  }
  return sum / total;
}

void main() {
  vec2 uv = vUv;
  vec4 offset = texture2D(uDataTexture, vUv);
  vec2 distortedUv = uv - 0.02 * offset.rg;

  // Auto-blur: drifting soft zones (5 zones, very slow + elegant)
  float autoBlur1 = smoothstep(0.45, 0.0, length(uv - vec2(
    0.5 + 0.4 * sin(uTime * 0.02),
    0.5 + 0.35 * cos(uTime * 0.015)
  )));
  float autoBlur2 = smoothstep(0.4, 0.0, length(uv - vec2(
    0.5 + 0.45 * cos(uTime * 0.015 + 2.0),
    0.5 + 0.3 * sin(uTime * 0.018 + 1.5)
  )));
  float autoBlur3 = smoothstep(0.35, 0.0, length(uv - vec2(
    0.5 + 0.3 * sin(uTime * 0.022 + 4.0),
    0.5 + 0.4 * cos(uTime * 0.012 + 3.0)
  )));
  float autoBlur4 = smoothstep(0.38, 0.0, length(uv - vec2(
    0.5 + 0.35 * cos(uTime * 0.018 + 5.5),
    0.5 + 0.35 * sin(uTime * 0.02 + 0.8)
  )));
  float autoBlur5 = smoothstep(0.3, 0.0, length(uv - vec2(
    0.5 + 0.25 * sin(uTime * 0.025 + 1.2),
    0.5 + 0.4 * cos(uTime * 0.012 + 4.5)
  )));
  float autoBlurAmount = max(max(max(max(autoBlur1, autoBlur2), autoBlur3), autoBlur4), autoBlur5) * 0.018;

  // Cursor blur: frosted glass around mouse
  float cursorDist = length(uv - uMouse);
  float cursorBlur = smoothstep(0.25, 0.0, cursorDist) * 0.015;

  float totalBlur = autoBlurAmount + cursorBlur;

  vec4 sharp = texture2D(uTexture, distortedUv);
  vec4 blurred = blur(uTexture, distortedUv, totalBlur);
  gl_FragColor = mix(sharp, blurred, smoothstep(0.0, 0.008, totalBlur));
}
`;

interface GridDistortionProps {
  grid?: number;
  mouse?: number;
  strength?: number;
  relaxation?: number;
  imageSrc: string;
  className?: string;
}

const GridDistortion: React.FC<GridDistortionProps> = ({ 
  grid = 15, 
  mouse = 0.1, 
  strength = 0.15, 
  relaxation = 0.9, 
  imageSrc, 
  className = '' 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const planeRef = useRef<THREE.Mesh | null>(null);
  const imageAspectRef = useRef(1);
  const animationIdRef = useRef<number | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    rendererRef.current = renderer;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    
    const camera = new THREE.OrthographicCamera(0, 0, 0, 0, -1000, 1000);
    camera.position.z = 2;
    cameraRef.current = camera;
    
    const uniforms = {
      time: { value: 0 },
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      resolution: { value: new THREE.Vector4() },
      uTexture: { value: null as THREE.Texture | null },
      uDataTexture: { value: null as THREE.DataTexture | null }
    };
    
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(imageSrc, texture => {
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.wrapS = THREE.ClampToEdgeWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      imageAspectRef.current = texture.image.width / texture.image.height;
      uniforms.uTexture.value = texture;
      handleResize();
    });
    
    const size = grid;
    const data = new Float32Array(4 * size * size);
    for (let i = 0; i < size * size; i++) {
      data[i * 4] = Math.random() * 255 - 125;
      data[i * 4 + 1] = Math.random() * 255 - 125;
    }
    
    const dataTexture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat, THREE.FloatType);
    dataTexture.needsUpdate = true;
    uniforms.uDataTexture.value = dataTexture;
    
    const material = new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      uniforms,
      vertexShader,
      fragmentShader,
      transparent: true
    });
    
    const geometry = new THREE.PlaneGeometry(1, 1, size - 1, size - 1);
    const plane = new THREE.Mesh(geometry, material);
    planeRef.current = plane;
    scene.add(plane);
    
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const rect = container.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      if (width === 0 || height === 0) return;
      const containerAspect = width / height;
      renderer.setSize(width, height);
      if (plane) {
        plane.scale.set(containerAspect, 1, 1);
      }
      const frustumHeight = 1;
      const frustumWidth = frustumHeight * containerAspect;
      camera.left = -frustumWidth / 2;
      camera.right = frustumWidth / 2;
      camera.top = frustumHeight / 2;
      camera.bottom = -frustumHeight / 2;
      camera.updateProjectionMatrix();
      uniforms.resolution.value.set(width, height, 1, 1);
    };
    
    if (window.ResizeObserver) {
      const resizeObserver = new ResizeObserver(() => {
        handleResize();
      });
      resizeObserver.observe(container);
      resizeObserverRef.current = resizeObserver;
    } else {
      window.addEventListener('resize', handleResize);
    }
    
    const mouseState = { x: 0, y: 0, prevX: 0, prevY: 0, vX: 0, vY: 0 };
    
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = 1 - (e.clientY - rect.top) / rect.height;
      mouseState.vX = x - mouseState.prevX;
      mouseState.vY = y - mouseState.prevY;
      Object.assign(mouseState, { x, y, prevX: x, prevY: y });
      uniforms.uMouse.value.set(x, y);
    };
    
    const handleMouseLeave = () => {
      if (dataTexture) {
        dataTexture.needsUpdate = true;
      }
      Object.assign(mouseState, { x: 0, y: 0, prevX: 0, prevY: 0, vX: 0, vY: 0 });
      uniforms.uMouse.value.set(-1, -1);
    };
    
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);
    handleResize();
    
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      if (!renderer || !scene || !camera) return;
      uniforms.time.value += 0.05;
      uniforms.uTime.value = uniforms.time.value;
      const t = uniforms.time.value;
      
      const imgData = dataTexture.image.data as Float32Array | null;
      if (!imgData) return;

      // Relaxation
      for (let i = 0; i < size * size; i++) {
        imgData[i * 4] *= relaxation;
        imgData[i * 4 + 1] *= relaxation;
      }

      // Auto-animation: slow organic wave that continuously ripples
      for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
          const index = 4 * (i + size * j);
          const nx = i / size;
          const ny = j / size;
          const wave = Math.sin(nx * 4 + t * 0.02) * Math.cos(ny * 3 + t * 0.012) * strength * 8;
          const wave2 = Math.cos(nx * 3 - t * 0.015) * Math.sin(ny * 5 + t * 0.01) * strength * 6;
          imgData[index] += wave;
          imgData[index + 1] += wave2;
        }
      }
      
      // Mouse interaction (layers on top of auto-animation)
      const gridMouseX = size * mouseState.x;
      const gridMouseY = size * mouseState.y;
      const maxDist = size * mouse;
      
      for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
          const distSq = Math.pow(gridMouseX - i, 2) + Math.pow(gridMouseY - j, 2);
          if (distSq < maxDist * maxDist) {
            const index = 4 * (i + size * j);
            const power = Math.min(maxDist / Math.sqrt(distSq), 10);
            imgData[index] += strength * 100 * mouseState.vX * power;
            imgData[index + 1] -= strength * 100 * mouseState.vY * power;
          }
        }
      }
      
      dataTexture.needsUpdate = true;
      renderer.render(scene, camera);
    };
    
    animate();
    
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      } else {
        window.removeEventListener('resize', handleResize);
      }
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
      
      if (renderer) {
        renderer.dispose();
        renderer.forceContextLoss();
        if (container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
      }
      if (geometry) geometry.dispose();
      if (material) material.dispose();
      if (dataTexture) dataTexture.dispose();
      if (uniforms.uTexture.value) uniforms.uTexture.value.dispose();
      
      sceneRef.current = null;
      rendererRef.current = null;
      cameraRef.current = null;
      planeRef.current = null;
    };
  }, [grid, mouse, strength, relaxation, imageSrc]);

  return (
    <div
      ref={containerRef}
      className={`w-full h-full overflow-hidden ${className}`}
      style={{ minWidth: '0', minHeight: '0' }}
    />
  );
};

export default GridDistortion;
