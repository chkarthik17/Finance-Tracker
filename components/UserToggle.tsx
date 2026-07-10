"use client";

import { Person } from "@/lib/types";
import { motion } from "framer-motion";

interface UserToggleProps {
  currentUser: Person;
  onToggle: (user: Person) => void;
}

export default function UserToggle({ currentUser, onToggle }: UserToggleProps) {
  return (
    <div className="fixed top-4 right-4 z-50 animate-fade-in">
      <div className="gaming-card px-3 py-2 flex items-center gap-2 sm:gap-3 shadow-xl">
        <span className="hidden sm:inline text-xs text-gray-400 font-medium">Dashboard:</span>
        <div className="relative flex items-center gap-1 bg-dark-bg rounded-lg p-1">
          <motion.div
            className="absolute h-9 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg shadow-lg"
            animate={{
              x: currentUser === "Karthik" ? 2 : 82,
              width: 76,
            }}
            transition={{ type: "spring", stiffness: 400, damping: 35 }}
          />
          <button
            onClick={() => onToggle("Karthik")}
            className={`relative z-10 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
              currentUser === "Karthik"
                ? "text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Karthik
          </button>
          <button
            onClick={() => onToggle("Likhita")}
            className={`relative z-10 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
              currentUser === "Likhita"
                ? "text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Likhita
          </button>
        </div>
        <div className="hidden sm:flex items-center gap-2 ml-1">
          <div className={`w-2 h-2 rounded-full ${
            currentUser === "Karthik" ? "bg-blue-400" : "bg-purple-400"
          }`} style={{ animation: "pulse-dot 2s ease-in-out infinite" }} />
        </div>
      </div>
    </div>
  );
}
