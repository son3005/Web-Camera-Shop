// src/components/common/Ecomerce/Customers/CustomerOverview.jsx
import React, { useRef, useEffect, useState } from "react";
import {
  Users,
  UserCheck,
  UserX,
  RefreshCcw,
  Star,
  Coins,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

const vnd = (n) => Number(n || 0).toLocaleString("vi-VN") + "đ";

/**
 * Tự động giảm font-size cho tới khi text vừa trong bề rộng ô chứa.
 * - Không tạo file mới, nhúng thẳng trong component.
 * - Dùng cho số tiền dài để không bị cắt "...".
 */
function AutoFitNumber({ text, maxSize = 40, minSize = 18, className = "" }) {
  const spanRef = useRef(null);
  const [size, setSize] = useState(maxSize);

  useEffect(() => {
    const el = spanRef.current;
    if (!el) return;

    const fit = () => {
      // reset về max trước khi đo
      let s = maxSize;
      el.style.fontSize = `${s}px`;

      // co dần tới khi không còn tràn
      // (el.scrollWidth > parent.clientWidth) => còn tràn
      const parent = el.parentElement;
      if (!parent) return;

      while (s > minSize && el.scrollWidth > parent.clientWidth) {
        s -= 1;
        el.style.fontSize = `${s}px`;
      }
      setSize(s);
    };

    fit();
    // Re-fit khi resize hoặc text đổi
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [text, maxSize, minSize]);

  return (
    <span
      ref={spanRef}
      className={`block font-bold leading-none whitespace-nowrap ${className}`}
      style={{ fontSize: `${size}px` }}
      title={text} // hover vẫn thấy đủ
    >
      {text}
    </span>
  );
}

const CARDS = (stats) => [
  {
    key: "total",
    title: "Tổng khách hàng",
    value: stats.total,
    change: "+15.3%",
    trend: "up",
    icon: Users,
    barColor: "from-purple-500 to-pink-600",
    bgIcon: "bg-purple-900/30",
  },
  {
    key: "active",
    title: "Đang hoạt động",
    value: stats.active,
    change: "+5.2%",
    trend: "up",
    icon: UserCheck,
    barColor: "from-emerald-500 to-teal-600",
    bgIcon: "bg-emerald-900/30",
  },
  {
    key: "returning",
    title: "Quay lại",
    value: stats.returning,
    change: "-1.8%",
    trend: "down",
    icon: RefreshCcw,
    barColor: "from-sky-500 to-indigo-600",
    bgIcon: "bg-sky-900/30",
  },
  {
    key: "blocked",
    title: "Bị chặn",
    value: stats.blocked,
    change: "+22.1%",
    trend: "up",
    icon: UserX,
    barColor: "from-red-500 to-rose-600",
    bgIcon: "bg-red-900/30",
  },
  {
    key: "vip",
    title: "Khách VIP",
    value: stats.vip,
    change: "+8.9%",
    trend: "up",
    icon: Star,
    barColor: "from-amber-400 to-yellow-500",
    bgIcon: "bg-amber-900/30",
  },
  {
    key: "spend",
    title: "Tổng chi tiêu",
    value: vnd(stats.totalSpend),
    isMoney: true, // <— đánh dấu để dùng AutoFitNumber
    change: "+1.2%",
    trend: "up",
    icon: Coins,
    barColor: "from-emerald-500 to-green-600",
    bgIcon: "bg-emerald-900/30",
  },
];

const percent = (num, den) => {
  if (!den || den <= 0) return 0;
  return Math.min(100, Math.round((num / den) * 100));
};

export default function CustomerOverview({ stats }) {
  const items = CARDS(stats || {});

  // Để progress có tỷ lệ đẹp:
  const total = stats?.total || 0;
  const maxSpend = Math.max(1, (stats?.totalSpend || 1) / Math.max(1, total)); // bình quân

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
      {items.map((card) => {
        const Icon = card.icon;

        // progress: các card đếm dùng %/tổng; card tiền dùng % so với “mức bình quân * 80”
        const pg =
          card.key === "spend"
            ? Math.min(
                100,
                Math.round(
                  ((stats?.totalSpend || 0) / (total * maxSpend * 0.8)) * 100
                )
              )
            : percent(
                Number(card.value || 0),
                total || Number(card.value || 1)
              );

        return (
          <div
            key={card.key}
            className="relative bg-slate-900/60 text-slate-100 rounded-2xl p-6 border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm text-slate-300">{card.title}</p>

                {/* Vùng hiển thị số — dùng AutoFitNumber cho tiền, số thường thì giữ text-4xl */}
                <div className="mt-2 min-w-0">
                  {card.isMoney ? (
                    <div className="min-w-0">
                      <AutoFitNumber
                        text={card.value}
                        maxSize={40} // cỡ lớn nhất
                        minSize={18} // co tối thiểu
                      />
                    </div>
                  ) : (
                    <span className="block text-4xl font-bold leading-none whitespace-nowrap">
                      {card.value}
                    </span>
                  )}
                </div>

                <div className="mt-3 flex items-center gap-2">
                  {card.trend === "up" ? (
                    <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-rose-400" />
                  )}
                  <span
                    className={`text-sm font-semibold ${
                      card.trend === "up" ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {card.change}
                  </span>
                </div>
              </div>

              <div
                className={`w-14 h-14 rounded-xl ${card.bgIcon} flex items-center justify-center`}
              >
                <Icon className="w-6 h-6 text-white/90" />
              </div>
            </div>

            <div className="mt-4 h-2 bg-white/10 rounded-full overflow-hidden">
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
