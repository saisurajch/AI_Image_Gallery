"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import { useEffect, useState } from "react";

// 3D Scene Component
const Scene = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(/Android|iPhone|iPad|iPod/i.test(navigator.userAgent));
  }, []);

  return (
    <>
      <OrbitControls enableZoom enablePan enableRotate />
      <Environment
        files={
          isMobile
            ? "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/download3-7FArHVIJTFszlXm2045mQDPzsZqAyo.jpg"
            : "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/dither_it_M3_Drone_Shot_equirectangular-jpg_San_Francisco_Big_City_1287677938_12251179%20(1)-NY2qcmpjkyG6rDp1cPGIdX0bHk3hMR.jpg"
        }
        background
      />
    </>
  );
};

export default function ThreeCanvas() {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas camera={{ position: [10, -0.1, 0], fov: 50 }}>
        <Scene />
      </Canvas>
    </div>
  );
}
