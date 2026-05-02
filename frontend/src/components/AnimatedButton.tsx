import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface AnimatedButtonProps extends HTMLMotionProps<"button"> {
  variant?: "primary" | "ghost" | "outline" | "success" | "destructive";
  size?: "sm" | "md" | "lg";
}

export const AnimatedButton = forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    const variants = {
      primary:
        "bg-gradient-primary text-primary-foreground shadow-glow hover:shadow-glow-accent",
      ghost: "bg-transparent text-foreground hover:bg-secondary/60",
      outline: "border border-border bg-secondary/40 text-foreground hover:bg-secondary backdrop-blur-sm",
      success: "bg-gradient-success text-success-foreground shadow-success",
      destructive: "bg-gradient-destructive text-destructive-foreground shadow-destructive",
    };
    const sizes = {
      sm: "h-9 px-4 text-sm",
      md: "h-11 px-6 text-sm",
      lg: "h-14 px-8 text-base",
    };
    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.03, y: -1 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-tight transition-shadow duration-300 disabled:opacity-50 disabled:pointer-events-none",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);
AnimatedButton.displayName = "AnimatedButton";
