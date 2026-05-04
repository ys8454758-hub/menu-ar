"use client";

import React, { Suspense, useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Environment, PerspectiveCamera, Float, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { useMotionValue, useSpring, animate as framerAnimate } from 'framer-motion';

interface IPhone3DProps {
  className?: string;
}

import { MotionValue } from 'framer-motion';

function Model({ rotationY }: { rotationY: MotionValue<number> }) {
  const { scene } = useGLTF('/models/iphone_17_pro_max.glb');
  const mockupTexture = useTexture('/images/ar_mockup.png');
  const groupRef = useRef<THREE.Group>(null);
  const isNormalized = useRef(false);
  useEffect(() => {
    mockupTexture.flipY = false;
    mockupTexture.colorSpace = THREE.SRGBColorSpace;
  }, [mockupTexture]);

  // 1. GEOMETRIC NORMALIZATION (Runs Once)
  useEffect(() => {
    if (!scene || isNormalized.current) return;
    scene.scale.set(1, 1, 1);
    scene.position.set(0, 0, 0);
    scene.rotation.set(0, 0, 0);
    scene.updateMatrixWorld();

    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    box.getSize(size);
    const center = new THREE.Vector3();
    box.getCenter(center);

    const scale = 5.5747 / Math.max(size.x, size.y, size.z);
    scene.scale.set(scale, scale, scale);
    scene.position.set(-center.x * scale, -center.y * scale - (size.y * scale * 0.1), -center.z * scale);
    isNormalized.current = true;
  }, [scene]);

  // 2. POSE & ORIENTATION
  useEffect(() => {
    if (!scene) return;
    // Base silhouette confirmation
    scene.rotation.y = Math.PI / 2; 
    scene.rotation.z = -0.174;        
  }, [scene]);

  // 3. SURGICAL MATERIAL PRECISION
  useEffect(() => {
    if (!scene) return;
    
scene.traverse((child) => {
      if (!('isMesh' in child) || !(child as THREE.Mesh).isMesh) return;

      const materials = Array.isArray((child as THREE.Mesh).material) ? (child as THREE.Mesh).material : [(child as THREE.Mesh).material];

      materials.forEach((mat) => {
        if (!mat) return;
        const matName = (mat.name || "").toLowerCase();
        const meshName = child.name.toLowerCase();
        
        // A. THE SCREEN (Target: screen.001)
        if (matName.includes('screen') || meshName.includes('screen')) {
          
          if (!child.userData.uvsGenerated) {
            const geometry = (child as THREE.Mesh).geometry;
            geometry.computeBoundingBox();
            const bbox = geometry.boundingBox;
            if (bbox) {
              const size = new THREE.Vector3();
              bbox.getSize(size);
              const pos = geometry.attributes.position;
              const uvs = new Float32Array(pos.count * 2);
              
              const dims = [
                { axis: 'x', size: size.x },
                { axis: 'y', size: size.y },
                { axis: 'z', size: size.z }
              ].sort((a, b) => b.size - a.size);
              
              const axisV = dims[0].axis as 'x' | 'y' | 'z';
              const axisU = dims[1].axis as 'x' | 'y' | 'z';
              
              for(let i=0; i<pos.count; i++) {
                const uVal = pos[`get${axisU.toUpperCase()}` as 'getX'|'getY'|'getZ'](i);
                const vVal = pos[`get${axisV.toUpperCase()}` as 'getX'|'getY'|'getZ'](i);
                uvs[i*2] = (uVal - bbox.min[axisU]) / size[axisU];
                uvs[i*2+1] = (vVal - bbox.min[axisV]) / size[axisV];
              }
              geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
              geometry.attributes.uv.needsUpdate = true;
            }
            child.userData.uvsGenerated = true;
          }

          mat.map = mockupTexture;
          mat.color.set('#ffffff');
          mat.emissive.set('#000000');
          mat.metalness = 0.1;
          mat.roughness = 0.2; // Slight sheen for realism
          mat.side = THREE.DoubleSide;
          mat.needsUpdate = true;
          return;
        }

        // B. CAMERA LENSES (Target: lensinglass)
        if (matName.includes('lensing') || meshName.includes('lensing') || meshName.includes('lens')) {
          mat.color.set('#050505');
          mat.metalness = 1.0;
          mat.roughness = 0.05;
          mat.envMapIntensity = 5; // Intense lens reflections
          mat.side = THREE.DoubleSide;
          return;
        }

        // C. CAMERA HOUSING (Target: black.002)
        if (matName.includes('black') || meshName.includes('black') || meshName.includes('housing')) {
          mat.color.set('#0a0a0a'); // Original Deep Matte Black
          mat.metalness = 0.5;
          mat.roughness = 0.4;
          mat.side = THREE.DoubleSide;
          return;
        }

        // D. THE FLASHLIGHT & SENSORS (Target: gray.001)
        if (matName.includes('gray') || meshName.includes('gray') || matName.includes('sensor') || meshName.includes('sensor')) {
          if (matName.includes('gray')) {
            mat.color.set('#fdfbd3'); // Soft Flashlight Yellow
            mat.emissive.set('#fdfbd3');
            mat.emissiveIntensity = 1.0; 
          } else {
            mat.color.set('#1a1a1a'); // Dark Sensor Glass
            mat.metalness = 0.9;
            mat.roughness = 0.1;
          }
          mat.side = THREE.DoubleSide;
          return;
        }

        // E. PREMIUM BODY & LOGO PROTECTION
        const isLogo = matName.includes('material.007') || matName.includes('logo');
        if (isLogo) {
          mat.color.set('#D35400'); // Deep Matte Orange Logo
          mat.metalness = 0.3;
          mat.roughness = 0.7;
          return;
        }

        const isBody = matName.includes('panel') || 
                       matName.includes('frame') || 
                       matName.includes('basecolor') || 
                       matName.includes('material') ||
                       meshName.includes('body') ||
                       meshName.includes('shell');

        if (isBody) {
          if (meshName.includes('frame') || matName.includes('frame')) {
            mat.color.set('#E67E22'); // Brushed Bronze-Orange Titanium Frame
          } else {
            mat.color.set('#FF7A00'); // Vivid Orange Back/Body
          }
          mat.metalness = 0.9;
          mat.roughness = 0.2;
          mat.side = THREE.FrontSide; // Prevent Z-fighting with logo decals
        }
      });
    });
  }, [scene, mockupTexture]);

  useFrame((state) => {
    if (groupRef.current) {
      const targetY = rotationY.get();
      const mouseX = state.mouse.x * 0.2;
      const mouseY = -state.mouse.y * 0.1;
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetY + mouseX, 0.1);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, mouseY, 0.1);
    }
  });

  return (
    <group ref={groupRef} dispose={null}>
      <primitive object={scene} />
    </group>
  );
}

export default function IPhone3D({ 
  className = "" 
}: IPhone3DProps) {
  const [isHovered, setIsHovered] = useState(false);
  const rotY = useMotionValue(0);
  const rotationY = useSpring(rotY, { stiffness: 60, damping: 20 });

  // Handle Pan/Drag
  const lastX = useRef(0);
  const isDragging = useRef(false);

  const onPointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    lastX.current = e.clientX;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const delta = e.clientX - lastX.current;
    rotY.set(rotY.get() + delta * 0.01);
    lastX.current = e.clientX;
  };

  const onPointerUp = () => {
    isDragging.current = false;
    framerAnimate(rotY, 0, { type: "spring", stiffness: 90, damping: 25 });
  };

  return (
    <div 
      className={`relative w-full h-[600px] lg:h-[800px] cursor-grab active:cursor-grabbing ${className}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 0, 12]} fov={35} />
        <ambientLight intensity={2.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={3} castShadow />
        <pointLight position={[-10, 10, -10]} intensity={1.5} />
        
        <Suspense fallback={null}>
          <Float 
            speed={isHovered ? 4 : 2} 
            rotationIntensity={0.5} 
            floatIntensity={1.5}
            floatingRange={[-0.2, 0.2]}
          >
            <Model rotationY={rotationY} />
          </Float>
          <Environment preset="studio" />
        </Suspense>
      </Canvas>

      <div className="absolute inset-0 pointer-events-none flex items-end justify-center pb-12 opacity-30">
        <div className="bg-black/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-[10px] tracking-[0.2em] text-white/80 uppercase">
          Drag to Rotate 360°
        </div>
      </div>
    </div>
  );
}
// Preload the model
useGLTF.preload('/models/iphone_17_pro_max.glb');
