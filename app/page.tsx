"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Menu } from "lucide-react";
import Link from "next/link";
import ThemeToggle from "@/components/atom/ThemeToggle";
import { useState } from "react";

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col transition-colors duration-200">
      {/* Navbar */}
      <header className="w-full flex justify-between items-center px-4 sm:px-6 md:px-8 py-4 sm:py-6 border-b border-border">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">FinSight</h1>
        <div className="flex gap-2 sm:gap-4 items-center">
          <ThemeToggle />
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          {/* Desktop Buttons */}
          <div className="hidden md:flex gap-4">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-card">
          <div className="flex flex-col p-4 gap-2">
            <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start">
                Login
              </Button>
            </Link>
            <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full">Get Started</Button>
            </Link>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="flex flex-col lg:flex-row items-center justify-between mt-10 sm:mt-16 lg:mt-20 px-4 sm:px-6 lg:px-20">
        {/* Text Section */}
        <div className="flex-1 text-center lg:text-left">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold max-w-xl leading-tight text-foreground mx-auto lg:mx-0"
          >
            Smarter Money Tracking Powered by{" "}
            <span className="text-primary">AI</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-4 sm:mt-6 text-base sm:text-lg text-muted-foreground max-w-md mx-auto lg:mx-0"
          >
            Track your expenses, get auto-categorized insights, and understand
            where your money goes — instantly.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start"
          >
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" className="flex w-full sm:w-auto cursor-pointer gap-2 justify-center">
                Start Tracking <ArrowRight size={18} />
              </Button>
            </Link>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="cursor-pointer w-full sm:w-auto"
            >
              <a
                href="https://drive.google.com/file/d/1NiaQNUZtI5BAbgo6lVqejRhryiJNpKFH/view?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
              >
                Live Demo
              </a>
            </Button>
          </motion.div>
        </div>

        {/* Right Image Section */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="flex-1 mt-8 sm:mt-12 lg:mt-0 flex justify-center"
        >
          <img
            src="/image.png"
            alt="Person Illustration"
            className="w-[250px] sm:w-[300px] lg:w-[450px] drop-shadow-xl"
          />
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="mt-16 sm:mt-24 lg:mt-32 px-4 sm:px-6 md:px-8">
        <h3 className="text-2xl sm:text-3xl font-bold text-center text-foreground">
          Why FinSight?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mt-8 sm:mt-12 max-w-6xl mx-auto">
          {[
            {
              title: "AI Auto-Categorization",
              desc: "Enter a description and let AI classify your spending instantly.",
            },
            {
              title: "Smart Financial Insights",
              desc: "Monthly trends, patterns, and suggestions based on your usage.",
            },
            {
              title: "Visual Dashboard",
              desc: "Beautiful charts to understand your spending at a glance.",
            },
          ].map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="p-4 sm:p-6 border border-border rounded-2xl shadow-sm hover:shadow-md transition bg-card"
            >
              <CheckCircle2 className="text-primary mb-3 sm:mb-4" size={28} />
              <h4 className="text-lg sm:text-xl font-semibold text-card-foreground">
                {f.title}
              </h4>
              <p className="text-sm sm:text-base text-muted-foreground mt-2">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="mt-16 sm:mt-24 lg:mt-32 px-4 sm:px-6 md:px-8 max-w-6xl mx-auto">
        <h3 className="text-2xl sm:text-3xl font-bold text-center text-foreground">
          What Our Users Say
        </h3>
        <p className="text-center text-sm sm:text-base text-muted-foreground mt-2">
          Loved by professionals managing their daily finances
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mt-8 sm:mt-12">
          {[
            {
              name: "Rahul Verma",
              role: "Software Engineer",
              text: "FinSight has literally changed how I track money. The AI insights are crazy accurate!",
              img: "/rahul.png",
            },
            {
              name: "Sneha Kapoor",
              role: "Designer",
              text: "The dashboard is so clean and easy to understand. Helps me budget every month!",
              img: "/sneha.png",
            },
            {
              name: "Arjun Sharma",
              role: "Freelancer",
              text: "I love how it auto-categorizes my expenses. Saves me hours every week.",
              img: "/arjun.png",
            },
          ].map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="p-4 sm:p-6 rounded-2xl border border-border shadow-sm hover:shadow-md bg-card"
            >
              <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                <img
                  src={t.img}
                  alt={t.name}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-border"
                />
                <div>
                  <h4 className="font-semibold text-base sm:text-lg text-card-foreground">
                    {t.name}
                  </h4>
                  <p className="text-muted-foreground text-xs sm:text-sm">{t.role}</p>
                </div>
              </div>
              <p className="text-sm sm:text-base text-muted-foreground italic">"{t.text}"</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="mt-16 sm:mt-24 lg:mt-32 bg-primary text-primary-foreground py-12 sm:py-16 lg:py-20 text-center px-4 sm:px-6">
        <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
          Take control of your finances today
        </h3>
        <p className="mt-3 sm:mt-4 text-base sm:text-lg opacity-90">
          Join thousands of users managing money smarter with FinSight.
        </p>
        <Link href="/signup">
          <Button
            size="lg"
            className="mt-6 sm:mt-8 bg-background text-foreground hover:bg-muted hover:text-foreground"
          >
            Get Started
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="py-4 sm:py-6 text-center text-xs sm:text-sm text-muted-foreground border-t border-border mt-12 sm:mt-16 lg:mt-20">
        © 2025 FinSight. All rights reserved.
      </footer>
    </div>
  );
}