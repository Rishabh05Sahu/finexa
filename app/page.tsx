"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navbar */}
      <header className="w-full flex justify-between items-center px-8 py-6 border-b">
        <h1 className="text-2xl font-bold">FinSight</h1>
        <div className="flex gap-4">
          <Button variant="ghost">Login</Button>
          <Button>Get Started</Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex flex-col lg:flex-row items-center justify-between mt-20 px-6 lg:px-20">
        {/* Text Section */}
        <div className="flex-1 text-center  lg:text-left">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-extrabold max-w-xl leading-tight"
          >
            Smarter Money Tracking Powered by{" "}
            <span className="text-blue-600">AI</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-lg text-gray-600 max-w-md"
          >
            Track your expenses, get auto-categorized insights, and understand
            where your money goes — instantly.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8 flex gap-4 justify-center lg:justify-start"
          >
            <a href="/login">
              <Button size="lg" className="flex cursor-pointer gap-2">
                Start Tracking <ArrowRight size={18} />
              </Button>
            </a>
            <Button className="cursor-pointer" size="lg" variant="outline">
              Live Demo
            </Button>
          </motion.div>
        </div>

        {/* Right Image Section */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="flex-1 mt-16 lg:mt-0 flex justify-center"
        >
          <img
            src="/assets/person-hero.png"
            alt="Person Illustration"
            className="w-[350px] lg:w-[450px] drop-shadow-xl"
          />
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="mt-32 px-8">
        <h3 className="text-3xl font-bold text-center">Why FinSight?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 max-w-6xl mx-auto">
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
              className="p-6 border rounded-2xl shadow-sm hover:shadow-md transition"
            >
              <CheckCircle2 className="text-blue-600 mb-4" size={28} />
              <h4 className="text-xl font-semibold">{f.title}</h4>
              <p className="text-gray-600 mt-2">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials Section  */}
      <section className="mt-32 px-8 max-w-6xl mx-auto">
        <h3 className="text-3xl font-bold text-center">What Our Users Say</h3>
        <p className="text-center text-gray-600 mt-2">
          Loved by professionals managing their daily finances
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          {[
            {
              name: "Rahul Verma",
              role: "Software Engineer",
              text: "FinSight has literally changed how I track money. The AI insights are crazy accurate!",
              img: "/assets/user1.png",
            },
            {
              name: "Sneha Kapoor",
              role: "Designer",
              text: "The dashboard is so clean and easy to understand. Helps me budget every month!",
              img: "/assets/user2.png",
            },
            {
              name: "Arjun Sharma",
              role: "Freelancer",
              text: "I love how it auto-categorizes my expenses. Saves me hours every week.",
              img: "/assets/user3.png",
            },
          ].map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="p-6 rounded-2xl border shadow-sm hover:shadow-md bg-white"
            >
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={t.img}
                  alt={t.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-semibold text-lg">{t.name}</h4>
                  <p className="text-gray-500 text-sm">{t.role}</p>
                </div>
              </div>
              <p className="text-gray-600 italic">"{t.text}"</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="mt-32 bg-blue-600 text-white py-20 text-center">
        <h3 className="text-4xl font-bold">
          Take control of your finances today
        </h3>
        <p className="mt-4 text-lg opacity-90">
          Join thousands of users managing money smarter with FinSight.
        </p>
        <Button
          size="lg"
          className="mt-8 bg-white text-blue-600 hover:bg-gray-100"
        >
          Get Started
        </Button>
      </section>

      {/* Footer */}
      <footer className="py-6 text-center text-gray-500 border-t mt-20">
        © 2025 FinSight. All rights reserved.
      </footer>
    </div>
  );
}
