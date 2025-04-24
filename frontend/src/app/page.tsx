"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import { useRef, useState, useEffect } from "react";
import { InteractiveHoverButton } from "@/components/magicui/interactive-hover-button";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "next-themes";
import { Moon, Sun, MousePointer, UserPlus, LogOut } from "lucide-react";
import { SparklesText } from "@/components/magicui/sparkles-text";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { decodeJwt } from "jose";
// Utility: Detect mobile devices
const isMobile = () => {
  if (typeof window === "undefined") return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Utility: Get sparkle colors based on theme
const getSparkleColors = (theme: string | undefined) => {
  return theme === "dark"
    ? { first: "#000000", second: "#000000" }
    : { first: "#ffffff", second: "#ffffff" };
};

// Utility: Validate JWT token
const isTokenValid = (token: string | undefined) => {
  if (!token) return false;
  try {
    const decoded = decodeJwt(token) as { exp: number } | null;
    return decoded?.exp ? Date.now() < decoded.exp * 1000 : false;
  } catch {
    return false;
  }
};

const Scene = () => {
  const orbitControlsRef = useRef(null);
  const [isMobileDevice, setIsMobileDevice] = useState(false);

  useEffect(() => {
    setIsMobileDevice(isMobile());
  }, []);

  return (
    <>
      <OrbitControls ref={orbitControlsRef} enableZoom enablePan enableRotate />
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={0.5} color="#ffffff" />
      <Environment
        files={
          isMobileDevice
            ? "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/download3-7FArHVIJTFszlXm2045mQDPzsZqAyo.jpg"
            : "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/dither_it_M3_Drone_Shot_equirectangular-jpg_San_Francisco_Big_City_1287677938_12251179%20(1)-NY2qcmpjkyG6rDp1cPGIdX0bHk3hMR.jpg"
        }
        background
      />
    </>
  );
};

export default function Component() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);

    // Check if the id_token exists and is valid
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("id_token="))
      ?.split("=")[1];

    if (isTokenValid(token)) {
      setIsAuthenticated(true);
    }
  }, []);

  // Toggle between light and dark themes
  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  // Handle logout: clear id_token and redirect to login
  const handleLogout = () => {
    document.cookie = "id_token=; path=/;";
    setIsAuthenticated(false);
    router.push("/");
  };

  return (
    <div className="flex flex-col">
      <div className="relative w-full h-screen overflow-hidden">
        {/* Hero Section Overlay */}
        <section className="absolute top-20 left-1/2 transform -translate-x-1/2 z-10 flex flex-col items-center justify-center space-y-10 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="container flex flex-col items-center justify-center gap-6 text-center"
          >
            <motion.a
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center rounded-full bg-background px-4 py-1.5 text-sm font-medium"
            >
              🎉 <Separator className="mx-1 h-4" orientation="vertical" /> Introducing Bottleneck
            </motion.a>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-4xl font-bold leading-tight tracking-tighter md:text-6xl lg:text-7xl lg:leading-[1.1] text-clip"
            >
              <SparklesText text="Find your Images" colors={getSparkleColors(theme)} />
              <SparklesText text="at Light Speed" colors={getSparkleColors(theme)} />
            </motion.h1>
            <motion.div className="flex gap-4">
            {isAuthenticated ? (
              <InteractiveHoverButton className="bg-background" initialIcon={MousePointer} href="/home">
                Open Gallery
              </InteractiveHoverButton>
            ) : (
              <InteractiveHoverButton className="bg-background" initialIcon={UserPlus} href="/signup">
                Signup
              </InteractiveHoverButton>

            )}
            {isAuthenticated ? (
              <InteractiveHoverButton onClick={handleLogout} className="bg-background" initialIcon={UserPlus}>
                Logout
              </InteractiveHoverButton>
            ) : (
              <InteractiveHoverButton className="bg-background" initialIcon={UserPlus} href="/login">
                Login
              </InteractiveHoverButton>
            )}
            </motion.div>
          </motion.div>
        </section>

        <Canvas camera={{ position: [10, -0.1, 0], fov: 50 }}>
          <Scene />
        </Canvas>
      </div>
    </div>
  );
}
