import { IconType } from "react-icons";
import { cn } from "../lib/utils/cn";

interface ButtonProps {
  label: string;
  icon?: IconType;
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "secondary" | "danger" | "success" | "ghost";
  disabled?: boolean;
  loading?: boolean;
  loadingLabel?: string;
  className?: string;
  onClick?: () => void;
  title?: string;
}

export default function Button({
  label,
  icon: Icon,
  type = "button",
  variant = "primary",
  disabled = false,
  loading = false,
  loadingLabel,
  className,
  onClick,
  title
}: ButtonProps) {
  const baseClasses =
    "px-4 py-2 rounded-lg transition-colors flex items-center disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed";

  const variantClasses = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white",
    secondary: "bg-zinc-600 hover:bg-zinc-700 text-white",
    danger: "bg-red-600 hover:bg-red-700 text-white",
    success: "bg-green-600 hover:bg-green-700 text-white",
    ghost: "text-red-400 hover:text-red-300 hover:bg-red-900/20"
  };

  const displayLabel = loading && loadingLabel ? loadingLabel : label;

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      title={title}
      className={cn(baseClasses, variantClasses[variant], className)}
    >
      {Icon && <Icon className={`${displayLabel ? "mr-2" : ""}`} />}
      {displayLabel}
    </button>
  );
}
