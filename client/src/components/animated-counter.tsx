import { useEffect, useRef } from "react";
import { motion, useSpring, useTransform, useMotionValue, animate } from "framer-motion";

interface AnimatedCounterProps {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  duration?: number;
}

export function AnimatedCounter({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
  className = "",
  duration = 1.5,
}: AnimatedCounterProps) {
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (latest) => {
    return prefix + latest.toFixed(decimals) + suffix;
  });

  const prevValue = useRef(0);

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration,
      ease: "easeOut",
    });

    prevValue.current = value;
    
    return controls.stop;
  }, [value, motionValue, duration]);

  return (
    <motion.span className={className}>
      {rounded}
    </motion.span>
  );
}
