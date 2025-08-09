"use client";

import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";

import { motion } from "framer-motion";
import { fadeInUp, staggerContainer, staggerItem } from "@/utils/animations";

export default function Hero() {
  return (
    <div className="relative overflow-hidden bg-background dark:bg-gray-900">
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-blue-950 dark:via-gray-900 dark:to-purple-950 opacity-70" />

      {/* Animated background shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-blue-200 dark:bg-blue-900 opacity-20 blur-3xl"
          animate={{
            x: [0, 10, 0],
            y: [0, -15, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 8,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-40 -left-20 w-80 h-80 rounded-full bg-purple-200 dark:bg-purple-900 opacity-20 blur-3xl"
          animate={{
            x: [0, -10, 0],
            y: [0, 10, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 10,
            ease: "easeInOut",
            delay: 1,
          }}
        />
      </div>

      <motion.div
        className="relative pt-24 pb-32 sm:pt-32 sm:pb-40"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <motion.h1
              className="text-5xl sm:text-6xl font-bold text-gray-900 dark:text-white mb-8 tracking-tight"
              variants={fadeInUp}
            >
              Capture{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
                Ideas
              </span>{" "}
              with AI-Powered Notes
            </motion.h1>

            <motion.p
              className="text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed"
              variants={fadeInUp}
            >
              Organize your thoughts, boost productivity, and never lose an
              important idea again with our intelligent note-taking platform.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              variants={fadeInUp}
            >
              <Link
                href="/dashboard"
                className="inline-flex items-center px-8 py-4 text-white bg-primary rounded-lg hover:bg-primary/90 transition-all text-lg font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                Get Started Free
                <ArrowUpRight className="ml-2 w-5 h-5" />
              </Link>

              <Link
                href="#features"
                className="inline-flex items-center px-8 py-4 text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-all text-lg font-medium"
              >
                See Features
              </Link>
            </motion.div>

            <motion.div
              className="mt-16 flex flex-wrap justify-center gap-4 sm:gap-8 text-sm text-gray-600 dark:text-gray-300"
              variants={staggerItem}
            >
              <motion.div
                className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-sm"
                whileHover={{ y: -2, boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}
                transition={{ duration: 0.2 }}
              >
                <Check className="w-5 h-5 text-green-500" />
                <span>No credit card required</span>
              </motion.div>
              <motion.div
                className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-sm"
                whileHover={{ y: -2, boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}
                transition={{ duration: 0.2 }}
              >
                <Check className="w-5 h-5 text-green-500" />
                <span>14-day free trial</span>
              </motion.div>
              <motion.div
                className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-sm"
                whileHover={{ y: -2, boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}
                transition={{ duration: 0.2 }}
              >
                <Check className="w-5 h-5 text-green-500" />
                <span>Cancel anytime</span>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
