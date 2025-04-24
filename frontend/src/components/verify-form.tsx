"use client";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { LogOut } from "lucide-react";

export default function VerifyForm({ className, ...props }: React.ComponentProps<"div">) {
  const [otp, setOtp] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get("email");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("https://bottleneckapi.saisurajch.me/auth/verifyemail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: { email, otp } }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push("/login");
      } else {
        setError(data.error || "Invalid OTP. Please try again.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      await fetch("https://bottleneckapi.saisurajch.me/auth/resendotp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: { email } }),
      });
      alert("OTP resent successfully.");
    } catch (err) {
      alert("Failed to resend OTP. Please try again.");
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
          <form className="p-6 md:pt-24 md:pb-24 md:ml-10 md:mr-10" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Verify Your Email</h1>
                <p className="text-balance text-muted-foreground">Enter the 6-digit OTP</p>
              </div>

              {error && <p className="text-red-500 text-center">{error}</p>}

              <div className="flex justify-center mt-10 mb-10">
                <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                  <InputOTPGroup>
                    {[0, 1, 2].map((index) => (
                      <InputOTPSlot key={index} index={index} />
                    ))}
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    {[3, 4, 5].map((index) => (
                      <InputOTPSlot key={index} index={index} />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Verifying..." : "Verify"}
              </Button>

              <div className="text-center text-sm">
                Didn&apos;t receive the OTP?{" "}
                <button type="button" className="underline" onClick={handleResendOtp}>
                  Resend OTP
                </button>
              </div>
            </div>
          </form>
          <div className="relative hidden bg-muted md:block">
            <Image
              src="/verify.jpg"
              alt="Verify Email"
              fill
              priority
              quality={100}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        </CardContent>
      </Card>
      <div className="text-center text-xs text-muted-foreground [&_a]:underline hover:[&_a]:text-primary">
        By clicking verify, you agree to our <a href="#">Terms of Service</a> and{" "}
        <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}