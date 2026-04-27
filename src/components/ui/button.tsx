"use client";
import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "ghost" | "danger";
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", loading, children, disabled, ...props }, ref) => {
    const base = "cursor-pointer inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none";
    const variants = {
      primary: "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500",
      outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-indigo-500",
      ghost: "text-gray-600 hover:bg-gray-100 focus:ring-gray-400",
      danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    };
    return (
      <button ref={ref} className={cn(base, variants[variant], className)} disabled={disabled || loading} {...props}>
        {loading ? <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : null}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
export { Button };
