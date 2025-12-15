"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";

export default function SignupPage() {
  const router = useRouter();
  const setAccessToken = useAuthStore((state: any) => state.setAccessToken);

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  
  const isPasswordStrong = (password: string) => {
    return (
      password.length >= 8 &&                 // at least 8 characters
      /[A-Z]/.test(password) &&              // one uppercase
      /[a-z]/.test(password) &&              // one lowercase
      /[0-9]/.test(password) &&              // one digit
      /[^A-Za-z0-9]/.test(password)          // one symbol
    );
  };

  // ✉️ Email Validator
  const isEmailValid = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSignup = async () => {


    if (!form.name || !form.email || !form.password) {
      toast.error("All fields are required");
      return;
    }

    if (!isEmailValid(form.email)) {
      toast.error("Enter a valid email address");
      return;
    }

    if (!isPasswordStrong(form.password)) {
      toast.error(
        "Password must be 8+ chars with uppercase, lowercase, number & symbol"
      );
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        // 🎯 If user already exists
        if (data.error?.includes("exists")) {
          toast.error("User already exists. Try logging in.");
        } else {
          toast.error(data.error || "Signup failed");
        }
        return;
      }

      setAccessToken(data.accessToken);
      toast.success("Signup successful!");
      router.push("/dashboard");
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="w-[380px] shadow-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Create Account</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Name */}
            <Input
              placeholder="Full Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            {/* Email */}
            <Input
              placeholder="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />

            {/* Password with toggle */}
            <div className="relative">
              <Input
                placeholder="Password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-black"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <Button className="w-full" onClick={handleSignup}>
              Sign Up
            </Button>

            <p className="text-center text-sm text-gray-600 mt-4">
              Already have an account?
              <Link href="/login" className="text-blue-600"> Login</Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
