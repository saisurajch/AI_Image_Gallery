"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { Terminal, LogOut } from "lucide-react";
import { SpinnerIcon } from "@/components/icons";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface SignupFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export function SignupForm({ className, ...props }: React.ComponentProps<"div">) {
  const router = useRouter();
  const [formData, setFormData] = useState<SignupFormData>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        "https://bottleneckapi.saisurajch.me/auth/signup",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            body: {
              name: formData.fullName,
              email: formData.email,
              password: formData.password,
            },
          }),
        }
      );

      const data = await response.json();

      if (data.status === 201) {
        router.push(`/verify_email?email=${encodeURIComponent(formData.email)}`);
      } else {
        setError(data.error || "Something went wrong. Please try again.");
      }
    } catch (err) {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden">
        <Button
          onClick={() => router.push("/")}
          variant="ghost"
          size="icon"
          className="pointer-events-auto cursor-pointer opacity-50 absolute !bg-transparent hover:!bg-transparent hover:opacity-100"
        >
          <LogOut className="size-4" />
        </Button>
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 mx-12" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Create an Account</h1>
                <p className="text-muted-foreground">Signup for your Bottleneck account</p>
              </div>

              {error && (
                <Alert>
                  <Terminal className="h-4 w-4" />
                  <AlertTitle>Heads up!</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="grid gap-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" type="text" placeholder="John Doe" required value={formData.fullName} onChange={handleChange} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="m@example.com" required value={formData.email} onChange={handleChange} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" required value={formData.password} onChange={handleChange} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input id="confirmPassword" type="password" required value={formData.confirmPassword} onChange={handleChange} />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <SpinnerIcon className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? "Signing Up..." : "Sign Up"}
              </Button>

              <div className="text-center text-sm">
                Already have an account? <a href="/login" className="underline">Log in</a>
              </div>
            </div>
          </form>
          <div className="relative hidden bg-muted md:block">
            <Image src="/signup.jpg" alt="Signup" fill priority quality={100} className="absolute inset-0 h-full w-full object-cover" />
          </div>
        </CardContent>
      </Card>
      <div className="text-center text-xs text-muted-foreground [&_a]:underline hover:[&_a]:text-primary">
        By clicking continue, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}