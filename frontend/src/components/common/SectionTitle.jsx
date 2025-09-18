// src/components/common/SectionTitle.jsx
export default function SectionTitle({ children }) {
  return (
    <h2 className="text-2xl font-bold mb-6 text-[var(--color-navy-800)] text-center">
      {children}
    </h2>
  );
}
