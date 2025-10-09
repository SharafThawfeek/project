"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Mic,
  History,
  BarChart3,
  User,
  LogOut,
  FileText,
} from "lucide-react";
import ChatbotWidget from "@/components/ChatbotWidget";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [username, setUsername] = useState<string>("Speaker");

  // 🧠 Fetch User Data on Mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        // ✅ Check if we already have username cached
        const cached = localStorage.getItem("username");
        if (cached) {
          setUsername(cached);
          return;
        }

        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch("http://localhost:8000/history", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch user");
        const data = await res.json();

        if (data.user?.username) {
          setUsername(data.user.username);
          localStorage.setItem("username", data.user.username);
        }
      } catch (err) {
        console.error("Error fetching user info:", err);
      }
    };

    fetchUser();
  }, []);

  // 🧭 Sidebar Navigation Items
  const navItems = [
    { href: "/dashboard", label: "Home", icon: LayoutDashboard },
    { href: "/dashboard/analyze", label: "Analyze", icon: Mic },
    { href: "/dashboard/speech-generator", label: "Speech Generator", icon: FileText },
    { href: "/dashboard/history", label: "History", icon: History },
    { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/dashboard/profile", label: "Profile", icon: User },
  ];

  // 🚪 Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 text-gray-900 relative">
      {/* 🌈 Sidebar */}
      <aside className="hidden md:flex w-64 bg-white/70 backdrop-blur-md border-r border-indigo-100 shadow-xl flex-col justify-between p-6 sticky left-0 top-0 h-screen">
        <div>
          {/* 🌟 Logo / App Name */}
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-2xl font-extrabold text-indigo-600 tracking-tight mb-8"
          >
            AI Coach
          </motion.h1>

          {/* 🧭 Navigation */}
          <nav className="space-y-2">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link key={href} href={href}>
                  <motion.div
                    whileHover={{ x: 6 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex items-center gap-3 px-4 py-2 rounded-xl cursor-pointer transition-all duration-200 ${
                      active
                        ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md"
                        : "hover:bg-indigo-50 text-gray-700"
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 ${
                        active ? "text-white" : "text-indigo-600"
                      }`}
                    />
                    <span
                      className={`font-medium ${active ? "text-white" : ""}`}
                    >
                      {label}
                    </span>
                  </motion.div>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* 🚪 Logout */}
        <Link
          href="/login"
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 mt-8"
        >
          <LogOut className="w-4 h-4" />
          Log out
        </Link>
      </aside>

      {/* 🧠 Main Content */}
      <div className="flex-1 flex flex-col relative">
        {/* 📌 Sticky Header */}
        <header className="bg-white/70 backdrop-blur-md border-b border-indigo-100 px-6 md:px-8 py-4 shadow-sm sticky top-0 z-10 flex justify-between items-center">
          <motion.h2
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-lg md:text-xl font-semibold text-indigo-700"
          >
            {pathname === "/dashboard"
              ? "Dashboard Overview"
              : pathname.split("/").pop()?.replace("-", " ").toUpperCase()}
          </motion.h2>

          {/* 👤 Dynamic Username */}
          <div className="text-sm text-gray-600 flex items-center gap-2">
            Welcome back,
            <span className="font-semibold text-indigo-600">
              {username} ✨
            </span>
          </div>
        </header>

        {/* 📄 Page Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {children}
          </motion.div>
        </main>

        {/* 💬 Floating Chatbot Widget */}
        <ChatbotWidget />
      </div>
    </div>
  );
}
