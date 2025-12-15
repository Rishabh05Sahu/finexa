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

export default function LoginPage() {
  const router = useRouter();
  const setAccessToken = useAuthStore((state: any) => state.setAccessToken);

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const validateEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

  const handleLogin = async () => {
    if (loading) return;

    // ------- Frontend validation -------
    if (!form.email.trim() || !form.password.trim()) {
      toast.error("All fields are required");
      return;
    }

    if (!validateEmail(form.email)) {
      toast.error("Please enter a valid email");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      // ------- Backend validation / Errors -------
      if (!res.ok) {
        toast.error(data.error || "Invalid credentials");
        setLoading(false);
        return;
      }

      // ------- Success -------
      setAccessToken(data.accessToken);
      toast.success("Logged in successfully!");

      router.push("/dashboard");
    } catch (error) {
      toast.error("Something went wrong, please try again");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="w-[380px] shadow-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Welcome Back</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <Input
              placeholder="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />

            <Input
              placeholder="Password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />

            <Button className="w-full" onClick={handleLogin} disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>

            <p className="text-center text-sm text-gray-600 mt-4">
              Don’t have an account?
              <Link href="/signup" className="text-blue-600">
                {" "}
                Sign up
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
