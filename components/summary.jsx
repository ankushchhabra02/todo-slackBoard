import { Users, ListTodo, Blocks, FolderKanban } from "lucide-react";
import { useEffect, useRef } from "react";

/* ---------- Animated Counter Hook ---------- */
function useCounterAnimation(value) {
  const ref = useRef(null);

  useEffect(() => {
    let start = 0;
    const end = parseInt(value);
    if (start === end) return;

    const duration = 800;
    const increment = end / (duration / 16);

    const animate = () => {
      start += increment;
      if (start >= end) start = end;
      if (ref.current) ref.current.innerText = Math.floor(start);
      if (start !== end) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [value]);

  return ref;
}

/* ---------- SummaryCards Component ---------- */
export default function SummaryCards({ teams, members, tasks, workspaces }) {
  const cards = [
    { title: "Teams", value: teams.length, icon: <Blocks className="w-6 h-6 text-blue-600" />, color: "bg-blue-50" },
    { title: "Members", value: members.length, icon: <Users className="w-6 h-6 text-purple-600" />, color: "bg-purple-50" },
    { title: "Tasks", value: tasks.length, icon: <ListTodo className="w-6 h-6 text-green-600" />, color: "bg-green-50" },
    { title: "Workspaces", value: workspaces.length, icon: <FolderKanban className="w-6 h-6 text-orange-600" />, color: "bg-orange-50" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {cards.map((card) => {
        const counterRef = useCounterAnimation(card.value);

        return (
          <div
            key={card.title}
            className="p-6 bg-white rounded-2xl shadow hover:shadow-lg transition cursor-pointer flex flex-col items-center text-center"
          >
            <div className={`p-3 rounded-full ${card.color} inline-flex`}>
              {card.icon}
            </div>
            <p className="text-gray-600 mt-2">{card.title}</p>
            <p ref={counterRef} className="text-4xl font-bold mt-1">
              0
            </p>
          </div>
        );
      })}
    </div>
  );
}
