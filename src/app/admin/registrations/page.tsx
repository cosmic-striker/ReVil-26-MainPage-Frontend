"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";

interface Registration {
  _id: string;
  user: {
    name: string;
    email: string;
  };
  event: {
    title: string;
    date: string;
    venue: string;
  };
  isTeamRegistration: boolean;
  teamName?: string;
  teamMembers?: Array<{
    name: string;
    email: string;
    phoneNumber: string;
    college: string;
    isLeader: boolean;
  }>;
  phoneNumber?: string;
  college?: string;
  registrationStatus: string;
  attended: boolean;
  createdAt: string;
}

export default function AdminRegistrationsPage() {
  const router = useRouter();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    fetchRegistrations(token);
  }, [router]);

  const fetchRegistrations = async (token: string) => {
    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
        }/api/admin/registrations/recent?limit=100`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login");
          return;
        }
        if (response.status === 403) {
          router.push("/dashboard");
          return;
        }
        throw new Error("Failed to fetch registrations");
      }

      const result = await response.json();
      setRegistrations(result.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 px-4 bg-black flex items-center justify-center">
        <div className="text-primary font-mono text-xl animate-pulse">
          LOADING REGISTRATIONS...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 px-4 bg-black pb-12">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link
            href="/admin"
            className="text-primary hover:text-white transition-colors mb-4 inline-block"
          >
            ← Back to Admin Dashboard
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-white font-orbitron mb-2">
            REGISTRATION
          </h1>
          <h2 className="text-3xl md:text-4xl text-primary font-orbitron mb-4">
            MANAGEMENT
          </h2>
          <div className="text-gray-400 text-sm">
            Showing {registrations.length} recent registrations
          </div>
        </motion.div>

        {/* Registrations List */}
        <div className="space-y-4">
          {registrations.map((registration, index) => (
            <motion.div
              key={registration._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.02 }}
              className="bg-black border border-primary/20 p-6 rounded-lg hover:border-primary/40 transition-colors"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-white">
                      {registration.user?.name || "Unknown User"}
                    </h3>
                    {registration.isTeamRegistration && (
                      <span className="px-2 py-1 text-xs rounded bg-primary/20 text-primary">
                        Team Registration
                      </span>
                    )}
                    {registration.attended && (
                      <span className="px-2 py-1 text-xs rounded bg-green-500/20 text-green-400">
                        Attended
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-400 space-y-1">
                    <div>📧 {registration.user?.email || "N/A"}</div>
                    <div>🎯 {registration.event?.title || "Event Deleted"}</div>
                    <div>
                      📅{" "}
                      {registration.event?.date
                        ? new Date(registration.event.date).toLocaleDateString()
                        : "N/A"}
                    </div>
                    <div>📍 {registration.event?.venue || "N/A"}</div>
                    <div className="text-xs text-gray-500 mt-2">
                      Registered:{" "}
                      {new Date(registration.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {registration.isTeamRegistration && registration.teamMembers ? (
                <div className="mt-4">
                  <button
                    onClick={() =>
                      setExpandedId(
                        expandedId === registration._id
                          ? null
                          : registration._id
                      )
                    }
                    className="text-primary hover:text-white transition-colors text-sm mb-2"
                  >
                    {expandedId === registration._id ? "▼" : "►"} Team:{" "}
                    {registration.teamName} ({registration.teamMembers.length}{" "}
                    members)
                  </button>

                  {expandedId === registration._id && (
                    <div className="mt-3 space-y-2 pl-4 border-l-2 border-primary/30">
                      {registration.teamMembers.map((member, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-gray-900/50 rounded text-sm"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-white font-semibold">
                              {member.name}
                            </span>
                            {member.isLeader && (
                              <span className="px-2 py-0.5 text-xs rounded bg-yellow-500/20 text-yellow-400">
                                Leader
                              </span>
                            )}
                          </div>
                          <div className="text-gray-400 text-xs space-y-0.5">
                            <div>📧 {member.email}</div>
                            <div>📱 {member.phoneNumber}</div>
                            <div>🏫 {member.college}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="mt-4 text-sm text-gray-400 space-y-1">
                  {registration.phoneNumber && (
                    <div>📱 {registration.phoneNumber}</div>
                  )}
                  {registration.college && <div>🏫 {registration.college}</div>}
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-gray-700">
                <span
                  className={`px-3 py-1 text-xs rounded ${
                    registration.registrationStatus === "registered"
                      ? "bg-blue-500/20 text-blue-400"
                      : registration.registrationStatus === "attended"
                      ? "bg-green-500/20 text-green-400"
                      : "bg-red-500/20 text-red-400"
                  }`}
                >
                  Status: {registration.registrationStatus}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {registrations.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            No registrations found
          </div>
        )}
      </div>
    </div>
  );
}
