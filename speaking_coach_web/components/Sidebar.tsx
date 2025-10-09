"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Home,
  Mic,
  BarChart3,
  User,
  LogOut,
  Sparkles,
  FileText,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", label: "Home", icon: Home },
    { href: "/dashboard/speak", label: "Speak", icon: Mic },
    { href: "/dashboard/speech-generator", label: "Speech Generator", icon: FileText },
    { href: "/dashboard/progress", label: "Progress", icon: BarChart3 },
    { href: "/dashboard/profile", label: "Profile", icon: User },
  ];

  return (
    <aside className="relative flex flex-col justify-between h-screen w-64 bg-gradient-to-br from-indigo-50 via-white to-purple-50 border-r border-indigo-100 p-6 shadow-md">
      {/* 🌟 Brand / Logo */}
      <div>
        <motion.div
          className="flex items-center gap-2 mb-10"
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white shadow-lg">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 tracking-tight">
            SpeakSmart
          </h2>
        </motion.div>

        {/* 🧭 Navigation */}
        <nav className="flex flex-col space-y-2">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;

            return (
              <Link
                key={href}
                href={href}
                className={`group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 relative ${
                  isActive
                    ? "text-white bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg"
                    : "text-gray-700 hover:text-indigo-600 hover:bg-indigo-50"
                }`}
              >
                {/* Icon */}
                <div
                  className={`p-2 rounded-lg ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-indigo-100 text-indigo-600 group-hover:bg-indigo-200"
                  } transition-all`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <span>{label}</span>

                {/* ✨ Animated Left Border */}
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-full"
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* 🚪 Logout */}
      <div className="border-t border-gray-200 pt-4">
        <Link
          href="/login"
          onClick={() => localStorage.removeItem("token")}
          className="flex items-center gap-3 text-sm font-medium text-red-600 hover:text-red-700 transition-all"
        >
          <LogOut className="w-5 h-5" />
          Log Out
        </Link>
      </div>
    </aside>
  );
}
