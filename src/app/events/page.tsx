"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { fetchEvents } from "@/lib/api";
import { Event } from "@/types/api";

export default function EventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const data = await fetchEvents();
        setEvents(data);
      } catch (err) {
        const error = err as Error;
        if (error.message === "SERVER_OFFLINE") {
          setError("Backend server is offline. Please start the server.");
        } else {
          setError("Failed to load events. Please try again later.");
        }
        console.error("Error loading events:", error);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getEventTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      workshop: "bg-cyan-500/10 text-cyan-400 border-cyan-400/20",
      talk: "bg-purple-500/10 text-purple-400 border-purple-400/20",
      panel: "bg-green-500/10 text-green-400 border-green-400/20",
      networking: "bg-yellow-500/10 text-yellow-400 border-yellow-400/20",
    };
    return colors[type] || "bg-primary/10 text-primary border-primary/20";
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 px-4 bg-black flex items-center justify-center">
        <div className="text-primary font-mono text-xl animate-pulse">
          LOADING EVENTS...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-24 px-4 bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 font-mono text-xl mb-4">ERROR</div>
          <div className="text-gray-400">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 px-4 bg-black">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-white font-orbitron mb-4">
            <span className="text-primary">REVIL 2026</span> EVENTS
          </h1>
          <p className="text-gray-400 font-mono text-lg">
            Immersive cybersecurity challenges and competitions
          </p>
        </motion.div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {events.map((event, index) => (
            <motion.div
              key={event._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-black border border-primary/20 p-6 rounded-lg hover:border-primary transition-all group hover:shadow-lg hover:shadow-primary/20"
            >
              {/* Event Type Badge */}
              <div className="flex justify-between items-start mb-4">
                <span
                  className={`text-xs font-mono px-3 py-1 rounded-full border ${getEventTypeColor(
                    event.eventType
                  )}`}
                >
                  {event.eventType.toUpperCase()}
                </span>
                <span
                  className={`text-xs font-mono px-2 py-1 rounded ${
                    event.status === "upcoming"
                      ? "bg-green-500/20 text-green-400"
                      : event.status === "ongoing"
                      ? "bg-yellow-500/20 text-yellow-400"
                      : event.status === "completed"
                      ? "bg-gray-500/20 text-gray-400"
                      : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {event.status.toUpperCase()}
                </span>
              </div>

              {/* Event Title */}
              <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-primary transition-colors font-orbitron">
                {event.title}
              </h2>

              {/* Event Description */}
              <p className="text-gray-400 text-sm leading-relaxed mb-4 line-clamp-3">
                {event.description}
              </p>

              {/* Event Details */}
              <div className="space-y-2 mb-4 text-sm font-mono">
                <div className="flex items-center text-gray-400">
                  <span className="text-primary mr-2">📅</span>
                  {formatDate(event.date)}
                </div>
                <div className="flex items-center text-gray-400">
                  <span className="text-primary mr-2">⏰</span>
                  {event.startTime} - {event.endTime}
                </div>
                <div className="flex items-center text-gray-400">
                  <span className="text-primary mr-2">📍</span>
                  {event.venue}
                </div>
                <div className="flex items-center text-gray-400">
                  <span className="text-primary mr-2">👥</span>
                  {event.registeredCount} / {event.capacity} registered
                </div>
              </div>

              {/* Register Button */}
              <button
                onClick={() => router.push(`/events/${event._id}/register`)}
                className="w-full px-4 py-2 bg-primary/10 text-primary text-sm font-bold border border-primary/20 rounded hover:bg-primary hover:text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={
                  event.status === "completed" ||
                  event.status === "cancelled" ||
                  event.registeredCount >= event.capacity
                }
              >
                {event.status === "completed"
                  ? "COMPLETED"
                  : event.status === "cancelled"
                  ? "CANCELLED"
                  : event.registeredCount >= event.capacity
                  ? "FULL"
                  : "REGISTER NOW"}
              </button>
            </motion.div>
          ))}
        </div>

        {events.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 font-mono">
              No events available at the moment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
