"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { fetchUserProfile } from "@/lib/api";
import { UserProfile } from "@/types/api";

export default function CheckInHubPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const userData = await fetchUserProfile(token);
        setUser(userData);

        // If user is registration-team only (not admin), redirect directly to building
        if (userData.role === "registration-team") {
          router.push("/checkin/building");
          return;
        }
        // If user is event-team only (not admin), redirect directly to session
        if (userData.role === "event-team") {
          router.push("/checkin/session");
          return;
        }
      } catch (err) {
        console.error("Auth error:", err);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const hasAccess =
    user?.role === "admin" ||
    user?.role === "registration-team" ||
    user?.role === "event-team";

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-primary font-mono text-xl animate-pulse">
          LOADING...
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 text-center max-w-md"
        >
          <div className="text-red-500 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="text-red-400 text-xl font-bold mb-2">Access Denied</h2>
          <p className="text-gray-400 mb-6">
            Check-in scanners are only available for staff members with{" "}
            <span className="text-primary">registration-team</span>,{" "}
            <span className="text-primary">event-team</span>, or{" "}
            <span className="text-primary">admin</span> roles.
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-6 py-2 bg-primary/20 border border-primary/30 text-primary rounded-lg hover:bg-primary/30 transition-colors"
          >
            Back to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  const canAccessBuilding =
    user?.role === "admin" || user?.role === "registration-team";
  const canAccessSession =
    user?.role === "admin" || user?.role === "event-team";

  return (
    <div className="min-h-screen bg-black pt-20 pb-10 px-4">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-primary/5 to-cyan-500/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-primary/20 to-cyan-500/20 rounded-2xl flex items-center justify-center border border-primary/30"
          >
            <svg
              className="w-10 h-10 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
              />
            </svg>
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
            QR <span className="text-primary">Scanner</span> Hub
          </h1>
          <p className="text-gray-400 text-lg">
            Select the check-in type to start scanning
          </p>
          {user && (
            <p className="text-gray-500 text-sm mt-2">
              Logged in as: <span className="text-primary">{user.name}</span> (
              {user.role})
            </p>
          )}
        </motion.div>

        {/* Scanner Options */}
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Building Check-in */}
          {canAccessBuilding && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Link href="/checkin/building">
                <div className="group bg-gradient-to-br from-primary/10 to-primary/5 backdrop-blur-lg border-2 border-primary/30 rounded-2xl p-6 md:p-8 hover:border-primary/60 hover:from-primary/20 hover:to-primary/10 transition-all duration-300 cursor-pointer h-full">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 bg-primary/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg
                        className="w-7 h-7 text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <span className="inline-block px-2 py-1 text-xs font-mono bg-primary/20 text-primary rounded mb-2">
                        REGISTRATION TEAM
                      </span>
                      <h2 className="text-xl font-bold text-white group-hover:text-primary transition-colors">
                        Building Check-in
                      </h2>
                    </div>
                  </div>
                  <p className="text-gray-400 mb-6">
                    Scan attendee QR codes at the building entrance. One-time
                    check-in to verify arrival at the venue.
                  </p>
                  <div className="flex items-center text-primary font-mono text-sm">
                    <span>Start Scanning</span>
                    <svg
                      className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </div>
                </div>
              </Link>
            </motion.div>
          )}

          {/* Session Check-in */}
          {canAccessSession && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Link href="/checkin/session">
                <div className="group bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 backdrop-blur-lg border-2 border-cyan-500/30 rounded-2xl p-6 md:p-8 hover:border-cyan-500/60 hover:from-cyan-500/20 hover:to-cyan-500/10 transition-all duration-300 cursor-pointer h-full">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 bg-cyan-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg
                        className="w-7 h-7 text-cyan-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <span className="inline-block px-2 py-1 text-xs font-mono bg-cyan-500/20 text-cyan-400 rounded mb-2">
                        EVENT TEAM
                      </span>
                      <h2 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                        Session Check-in
                      </h2>
                    </div>
                  </div>
                  <p className="text-gray-400 mb-6">
                    Track attendance for specific events and sessions. Select an
                    event first, then scan attendees.
                  </p>
                  <div className="flex items-center text-cyan-400 font-mono text-sm">
                    <span>Select Event</span>
                    <svg
                      className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </div>
                </div>
              </Link>
            </motion.div>
          )}
        </div>

        {/* Info Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 grid md:grid-cols-3 gap-4"
        >
          <div className="bg-black/40 border border-gray-800 rounded-xl p-4 text-center">
            <div className="text-2xl mb-2">📱</div>
            <p className="text-sm text-gray-400">
              Works on mobile & desktop with camera access
            </p>
          </div>
          <div className="bg-black/40 border border-gray-800 rounded-xl p-4 text-center">
            <div className="text-2xl mb-2">⚡</div>
            <p className="text-sm text-gray-400">
              Real-time check-in with instant feedback
            </p>
          </div>
          <div className="bg-black/40 border border-gray-800 rounded-xl p-4 text-center">
            <div className="text-2xl mb-2">🔒</div>
            <p className="text-sm text-gray-400">
              Role-based access for secure scanning
            </p>
          </div>
        </motion.div>

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 text-center"
        >
          <button
            onClick={() => router.push("/dashboard")}
            className="px-6 py-2 text-gray-400 hover:text-white transition-colors font-mono text-sm"
          >
            ← Back to Dashboard
          </button>
        </motion.div>
      </div>
    </div>
  );
}
