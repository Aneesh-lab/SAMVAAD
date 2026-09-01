function Button({
  children,
  variant = "primary",
  size = "md",
  type = "button",
  disabled = false,
  onClick,
  className = "",
}) {
  const baseStyles =
    "inline-flex items-center justify-center rounded-lg font-semibold transition-colors duration-200 focus-visible:outline-3 focus-visible:outline-indigo-500 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

  const variants = {
    primary:
      "bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800",
    secondary:
      "bg-slate-100 text-slate-800 hover:bg-slate-200 active:bg-slate-300",
    outline:
      "border border-slate-300 bg-white text-slate-800 hover:bg-slate-50",
    danger:
      "bg-red-600 text-white hover:bg-red-700 active:bg-red-800",
  };

  const sizes = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
}

export default Button;