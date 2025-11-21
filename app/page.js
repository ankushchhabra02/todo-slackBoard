"use client";
import SummaryCards from "@/components/summary";
import TaskStatusSummary from "@/components/Task";
import { useEffect, useState } from "react";
import { getSocket } from "@/utils/socket";
async function fetchData(endpoint) {
  const res = await fetch(`http://localhost:3000/dashboard/${endpoint}`, {
    cache: "no-store",
  });
  return res.json();
}

export default function DashboardPage() {
  const [teams, setTeams] = useState([]);
  const [members, setMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);

  const [openTeam, setOpenTeam] = useState(null);
  const [openWorkspace, setOpenWorkspace] = useState(null);

  useEffect(() => {
    async function loadAll() {
      const t = await fetchData("teams");
      const m = await fetchData("members");
      const ta = await fetchData("tasks");
      const w = await fetchData("workspaces");
  
      const cleaned = w.map((x) => {
        const { raw_oauth, ...rest } = x;
        return rest;
      });
  
      setTeams(t);
      setMembers(m);
      setTasks(ta);
      setWorkspaces(cleaned);
    }
  
    // Initial load
    loadAll();
  
    // Connect socket
    const socket = getSocket();
  
    // 🔥 Refresh when backend notifies
    socket.on("teamsUpdated", loadAll);
    socket.on("membersUpdated", loadAll);
    socket.on("tasksUpdated", loadAll);
    socket.on("workspacesUpdated", loadAll); // optional
  
    return () => {
      socket.off("teamsUpdated", loadAll);
      socket.off("membersUpdated", loadAll);
      socket.off("tasksUpdated", loadAll);
      socket.off("workspacesUpdated", loadAll);
    };
  }, []);
  

  return (
    <div className="p-10 space-y-10 bg-gray-200">
      <h1 className="text-4xl text-center font-bold mb-6">Slack Todo Dashboard</h1>

      {/* Summary Cards */}
      <SummaryCards teams={teams} members={members} tasks={tasks} workspaces={workspaces} />

      {/* Teams Section */}
      <Section title="Teams">
        <TeamsTable teams={teams} members={members} openTeam={openTeam} setOpenTeam={setOpenTeam} />
      </Section>

      {/* Members Section */}
      <Section title="Members">
        <Table data={members} />
      </Section>

      {/* Tasks Section */}
      <Section title="Tasks">
  <TaskStatusSummary tasks={tasks} />
  <TasksTable tasks={tasks} members={members} />
</Section>


      {/* Workspaces Section */}
      <Section title="Workspaces">
        <WorkspacesTable workspaces={workspaces} open={openWorkspace} setOpen={setOpenWorkspace} />
      </Section>
    </div>
  );
}

/* ------------------- SUMMARY CARDS -------------------- */

// function SummaryCards({ teams, members, tasks, workspaces }) {
//   const items = [
//     { title: "Teams", value: teams.length },
//     { title: "Members", value: members.length },
//     { title: "Tasks", value: tasks.length },
//     { title: "Workspaces", value: workspaces.length },
//   ];

//   return (
//     <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
//       {items.map((item) => (
//         <div key={item.title} className="p-6 bg-white rounded-xl shadow text-center">
//           <p className="text-gray-600">{item.title}</p>
//           <p className="text-3xl font-bold">{item.value}</p>
//         </div>
//       ))}
//     </div>
//   );
// }

/* ------------------- TEAMS WITH DROPDOWN MEMBERS -------------------- */

function TeamsTable({ teams, openTeam, setOpenTeam }) {
  if (!teams.length) return <p>No teams</p>;

  return (
    <table className="w-full text-sm bg-white shadow rounded-xl overflow-hidden text-center">
      <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
        <tr>
          <th className="border-b p-3">Team</th>
          <th className="border-b p-3">Members</th>
          <th className="border-b p-3">Actions</th>
        </tr>
      </thead>

      <tbody className="[&>tr:nth-child(even)]:bg-gray-50">
        {teams.map((team) => {
          const teamMembers = team.members || [];

          return (
            <>
              <tr key={team.id} className="hover:bg-gray-100 transition">
                <td className="p-3 border-b font-medium">{team.team_name}</td>
                <td className="p-3 border-b">{teamMembers.length}</td>
                <td className="p-3 border-b">
                  <button
                    onClick={() => setOpenTeam(openTeam === team.id ? null : team.id)}
                    className="px-3 py-1 rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 transition"
                  >
                    View Members
                  </button>
                </td>
              </tr>

              {openTeam === team.id && (
                <tr>
                  <td colSpan={3} className="bg-gray-50 p-4 text-left">
                    <h4 className="font-semibold mb-3 text-gray-700">Members</h4>

                    {teamMembers.length === 0 ? (
                      <p>No members in this team.</p>
                    ) : (
                      <table className="min-w-full border text-sm bg-white rounded-lg overflow-hidden text-center shadow">
                        <thead className="bg-gray-200 text-gray-700 uppercase text-xs">
                          <tr>
                            <th className="p-2 border-b text-center">Name</th>
                            <th className="p-2 border-b text-center">Slack ID</th>
                          </tr>
                        </thead>

                        <tbody className="[&>tr:nth-child(even)]:bg-gray-50">
                          {teamMembers.map((m) => (
                            <tr key={m.id} className="hover:bg-gray-100 transition text-center">
                              <td className="p-2 border-b">{m.display_name}</td>
                              <td className="p-2 border-b">{m.slack_user_id}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </td>
                </tr>
              )}
            </>
          );
        })}
      </tbody>
    </table>
  );
}


/* ------------------- GENERIC TABLE -------------------- */

function Table({ data }) {
  if (!data || data.length === 0) return <p>No data</p>;

  return (
    <table className="w-full text-sm bg-white shadow rounded-xl overflow-hidden text-center">
      <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
        <tr>
          {Object.keys(data[0]).map((col) => (
            <th key={col} className="border-b p-3">{col.replace("_", " ")}</th>
          ))}
        </tr>
      </thead>

      <tbody className="[&>tr:nth-child(even)]:bg-gray-50">
        {data.map((row, idx) => (
          <tr key={idx} className="hover:bg-gray-100 transition">
            {Object.values(row).map((val, i) => (
              <td key={i} className="p-3 border-b">
                {typeof val === "object" ? JSON.stringify(val) : val ?? ""}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}


/* ------------------- WORKSPACES -------------------- */

function WorkspacesTable({ workspaces, open, setOpen }) {
  return (
    <div className="space-y-4">
      {workspaces.map((w) => (
        <div key={w.id} className="p-4 bg-white rounded-lg shadow">
          <div className="flex justify-between">
            <div>
              <p className="font-semibold">{w.team_name}</p>
              <p className="text-sm text-gray-500">Bot: {w.bot_user_id}</p>
            </div>

            <button
              onClick={() => setOpen(open === w.id ? null : w.id)}
              className="px-3 py-1 rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 transition"
                  >
              Details
            </button>
          </div>

          {open === w.id && (
            <div className="mt-3 text-sm text-gray-700 space-y-1">
              <p>Team ID: {w.team_id}</p>
              <p>Installed: {new Date(w.installed_at).toLocaleString()}</p>
              <p>Bot Token: *******</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ------------------- SECTION WRAPPER -------------------- */

function Section({ title, children }) {
  return (
    <div className="space-y-3">
      <h2 className="text-2xl font-semibold">{title}</h2>
      {children}
    </div>
  );
}
function TasksTable({ tasks, members }) {
  if (!tasks.length) return <p>No tasks</p>;

  // Map member ID → display name
  const memberMap = Object.fromEntries(
    members.map((m) => [m.id, m.display_name])
  );

  // Clean + format task data
  const cleaned = tasks.map((t) => ({
    id: t.id,
    title: t.title,
    assigned_member: memberMap[t.assigned_member_id] || "Unknown",
    status: t.status,
    created_at: new Date(t.created_at).toLocaleString(),
    completed_at: t.completed_at
      ? new Date(t.completed_at).toLocaleString()
      : "—",
  }));

  return (
    <table className="w-full text-sm bg-white shadow rounded-xl overflow-hidden text-center">
      
      <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
        <tr>
          {Object.keys(cleaned[0]).map((col) => (
            <th 
              key={col} 
              className="border-b p-3 text-center"
            >
              {col.replace("_", " ")}
            </th>
          ))}
        </tr>
      </thead>

      <tbody className="[&>tr:nth-child(even)]:bg-gray-50">
        {cleaned.map((row) => (
          <tr key={row.id} className="hover:bg-gray-100 transition">
            {Object.entries(row).map(([key, val], i) => (
              <td
                key={i}
                className="p-3 border-b text-center"
              >
                {key === "status" ? (
                  <div className="flex justify-center">
                    <StatusBadge status={val} />
                  </div>
                ) : (
                  val
                )}
              </td>
            ))}
          </tr>
        ))}
      </tbody>

    </table>
  );
}

function StatusBadge({ status }) {
  const colors = {
    done: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    failed: "bg-red-100 text-red-700",
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
}
// function TaskStatusSummary({ tasks }) {
//   if (!tasks.length) return null;

//   const total = tasks.length;
//   const completed = tasks.filter(t => t.status === "done").length;
//   const pending = tasks.filter(t => t.status === "pending").length;

//   const items = [
//     { label: "Total Tasks", value: total },
//     { label: "Pending", value: pending },
//     { label: "Completed", value: completed },
//   ];

//   return (
//     <div className="grid grid-cols-3 gap-6 mt-6">
//       {items.map((item) => (
//         <div
//           key={item.label}
//           className="p-6 bg-white rounded-xl shadow text-center"
//         >
//           <p className="text-gray-600 text-sm">{item.label}</p>
//           <p className="text-3xl font-bold mt-1">{item.value}</p>
//         </div>
//       ))}
//     </div>
//   );
// }