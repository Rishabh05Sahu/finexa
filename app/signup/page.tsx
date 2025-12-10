"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";

export default function SignupPage() {
  const router = useRouter();
  const setAccessToken = useAuthStore((state: any) => state.setAccessToken);

  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const handleSignup = async () => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Signup failed");
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

            <Input placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <Input placeholder="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />

            <Input placeholder="Password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />

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
