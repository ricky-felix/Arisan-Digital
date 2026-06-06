export function Button({
  children,
  variant = "primary",
  className = "",
  href,
  ...props
}) {
  const baseStyles =
    "px-6 py-3 font-medium rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";

  const variants = {
    primary:
      "bg-[#7c5cfc] text-white border-2 border-[#7c5cfc] hover:bg-[#9b7eff] hover:border-[#9b7eff] focus-visible:ring-[#7c5cfc]",
    secondary:
      "bg-white text-black border-2 border-black hover:bg-white focus-visible:ring-black",
    "secondary-alt":
      "bg-transparent text-white border-2 border-white hover:bg-white/10 focus-visible:ring-white",
  };

  const combinedClassName = `${baseStyles} ${variants[variant] || variants.primary} ${className}`;

  if (href) {
    return (
      <a
        href={href}
        className={`${combinedClassName} inline-block text-center`}
        {...props}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      className={combinedClassName}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
