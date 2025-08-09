"use client";

import Footer from "@/components/footer";
import Hero from "@/components/hero";
import Navbar from "@/components/navbar";
import { InstallPrompt } from "@/components/install-prompt";
import Link from "next/link";
import {
  ArrowUpRight,
  CheckCircle2,
  Shield,
  Users,
  Zap,
  Sparkles,
  Brain,
  Laptop,
  Smartphone,
  Tablet,
} from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer, staggerItem } from "@/utils/animations";
import { createClient } from "../../supabase/client";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      if (supabase) {
        try {
          const { data } = await supabase.auth.getUser();
          setUser(data.user);
        } catch (error) {
          console.warn("Failed to get user:", error);
        }
      } else {
        console.warn(
          "Supabase client not available. User authentication features will be disabled.",
        );
      }
    };

    getUser();
  }, [supabase]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navbar />
      <Hero />

      {/* Features Section */}
      <section id="features" className="py-24 bg-white dark:bg-gray-900">
        <motion.div
          className="container mx-auto px-4"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          viewport={{ once: true, amount: 0.2 }}
        >
          <motion.div className="text-center mb-16" variants={fadeInUp}>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              Powerful Features
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-lg">
              Our AI-powered note-taking platform helps you capture, organize,
              and retrieve your ideas with unprecedented ease.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Sparkles className="w-6 h-6" />,
                title: "AI-Powered Suggestions",
                description:
                  "Get intelligent topic suggestions and writing prompts based on your interests and past notes.",
              },
              {
                icon: <Brain className="w-6 h-6" />,
                title: "Smart Organization",
                description:
                  "Automatically categorize and tag your notes with our advanced AI classification system.",
              },
              {
                icon: <Shield className="w-6 h-6" />,
                title: "End-to-End Encryption",
                description:
                  "Your notes are secured with enterprise-grade encryption both in transit and at rest.",
              },
              {
                icon: <Zap className="w-6 h-6" />,
                title: "Offline Capability",
                description:
                  "Create and edit notes even without an internet connection with seamless syncing when you're back online.",
              },
              {
                icon: <Users className="w-6 h-6" />,
                title: "Collaborative Editing",
                description:
                  "Share notes with team members and edit together in real-time with version history.",
              },
              {
                icon: <CheckCircle2 className="w-6 h-6" />,
                title: "Cross-Platform Sync",
                description:
                  "Access your notes from any device with instant syncing across all your platforms.",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 h-full"
                variants={staggerItem}
                whileHover={{ y: -5, boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}
                transition={{ duration: 0.2 }}
              >
                <div className="text-primary mb-4 bg-primary/10 p-3 rounded-full w-fit">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* App Showcase Section */}
      <section className="py-24 bg-gray-50 dark:bg-gray-800">
        <motion.div
          className="container mx-auto px-4"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          viewport={{ once: true, amount: 0.2 }}
        >
          <motion.div className="text-center mb-16" variants={fadeInUp}>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              Available on All Devices
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-lg">
              Take notes anywhere, anytime with our cross-platform application
              that works seamlessly across all your devices.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 items-center">
            <motion.div
              className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-md text-center"
              variants={staggerItem}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
                <Laptop className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                Desktop App
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Powerful features for serious note-taking on Windows, Mac, and
                Linux.
              </p>
              <button className="px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors">
                Download Now
              </button>
            </motion.div>

            <motion.div
              className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-md text-center transform md:scale-110 z-10"
              variants={staggerItem}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <div className="mx-auto w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mb-4">
                <Smartphone className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                Mobile App
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Take notes on the go with our intuitive mobile app for iOS and
                Android.
              </p>
              <div className="flex justify-center gap-2">
                <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                  App Store
                </button>
                <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                  Google Play
                </button>
              </div>
            </motion.div>

            <motion.div
              className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-md text-center"
              variants={staggerItem}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
                <Tablet className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                Web App
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Access your notes from any browser with our responsive web
                application.
              </p>
              <button className="px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors">
                Open Web App
              </button>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-primary text-white dark:bg-primary/90">
        <motion.div
          className="container mx-auto px-4"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          viewport={{ once: true, amount: 0.2 }}
        >
          <motion.div
            className="grid md:grid-cols-4 gap-8 text-center"
            variants={staggerItem}
          >
            <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
              <div className="text-5xl font-bold mb-2">5M+</div>
              <div className="text-primary-foreground/80">Notes Created</div>
            </motion.div>
            <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
              <div className="text-5xl font-bold mb-2">100K+</div>
              <div className="text-primary-foreground/80">Active Users</div>
            </motion.div>
            <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
              <div className="text-5xl font-bold mb-2">99.9%</div>
              <div className="text-primary-foreground/80">Uptime</div>
            </motion.div>
            <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
              <div className="text-5xl font-bold mb-2">4.9/5</div>
              <div className="text-primary-foreground/80">User Rating</div>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-white dark:bg-gray-900">
        <motion.div
          className="container mx-auto px-4"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          viewport={{ once: true, amount: 0.2 }}
        >
          <motion.div className="text-center mb-16" variants={fadeInUp}>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              Simple, Transparent Pricing
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-lg">
              Choose the plan that works best for you and your team. All plans
              include core features.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col h-full"
              variants={staggerItem}
              whileHover={{ y: -5, boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}
              transition={{ duration: 0.2 }}
            >
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">
                  Free
                </h3>
                <div className="mt-2 flex items-baseline">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">
                    $0
                  </span>
                  <span className="ml-1 text-gray-500 dark:text-gray-400">
                    /month
                  </span>
                </div>
                <p className="mt-3 text-gray-600 dark:text-gray-300">
                  Perfect for personal use and getting started
                </p>
              </div>

              <ul className="space-y-3 mb-8 flex-grow">
                <li className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-gray-600 dark:text-gray-300">
                    Up to 100 notes
                  </span>
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-gray-600 dark:text-gray-300">
                    Basic AI-powered suggestions
                  </span>
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-gray-600 dark:text-gray-300">
                    Cross-platform sync
                  </span>
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-gray-600 dark:text-gray-300">
                    Basic search & organization
                  </span>
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-gray-600 dark:text-gray-300">
                    Email support
                  </span>
                </li>
              </ul>

              <Link
                href="/sign-up"
                className="w-full py-2 px-4 bg-primary text-white rounded-lg text-center font-medium hover:bg-primary/90 transition-colors"
              >
                Get Started Free
              </Link>
            </motion.div>

            {/* Pro Plan */}
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border-2 border-primary p-6 flex flex-col h-full relative transform md:scale-105 z-10"
              variants={staggerItem}
              whileHover={{ y: -5, boxShadow: "0 10px 25px rgba(0,0,0,0.15)" }}
              transition={{ duration: 0.2 }}
            >
              <div className="absolute -top-4 left-0 right-0 flex justify-center">
                <span className="bg-primary text-white text-sm font-medium px-3 py-1 rounded-full">
                  Most Popular
                </span>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">
                  Pro
                </h3>
                <div className="mt-2 flex items-baseline">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">
                    $9.99
                  </span>
                  <span className="ml-1 text-gray-500 dark:text-gray-400">
                    /month
                  </span>
                </div>
                <p className="mt-3 text-gray-600 dark:text-gray-300">
                  Perfect for professionals and small teams
                </p>
              </div>

              <ul className="space-y-3 mb-8 flex-grow">
                <li className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-gray-600 dark:text-gray-300">
                    Unlimited notes & storage
                  </span>
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-gray-600 dark:text-gray-300">
                    Advanced AI writing assistant
                  </span>
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-gray-600 dark:text-gray-300">
                    Smart categorization & tagging
                  </span>
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-gray-600 dark:text-gray-300">
                    Real-time collaboration
                  </span>
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-gray-600 dark:text-gray-300">
                    Advanced search & filters
                  </span>
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-gray-600 dark:text-gray-300">
                    Priority support
                  </span>
                </li>
              </ul>

              <Link
                href="/sign-up"
                className="w-full py-2 px-4 bg-primary text-white rounded-lg text-center font-medium hover:bg-primary/90 transition-colors"
              >
                Start Pro Trial
              </Link>
            </motion.div>

            {/* Enterprise Plan */}
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col h-full"
              variants={staggerItem}
              whileHover={{ y: -5, boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}
              transition={{ duration: 0.2 }}
            >
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">
                  Enterprise
                </h3>
                <div className="mt-2 flex items-baseline">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">
                    $29.99
                  </span>
                  <span className="ml-1 text-gray-500 dark:text-gray-400">
                    /month
                  </span>
                </div>
                <p className="mt-3 text-gray-600 dark:text-gray-300">
                  For organizations with advanced needs
                </p>
              </div>

              <ul className="space-y-3 mb-8 flex-grow">
                <li className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-gray-600 dark:text-gray-300">
                    Everything in Pro
                  </span>
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-gray-600 dark:text-gray-300">
                    Unlimited team members
                  </span>
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-gray-600 dark:text-gray-300">
                    Enterprise-grade security
                  </span>
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-gray-600 dark:text-gray-300">
                    Advanced admin controls
                  </span>
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-gray-600 dark:text-gray-300">
                    Custom integrations & API
                  </span>
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-gray-600 dark:text-gray-300">
                    Dedicated account manager
                  </span>
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-gray-600 dark:text-gray-300">
                    SLA & 24/7 support
                  </span>
                </li>
              </ul>

              <Link
                href="/sign-up"
                className="w-full py-2 px-4 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg text-center font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Contact Sales
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <motion.div
          className="container mx-auto px-4 text-center"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          viewport={{ once: true, amount: 0.2 }}
        >
          <motion.h2
            className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900 dark:text-white"
            variants={fadeInUp}
          >
            Ready to Get Started?
          </motion.h2>
          <motion.p
            className="text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto text-lg"
            variants={fadeInUp}
          >
            Join thousands of satisfied users who trust us with their notes and
            ideas.
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            variants={fadeInUp}
          >
            <Link
              href="/dashboard"
              className="inline-flex items-center px-8 py-4 text-white bg-primary rounded-lg hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-lg font-medium"
            >
              Get Started Now
              <ArrowUpRight className="ml-2 w-5 h-5" />
            </Link>
            <InstallPrompt
              showAsButton={true}
              buttonVariant="outline"
              className="px-8 py-4 text-lg"
            />
          </motion.div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
