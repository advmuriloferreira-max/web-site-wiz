import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface WaveSkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
}

export function WaveSkeleton({ className, width = "100%", height = "20px" }: WaveSkeletonProps) {
  return (
    <div 
      className={cn("relative overflow-hidden bg-muted rounded-md", className)}
      style={{ width, height }}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
        animate={{
          x: ["-100%", "100%"],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}

interface PremiumSkeletonScreenProps {
  type: "card" | "table" | "form" | "dashboard";
  className?: string;
}

export function PremiumSkeletonScreen({ type, className }: PremiumSkeletonScreenProps) {
  const skeletonVariants = {
    hidden: { opacity: 0 },
    visible: (i: number) => ({
      opacity: 1,
      transition: {
        delay: i * 0.1,
        duration: 0.3,
      },
    }),
  };

  if (type === "card") {
    return (
      <motion.div 
        className={cn("p-6 space-y-4 border rounded-lg bg-card", className)}
        initial="hidden"
        animate="visible"
      >
        {[0, 1, 2, 3].map((i) => (
          <motion.div key={i} variants={skeletonVariants} custom={i}>
            <WaveSkeleton 
              height={i === 0 ? "24px" : i === 1 ? "16px" : "12px"}
              width={i === 0 ? "60%" : i === 1 ? "80%" : "40%"}
            />
          </motion.div>
        ))}
      </motion.div>
    );
  }

  if (type === "table") {
    return (
      <motion.div 
        className={cn("space-y-2", className)}
        initial="hidden"
        animate="visible"
      >
        {Array.from({ length: 5 }).map((_, rowIndex) => (
          <motion.div 
            key={rowIndex}
            className="flex space-x-4 p-4 border rounded-lg"
            variants={skeletonVariants}
            custom={rowIndex}
          >
            <WaveSkeleton width="40px" height="40px" className="rounded-full" />
            <div className="flex-1 space-y-2">
              <WaveSkeleton height="16px" width="60%" />
              <WaveSkeleton height="12px" width="40%" />
            </div>
            <WaveSkeleton width="80px" height="32px" />
          </motion.div>
        ))}
      </motion.div>
    );
  }

  if (type === "dashboard") {
    return (
      <motion.div 
        className={cn("space-y-6", className)}
        initial="hidden"
        animate="visible"
      >
        {/* Stats cards */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
          variants={skeletonVariants}
          custom={0}
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-6 border rounded-lg bg-card space-y-3">
              <WaveSkeleton height="16px" width="50%" />
              <WaveSkeleton height="32px" width="70%" />
              <WaveSkeleton height="12px" width="30%" />
            </div>
          ))}
        </motion.div>

        {/* Chart */}
        <motion.div 
          className="p-6 border rounded-lg bg-card"
          variants={skeletonVariants}
          custom={1}
        >
          <WaveSkeleton height="24px" width="40%" className="mb-4" />
          <WaveSkeleton height="300px" width="100%" />
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className={cn("space-y-4", className)}
      initial="hidden"
      animate="visible"
    >
      {Array.from({ length: 6 }).map((_, i) => (
        <motion.div key={i} variants={skeletonVariants} custom={i}>
          <WaveSkeleton height="20px" />
        </motion.div>
      ))}
    </motion.div>
  );
}