import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { Float, PerspectiveCamera, Environment } from '@react-three/drei';

function HologramPlane() {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useLoader(THREE.TextureLoader, '/assets/logo_transparent.png');
  
  useFrame((state) => {
    if (!meshRef.current) return;
    
    // Smooth mouse parallax
    const targetX = (state.mouse.x * Math.PI) / 8;
    const targetY = (state.mouse.y * Math.PI) / 8;
    
    meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, targetX, 0.1);
    meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, -targetY, 0.1);
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh ref={meshRef}>
        <planeGeometry args={[5, 8]} />
        <meshStandardMaterial 
          map={texture} 
          transparent={true} 
          alphaTest={0.1}
          emissive="#d4af37" 
          emissiveIntensity={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>
    </Float>
  );
}

export function HeroLogo3D() {
  return (
    <div className="w-full h-[600px] flex items-center justify-center">
      <Canvas alpha dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 0, 10]} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#d4af37" />
        <Suspense fallback={null}>
          <HologramPlane />
          <Environment preset="city" />
        </Suspense>
      </Canvas>
    </div>
  );
}
