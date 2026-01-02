"use client";

import { Button } from "@/components/ui/button";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, CheckCircle2, Menu, Sparkles, TrendingUp, Zap } from "lucide-react";
import Link from "next/link";
import ThemeToggle from "@/components/atom/ThemeToggle";
import { useState } from "react";

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 300], [0, 200]);
  const y2 = useTransform(scrollY, [0, 300], [0, -100]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <div className="min-h-screen bg-background flex flex-col transition-colors duration-200 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        {/* Gradient Orbs */}
        <motion.div
          className="absolute top-0 -left-4 w-72 h-72 bg-primary/20 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-1/2 -right-4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
          animate={{
            x: [0, -50, 0],
            y: [0, 100, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-0 left-1/2 w-80 h-80 bg-primary/15 rounded-full blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, -80, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Navbar */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full flex justify-between items-center px-4 sm:px-6 md:px-8 py-4 sm:py-6 border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-50"
      >
        <motion.h1
          className="text-xl sm:text-2xl font-bold text-foreground"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          Finexa
        </motion.h1>
        <div className="flex gap-2 sm:gap-4 items-center">
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <ThemeToggle />
          </motion.div>
          {/* Mobile Menu Button */}
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="md:hidden"
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </motion.div>
          {/* Desktop Buttons */}
          <div className="hidden md:flex gap-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/login">
                <Button variant="ghost">Login</Button>
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/signup">
                <Button className="relative overflow-hidden group">
                  <span className="relative z-10">Get Started</span>
                  <motion.div
                    className="absolute inset-0 bg-primary/20"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 0.5 }}
                  />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{
          height: mobileMenuOpen ? "auto" : 0,
          opacity: mobileMenuOpen ? 1 : 0,
        }}
        transition={{ duration: 0.3 }}
        className="md:hidden border-b border-border bg-card overflow-hidden"
      >
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
      </motion.div>

      {/* Hero Section */}
      <section className="flex flex-col lg:flex-row items-center justify-between mt-10 sm:mt-16 lg:mt-20 px-4 sm:px-6 lg:px-20 relative">
        {/* Text Section */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex-1 text-center lg:text-left relative z-10"
        >
          {/* Animated Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6"
          >
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-sm font-medium text-primary">AI-Powered Finance</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold max-w-xl leading-tight text-foreground mx-auto lg:mx-0"
          >
            Smarter Money Tracking Powered by{" "}
            <motion.span
              className="text-primary inline-block"
              animate={{
                backgroundPosition: ["0%", "100%"],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatType: "reverse",
              }}
              style={{
                backgroundImage: "linear-gradient(90deg, currentColor, currentColor, currentColor)",
                backgroundSize: "200% auto",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              AI
            </motion.span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mt-4 sm:mt-6 text-base sm:text-lg text-muted-foreground max-w-md mx-auto lg:mx-0"
          >
            Track your expenses, get auto-categorized insights, and understand
            where your money goes — instantly.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start"
          >
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto"
            >
              <Link href="/login">
                <Button
                  size="lg"
                  className="flex w-full sm:w-auto cursor-pointer gap-2 justify-center relative overflow-hidden group"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Start Tracking <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                  <motion.div
                    className="absolute inset-0 bg-primary/20"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 0.5 }}
                  />
                </Button>
              </Link>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto"
            >
              <Button
                asChild
                size="lg"
                variant="outline"
                className="cursor-pointer w-full sm:w-auto group"
              >
                <a
                  href="https://drive.google.com/file/d/1NiaQNUZtI5BAbgo6lVqejRhryiJNpKFH/view?usp=sharing"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Live Demo
                  <ArrowRight className="ml-2 w-4 h-4 inline group-hover:translate-x-1 transition-transform" />
                </a>
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Right Image Section */}
        <motion.div
          style={{ y: y1, opacity }}
          className="flex-1 mt-8 sm:mt-12 lg:mt-0 flex justify-center relative"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ delay: 0.9, duration: 0.8, type: "spring", stiffness: 100 }}
            className="relative"
          >
            {/* Floating decoration */}
            <motion.div
              className="absolute -top-10 -right-10 w-20 h-20 bg-primary/20 rounded-full blur-xl"
              animate={{
                y: [0, -20, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.img
              src="/image.png"
              alt="Person Illustration"
              className="w-[250px] sm:w-[300px] lg:w-[450px] drop-shadow-2xl relative z-10"
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            {/* Glow effect */}
            <motion.div
              className="absolute inset-0 bg-primary/10 rounded-full blur-3xl -z-10"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="mt-16 sm:mt-24 lg:mt-32 px-4 sm:px-6 md:px-8 relative">
        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-2xl sm:text-3xl font-bold text-center text-foreground"
        >
          Why Finexa?
        </motion.h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mt-8 sm:mt-12 max-w-6xl mx-auto">
          {[
            {
              title: "AI Auto-Categorization",
              desc: "Enter a description and let AI classify your spending instantly.",
              icon: Zap,
            },
            {
              title: "Smart Financial Insights",
              desc: "Monthly trends, patterns, and suggestions based on your usage.",
              icon: TrendingUp,
            },
            {
              title: "Visual Dashboard",
              desc: "Beautiful charts to understand your spending at a glance.",
              icon: CheckCircle2,
            },
          ].map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2, duration: 0.6, type: "spring" }}
              whileHover={{
                y: -10,
                scale: 1.02,
                transition: { duration: 0.3 },
              }}
              className="p-4 sm:p-6 border border-border rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 bg-card group relative overflow-hidden"
            >
              {/* Hover gradient effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                initial={false}
              />
              <motion.div
                className="relative z-10"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <f.icon className="text-primary mb-3 sm:mb-4" size={28} />
              </motion.div>
              <h4 className="text-lg sm:text-xl font-semibold text-card-foreground relative z-10">
                {f.title}
              </h4>
              <p className="text-sm sm:text-base text-muted-foreground mt-2 relative z-10">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="mt-16 sm:mt-24 lg:mt-32 px-4 sm:px-6 md:px-8 max-w-6xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="text-2xl sm:text-3xl font-bold text-center text-foreground">
            What Our Users Say
          </h3>
          <p className="text-center text-sm sm:text-base text-muted-foreground mt-2">
            Loved by professionals managing their daily finances
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mt-8 sm:mt-12">
          {[
            {
              name: "Rahul Verma",
              role: "Software Engineer",
              text: "Finexa has literally changed how I track money. The AI insights are crazy accurate!",
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
              initial={{ opacity: 0, y: 50, rotateX: -15 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.6 }}
              whileHover={{
                y: -8,
                rotateY: 2,
                transition: { duration: 0.3 },
              }}
              className="p-4 sm:p-6 rounded-2xl border border-border shadow-sm hover:shadow-xl bg-card transition-all duration-300 group"
            >
              <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                <motion.img
                  src={t.img}
                  alt={t.name}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-border"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                />
                <div>
                  <h4 className="font-semibold text-base sm:text-lg text-card-foreground">
                    {t.name}
                  </h4>
                  <p className="text-muted-foreground text-xs sm:text-sm">{t.role}</p>
                </div>
              </div>
              <motion.p
                className="text-sm sm:text-base text-muted-foreground italic"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 + 0.3 }}
              >
                "{t.text}"
              </motion.p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="mt-16 sm:mt-24 lg:mt-32 bg-primary text-primary-foreground py-12 sm:py-16 lg:py-20 text-center px-4 sm:px-6 relative overflow-hidden"
      >
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <motion.div
            className="absolute inset-0"
            style={{
              backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
              backgroundSize: "50px 50px",
            }}
            animate={{
              backgroundPosition: ["0% 0%", "100% 100%"],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        </div>
        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-2xl sm:text-3xl lg:text-4xl font-bold relative z-10"
        >
          Take control of your finances today
        </motion.h3>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mt-3 sm:mt-4 text-base sm:text-lg opacity-90 relative z-10"
        >
          Join thousands of users managing money smarter with Finexa.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative z-10"
        >
          <Link href="/signup">
            <Button
              size="lg"
              className="mt-6 sm:mt-8 bg-background text-foreground hover:bg-muted hover:text-foreground relative overflow-hidden group"
            >
              <span className="relative z-10">Get Started</span>
              <motion.div
                className="absolute inset-0 bg-primary/20"
                initial={{ x: "-100%" }}
                whileHover={{ x: "100%" }}
                transition={{ duration: 0.5 }}
              />
            </Button>
          </Link>
        </motion.div>
      </motion.section>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="py-4 sm:py-6 text-center text-xs sm:text-sm text-muted-foreground border-t border-border mt-12 sm:mt-16 lg:mt-20"
      >
        © 2025 Finexa. All rights reserved.
      </motion.footer>
    </div>
  );
}