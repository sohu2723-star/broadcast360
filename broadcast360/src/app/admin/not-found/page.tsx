"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#010312] px-4 text-white">
      <div className="max-w-md text-center">
        {/* Funny floating emoji */}
        <motion.div
          animate={{
            y: [0, -20, 0],
            rotate: [0, 10, -10, 0],
          }}

          transition={{
            duration: 2,
            repeat: Infinity,
          }}

          className="mb-6 text-8xl"
        >
          🛰️
        </motion.div>

        <motion.h1
          initial={{
            scale: 0,
          }}

          animate={{
            scale: 1,
          }}

          transition={{
            type: "spring",
            duration: 0.8,
          }}

          className="text-7xl font-black text-blue-400"
        >
          404
        </motion.h1>

        <h2 className="mt-5 text-2xl font-bold">Signal Lost </h2>

        <p className="mt-3 text-gray-400">
          Hmm... this page escaped from the server.
          <br />
          You do not have permission to access this page.
        </p>

        <motion.div
          animate={{
            x: [-10, 10, -10],
          }}

          transition={{
            duration: 1.5,
            repeat: Infinity,
          }}

          className="mt-6 text-4xl"
        >
          🏃‍♂️💨
        </motion.div>

        <Link
          href="/"

          className="mt-8 inline-block rounded-xl bg-blue-600 px-6 py-3 font-semibold transition hover:bg-blue-700"
        >
          Back to Login
        </Link>
      </div>
    </div>
  );
}
