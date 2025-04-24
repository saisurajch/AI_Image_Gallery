"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { SpinnerIcon } from "@/components/icons";
import { LogOut } from "lucide-react"

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // ✅ Added loading state
  const router = useRouter();

  const setCookie = (name: string, value: string) => {
    const expires = new Date(Date.now() + 60 * 60 * 1000).toUTCString(); // 1 hour
    document.cookie = `${name}=${value}; path=/; expires=${expires}; Secure`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true); // ✅ Start loading

    try {
      const response = await fetch("https://bottleneckapi.saisurajch.me/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          body: {
            email,
            password,
          },
        }),
      });

      if (!response.ok) throw new Error("Invalid email or password");

      const data = await response.json();

      // Extract id_token from the 'body' field (which is a JSON string)
      const body = JSON.parse(data.body);
      const { id_token } = body;

      if (!id_token) throw new Error("Missing id_token in response");

      // Set the id_token in a cookie (1-hour expiry)
      setCookie("id_token", id_token);

      // Redirect to dashboard
      router.push("/");
    } catch (error) {
      setError("Login failed. Please check your credentials.");
    } finally {
      setLoading(false); // ✅ Stop loading
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      
      <Card className="overflow-hidden">
      <Button onClick={() => router.push("/")} variant="ghost" size="icon" className="pointer-events-auto cursor-pointer opacity-50 absolute !bg-transparent hover:!bg-transparent hover:opacity-100">
            <LogOut  className="size-4 " />
          </Button>
        <CardContent className="grid p-0 md:grid-cols-2">
          
          <form className="p-6 md:pt-24 md:pb-24 md:ml-10 md:mr-10" onSubmit={handleSubmit}>
            
            <div className="flex flex-col gap-6">

              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Welcome back</h1>
                <p className="text-balance text-muted-foreground">
                  Login to your Bottleneck account
                </p>
              </div>
              {error && <p className="text-red-500">{error}</p>}
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <a
                    href="/forgot_password"
                    className="ml-auto text-sm underline-offset-2 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <SpinnerIcon className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? "Logging in..." : "Login"}
              </Button>

              <div className="text-center text-sm">
                Don&apos;t have an account?{" "}
                <a href="/signup" className="underline underline-offset-4">
                  Sign up
                </a>
              </div>
            </div>
          </form>
          <div className="relative hidden bg-muted md:block">
            <Image
              src="/login.jpg"
              alt="Image"
              fill
              priority
              quality={100}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        </CardContent>
      </Card>
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
        By clicking continue, you agree to our{" "}
        <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}
