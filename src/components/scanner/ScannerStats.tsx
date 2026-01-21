"use client";

import { motion } from "framer-motion";

interface ScannerStatsProps {
  totalScans: number;
  successfulScans: number;
  alreadyCheckedIn: number;
  failedScans: number;
}

export default function ScannerStats({
  totalScans,
  successfulScans,
  alreadyCheckedIn,
  failedScans,
}: ScannerStatsProps) {
  const stats = [
    {
      label: "Total Scans",
      value: totalScans,
      color: "text-primary",
      bgColor: "bg-primary/20",
      borderColor: "border-primary/30",
    },
    {
      label: "Successful",
      value: successfulScans,
      color: "text-green-400",
      bgColor: "bg-green-500/20",
      borderColor: "border-green-500/30",
    },
    {
      label: "Already In",
      value: alreadyCheckedIn,
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/20",
      borderColor: "border-yellow-500/30",
    },
    {
      label: "Failed",
      value: failedScans,
      color: "text-red-400",
      bgColor: "bg-red-500/20",
      borderColor: "border-red-500/30",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`${stat.bgColor} ${stat.borderColor} border rounded-xl p-3 md:p-4 text-center`}
        >
          <p className={`text-2xl md:text-3xl font-bold ${stat.color}`}>
            {stat.value}
          </p>
          <p className="text-xs md:text-sm text-gray-400 font-mono mt-1">
            {stat.label}
          </p>
        </motion.div>
      ))}
    </div>
  );
}
