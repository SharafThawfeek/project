"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, Mail, User, BarChart3, Award, Mic, Save } from "lucide-react";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Fetch user + analytics data
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    Promise.all([
      fetch("http://localhost:8000/history", {
        headers: { Authorization: `Bearer ${token}` },
      }).then((res) => res.json()),
      fetch("http://localhost:8000/analytics", {
        headers: { Authorization: `Bearer ${token}` },
      }).then((res) => res.json()),
    ])
      .then(([historyData, analyticsData]) => {
        setUser(historyData.user);
        setStats(analyticsData);
      })
      .catch((err) => console.error("Failed to load profile:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const handleSave = async () => {
    if (!user?.username || !user?.email) return;
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8000/update_profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: user.username,
          email: user.email,
        }),
      });

      if (!res.ok) throw new Error(await res.text());
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2500);
    } catch (e) {
      alert("Failed to update profile. Check backend logs.");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-lg text-gray-500 animate-pulse">Loading profile...</p>
      </div>
    );

  if (!user)
    return (
      <p className="text-center text-gray-500">
        No profile found. Please log in again.
      </p>
    );

  const initials =
    user.username
      ?.split(" ")
      .map((n: string) => n[0]?.toUpperCase())
      .join("") || "U";

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col items-center py-16 px-6">
      {/* Success Toast */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg font-semibold"
          >
            ✅ Profile updated successfully!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-3xl bg-white/70 backdrop-blur-lg border border-indigo-100 shadow-xl rounded-3xl p-8"
      >
        <div className="flex flex-col items-center text-center space-y-4">
          {/* Avatar */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 100 }}
            className="w-28 h-28 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold shadow-md"
          >
            {initials}
          </motion.div>

          <h1 className="text-3xl font-bold text-gray-800">{user.username}</h1>
          <p className="text-gray-500 flex items-center gap-2 text-sm">
            <Mail className="w-4 h-4 text-indigo-500" /> {user.email}
          </p>

          <div className="h-px w-2/3 bg-gradient-to-r from-transparent via-indigo-300 to-transparent my-4"></div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full mt-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl shadow-md p-4 text-center"
            >
              <Mic className="mx-auto mb-2 w-6 h-6" />
              <h3 className="text-sm font-medium opacity-90">Total Analyses</h3>
              <p className="text-2xl font-bold mt-1">
                {stats?.trend?.length || 0}
              </p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl shadow-md p-4 text-center"
            >
              <Award className="mx-auto mb-2 w-6 h-6" />
              <h3 className="text-sm font-medium opacity-90">Best Score</h3>
              <p className="text-2xl font-bold mt-1">
                {stats?.best_score?.toFixed(1) || "—"}
              </p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-2xl shadow-md p-4 text-center"
            >
              <BarChart3 className="mx-auto mb-2 w-6 h-6" />
              <h3 className="text-sm font-medium opacity-90">
                Avg. Overall Score
              </h3>
              <p className="text-2xl font-bold mt-1">
                {stats?.avg_overall?.toFixed(1) || "—"}
              </p>
            </motion.div>
          </div>

          {/* Editable Info */}
          <div className="w-full mt-10 bg-white/60 border border-gray-200 rounded-2xl p-6 text-left shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              🧾 Account Details
            </h2>

            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 font-medium">
                  Username
                </label>
                <input
                  type="text"
                  value={user.username}
                  onChange={(e) =>
                    setUser({ ...user, username: e.target.value })
                  }
                  className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 font-medium">
                  Email
                </label>
                <input
                  type="email"
                  value={user.email}
                  onChange={(e) =>
                    setUser({ ...user, email: e.target.value })
                  }
                  className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
                />
              </div>
            </div>

            {/* Save Changes Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSave}
              disabled={saving}
              className={`mt-6 flex items-center justify-center gap-2 px-6 py-3 rounded-full font-semibold text-white transition-all shadow-md ${
                saving
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-indigo-500 to-purple-600 hover:shadow-lg"
              }`}
            >
              {saving ? "Saving..." : <Save className="w-5 h-5" />}
              {saving ? "" : "Save Changes"}
            </motion.button>
          </div>

          {/* Logout Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="mt-8 bg-gradient-to-r from-red-500 to-pink-600 text-white px-8 py-3 rounded-full font-semibold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
          >
            <LogOut className="w-5 h-5" /> Log Out
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
