// src/components/common/Ecomerce/Customers/CustomerOverview.jsx
import React, { useRef, useEffect, useState } from "react";
import { Users, UserCheck, UserX, Coins } from "lucide-react";

// Helper format VND
const vnd = (n) => Number(n || 0).toLocaleString("vi-VN") + "đ";

/**
 * Component tự co chữ số tiền cho vừa ô hiển thị
 */
function AutoFitNumber({ text, maxSize = 40, minSize = 18, className = "" }) {
  const spanRef = useRef(null);
  const [size, setSize] = useState(maxSize);

  useEffect(() => {
    const el = spanRef.current;
    if (!el) return;

    const fit = () => {
      let s = maxSize;
      el.style.fontSize = `${s}px`;
      const parent = el.parentElement;
      if (!parent) return;

      while (s > minSize && el.scrollWidth > parent.clientWidth) {
        s -= 1;
        el.style.fontSize = `${s}px`;
      }
      setSize(s);
    };

    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [text, maxSize, minSize]);

  return (
    <span
      ref={spanRef}
      className={`block font-bold leading-none whitespace-nowrap ${className}`}
      style={{ fontSize: `${size}px` }}
      title={text}
    >
      {text}
    </span>
  );
}

// Cấu hình các card thống kê
const CARDS = (stats) => [
  {
    key: "total",
    title: "Tổng khách hàng",
    value: stats.total ?? 0,
    icon: Users,
    barColor: "from-purple-500 to-pink-600",
    bgIcon: "bg-purple-50",
  },
  {
    key: "active",
    title: "Đang hoạt động",
    value: stats.active ?? 0,
    icon: UserCheck,
    barColor: "from-emerald-500 to-teal-600",
    bgIcon: "bg-emerald-50",
  },
  {
    key: "blocked",
    title: "Bị chặn",
    value: stats.blocked ?? 0,
    icon: UserX,
    barColor: "from-red-500 to-rose-600",
    bgIcon: "bg-rose-50",
  },
  {
    key: "spend",
    title: "Tổng chi tiêu",
    value: vnd(stats.totalSpend ?? 0),
    isMoney: true,
    icon: Coins,
    barColor: "from-emerald-500 to-green-600",
    bgIcon: "bg-emerald-50",
  },
];

// Tính % cho progress
const percent = (num, den) => {
  if (!den || den <= 0) return 0;
  return Math.min(100, Math.round((num / den) * 100));
};

export default function CustomerOverview({ stats }) {
  const safeStats = stats || {
    total: 0,
    active: 0,
    blocked: 0,
    totalSpend: 0,
  };

  const items = CARDS(safeStats);
  const total = safeStats.total || 0;
  const maxSpend = Math.max(
    1,
    (safeStats.totalSpend || 1) / Math.max(1, total)
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
      {items.map((card) => {
        const Icon = card.icon;

        const pg =
          card.key === "spend"
            ? Math.min(
                100,
                Math.round(
                  ((safeStats.totalSpend || 0) / (total * maxSpend * 0.8)) * 100
                )
              )
            : percent(
                Number(card.value || 0),
                total || Number(card.value || 1)
              );

        return (
          <div
            key={card.key}
            className="relative bg-white/95 text-slate-900 rounded-2xl p-6 border border-emerald-50 shadow-md hover:shadow-lg hover:-translate-y-[1px] transition-all"
          >
            <div className="flex items-start justify-between gap-4">
              {/* Text + số */}
              <div className="min-w-0">
                <p className="text-sm text-slate-500">{card.title}</p>

                <div className="mt-2 min-w-0">
                  {card.isMoney ? (
                    <AutoFitNumber
                      text={card.value}
                      maxSize={40}
                      minSize={18}
                    />
                  ) : (
                    <span className="block text-4xl font-bold leading-none whitespace-nowrap">
                      {card.value}
                    </span>
                  )}
                </div>
              </div>

              {/* Icon */}
              <div
                className={`w-14 h-14 rounded-xl ${card.bgIcon} flex items-center justify-center`}
              >
                <Icon className="w-6 h-6 text-slate-800/80" />
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-2 bg-gradient-to-r ${card.barColor}`}
                style={{ width: `${pg}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
