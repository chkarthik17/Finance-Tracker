"use client";

import { Person } from "@/lib/types";
import { motion } from "framer-motion";

interface UserToggleProps {
  currentUser: Person;
  onToggle: (user: Person) => void;
}

export default function UserToggle({ currentUser, onToggle }: UserToggleProps) {
  return (
    <div className="fixed top-3 right-3 z-50 animate-fade-in">
      <div className="relative flex items-center gap-0.5 bg-dark-card/90 backdrop-blur-sm rounded-full p-0.5 shadow-lg border border-white/10">
        <motion.div
          className="absolute h-7 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full shadow-md"
          animate={{
            x: currentUser === "Karthik" ? 2 : 52,
            width: 48,
          }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
        <button
          onClick={() => onToggle("Karthik")}
          className={`relative z-10 px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-300 ${
            currentUser === "Karthik"
              ? "text-white"
              : "text-gray-400"
          }`}
        >
          K
        </button>
        <button
          onClick={() => onToggle("Likhita")}
          className={`relative z-10 px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-300 ${
            currentUser === "Likhita"
              ? "text-white"
              : "text-gray-400"
          }`}
        >
          L
        </button>
      </div>
    </div>
  );
}
