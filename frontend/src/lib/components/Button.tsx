import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-primary text-(--bg-clr) shadow-[0_0_0_1px_var(--primary-clr)] hover:bg-primary/80",
  secondary:
    "border border-(--text-clr)/10 bg-(--text-clr)/5 text-(--text-clr) hover:bg-(--text-clr)/10",
  ghost: "text-primary hover:text-(--text-clr)",
  danger: "border border-red-500/30 bg-red-500/10 text-red-500 hover:bg-red-500/20",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-2 text-sm",
  md: "px-4 py-2.5 text-sm",
  lg: "px-5 py-3 text-sm",
};

const baseClasses =
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold cursor-pointer transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-60";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className ?? ""}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}
