// src/components/common/Button.jsx
// Nút bấm tái sử dụng

export default function Button({
  children,
  type = "primary",
  onClick,
  className = "",
}) {
  const base = "px-4 py-2 rounded-md font-medium transition";
  const styles =
    type === "primary"
      ? `${base} bg-[var(--color-accent-green)] text-white hover:bg-[var(--color-accent-green-600)]`
      : `${base} border border-gray-300 text-gray-700 hover:bg-gray-100`;

  return (
    <button onClick={onClick} className={`${styles} ${className}`}>
      {children}
    </button>
  );
}
