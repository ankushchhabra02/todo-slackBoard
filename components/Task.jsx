"use client";
import { useEffect, useRef } from "react";
import { CheckCircle, Clock, ListChecks } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

/* ------------------ Animated Counter Hook ------------------ */
function useCounterAnimation(value) {
  const ref = useRef(null);

  useEffect(() => {
    let start = 0;
    const end = parseInt(value);
    if (start === end) return;

    let duration = 800;
    let increment = end / (duration / 16);

    const animate = () => {
      start += increment;
      if (start >= end) {
        start = end;
      }
      if (ref.current) ref.current.innerText = Math.floor(start);
      if (start !== end) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [value]);

  return ref;
}

/* ------------------ MAIN COMPONENT ------------------ */
export default function TaskStatusSummary({ tasks }) {
  if (!tasks.length) return null;

  const total = tasks.length;
  const completed = tasks.filter(t => t.status === "done").length;
  const pending = tasks.filter(t => t.status === "pending").length;

  const totalRef = useCounterAnimation(total);
  const pendingRef = useCounterAnimation(pending);
  const completedRef = useCounterAnimation(completed);

  const chartData = [
    { name: "Completed", value: completed },
    { name: "Pending", value: pending },
  ];

  const COLORS = ["#22c55e", "#3b82f6"]; // green, blue

  const cards = [
    {
      label: "Total Tasks",
      ref: totalRef,
      color: "bg-blue-50 text-blue-600",
      icon: <ListChecks className="w-6 h-6 text-blue-600" />,
    },
    {
      label: "Pending",
      ref: pendingRef,
      color: "bg-yellow-50 text-yellow-600",
      icon: <Clock className="w-6 h-6 text-yellow-600" />,
    },
    {
      label: "Completed",
      ref: completedRef,
      color: "bg-green-50 text-green-600",
      icon: <CheckCircle className="w-6 h-6 text-green-600" />,
    },
  ];

  return (
    <div className="mt-10">

      {/* --- Status Cards --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
        {cards.map((c) => (
          <div
            key={c.label}
            className="p-6 bg-white rounded-2xl shadow hover:shadow-lg transition"
          >
            <div className={`inline-flex p-3 rounded-full ${c.color}`}>
              {c.icon}
            </div>
            <p className="text-gray-600 mt-3">{c.label}</p>
            <p
              ref={c.ref}
              className="text-4xl font-bold mt-1"
            >
              0
            </p>
          </div>
        ))}
      </div>

      {/* --- Pie Chart ---
      <div className="mt-10 bg-white rounded-2xl shadow p-6 h-80 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              outerRadius={120}
              innerRadius={60}
              paddingAngle={4}
            >
              {chartData.map((_, i) => (
                <Cell key={i} fill={COLORS[i]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div> */}
    </div>
  );
}
