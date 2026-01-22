"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { API_URL } from "@/lib/api";

interface User {
  _id: string;
  name: string;
  email: string;
  role: "user" | "superadmin" | "event_manager" | "registration_team";
  college?: string;
  phoneNumber?: string;
  checkedIn: boolean;
  createdAt: string;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    fetchUsers(token);
  }, [router]);

  const fetchUsers = async (token: string) => {
    try {
      const response = await fetch(`${API_URL}/api/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login");
          return;
        }
        if (response.status === 403) {
          router.push("/dashboard");
          return;
        }
        throw new Error("Failed to fetch users");
      }

      const result = await response.json();
      setUsers(result.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/api/users/${userId}/role`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        throw new Error("Failed to update role");
      }

      // Update local state
      setUsers(
        users.map((user) =>
          user._id === userId
            ? { ...user, role: newRole as User["role"] }
            : user,
        ),
      );
      setEditingUserId(null);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (
      !confirm(
        `Are you sure you want to delete user "${userName}"? This action cannot be undone.`,
      )
    ) {
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || "Failed to delete user");
      }

      // Remove from local state
      setUsers(users.filter((user) => user._id !== userId));
      alert("User deleted successfully");
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      // Reload all users
      const token = localStorage.getItem("token");
      if (token) fetchUsers(token);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(
        `${API_URL}/api/admin/users/search?query=${encodeURIComponent(
          searchQuery,
        )}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Search failed");
      }

      const result = await response.json();
      setUsers(result.data);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const exportUsers = () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    window.open(`${API_URL}/api/admin/export/users?token=${token}`, "_blank");
  };

  const filteredUsers =
    filterRole === "all"
      ? users
      : users.filter((user) => user.role === filterRole);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 px-4 bg-black flex items-center justify-center">
        <div className="text-primary font-mono text-xl animate-pulse">
          LOADING USERS...
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
            USER
          </h1>
          <h2 className="text-3xl md:text-4xl text-primary font-orbitron mb-4">
            MANAGEMENT
          </h2>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-black border border-primary/20 p-6 rounded-lg mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="md:col-span-2">
              <label className="block text-gray-400 text-sm mb-2">
                Search by name or email
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="flex-1 px-4 py-2 bg-black border border-gray-600 text-white rounded focus:border-primary focus:outline-none"
                  placeholder="Search users..."
                />
                <button
                  onClick={handleSearch}
                  className="px-6 py-2 bg-primary text-black font-bold uppercase text-sm hover:bg-white transition-colors"
                >
                  Search
                </button>
              </div>
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-2">
                Filter by role
              </label>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full px-4 py-2 bg-black border border-gray-600 text-white rounded focus:border-primary focus:outline-none"
              >
                <option value="all">All Roles</option>
                <option value="user">User</option>
                <option value="superadmin">Superadmin</option>
                <option value="registration_team">Registration Team</option>
                <option value="event_manager">Event Manager</option>
              </select>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <div className="text-gray-400 text-sm">
              Showing {filteredUsers.length} users
            </div>
            <button
              onClick={exportUsers}
              className="px-4 py-2 bg-primary/20 text-primary border border-primary/50 rounded hover:bg-primary/30 transition-colors text-sm"
            >
              Export CSV
            </button>
          </div>
        </motion.div>

        {/* Users Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-black border border-primary/20 rounded-lg overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-primary/10 border-b border-primary/20">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">
                    College
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-900/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">
                        {user.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-400">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingUserId === user._id ? (
                        <select
                          value={user.role}
                          onChange={(e) =>
                            handleRoleChange(user._id, e.target.value)
                          }
                          className="px-2 py-1 bg-black border border-primary text-white rounded text-sm"
                        >
                          <option value="user">User</option>
                          <option value="superadmin">Superadmin</option>
                          <option value="registration_team">
                            Registration Team
                          </option>
                          <option value="event_manager">Event Manager</option>
                        </select>
                      ) : (
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded ${
                            user.role === "superadmin"
                              ? "bg-red-100 text-red-800"
                              : user.role === "registration_team"
                                ? "bg-blue-100 text-blue-800"
                                : user.role === "event_manager"
                                  ? "bg-purple-100 text-purple-800"
                                  : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {user.role.replace(/_/g, " ")}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-400">
                        {user.college || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.checkedIn ? (
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded bg-green-100 text-green-800">
                          Checked In
                        </span>
                      ) : (
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded bg-gray-100 text-gray-800">
                          Not Checked In
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        {editingUserId === user._id ? (
                          <button
                            onClick={() => setEditingUserId(null)}
                            className="text-gray-400 hover:text-white"
                          >
                            Cancel
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => setEditingUserId(user._id)}
                              className="text-primary hover:text-white"
                            >
                              Edit Role
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteUser(user._id, user.name)
                              }
                              className="text-red-500 hover:text-red-400"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              No users found
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
