import React, { useEffect, useCallback, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Atom,
  Braces,
  Code2,
  Database,
  FileCode2,
  GitBranch,
  Palette,
  Server,
  Rocket,
  Lock,
  Check,
  Crown,
} from "lucide-react";
import { getTasks } from "../../app/slices/getTask";

const getTech = (topic) => {
  const t = (topic || "").toLowerCase();
  if (t.includes("react")) return { icon: Atom, color: "#00D8FF", bg: "#E0F7FA" };
  if (t.includes("js") || t.includes("javascript"))
    return { icon: Braces, color: "#F7DF1E", bg: "#FFFDE7" };
  if (t.includes("node")) return { icon: Server, color: "#339933", bg: "#E8F5E9" };
  if (t.includes("python")) return { icon: Code2, color: "#3776AB", bg: "#E3F2FD" };
  if (t.includes("html")) return { icon: FileCode2, color: "#E34F26", bg: "#FBE9E7" };
  if (t.includes("css")) return { icon: Palette, color: "#1572B6", bg: "#E1F5FE" };
  if (t.includes("database") || t.includes("sql"))
    return { icon: Database, color: "#00758F", bg: "#E0F2F1" };
  if (t.includes("git")) return { icon: GitBranch, color: "#F05032", bg: "#FBE9E7" };
  return { icon: Code2, color: "#6C5CE7", bg: "#F3F0FF" };
};

const normalizeLearnItem = (item) => ({
  ...item,
  learn: item?.steps ?? item?.learn ?? [],
  steps: item?.steps ?? item?.learn ?? [],
});

const isLearnCompletedByStudent = (completed, studentId) => {
  if (!Array.isArray(completed) || !studentId) return false;
  return completed.some((student) => {
    if (typeof student === "string") return student === studentId;
    return student?.id === studentId;
  });
};

export default function Learn() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { tasks, loading, loaded } = useSelector((state) => state.tasks);
  const { id } = useSelector((state) => state.auth);
  const studentId = useMemo(
    () => id || localStorage.getItem("studentID") || null,
    [id],
  );

  const loadTasks = useCallback(() => dispatch(getTasks()), [dispatch]);
  const didAutoLoad = useRef(false);

  useEffect(() => {
    if (didAutoLoad.current) return;
    if (loaded || loading) return;
    didAutoLoad.current = true;
    loadTasks();
  }, [loaded, loading, loadTasks]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[#00A8A8] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-bold text-slate-500">Загрузка модулей...</p>
        </div>
      </div>
    );
  }

  const pathData = tasks ? [...tasks].reverse() : [];
  const normalizedPathData = pathData.map(normalizeLearnItem);
  const totalTasks = normalizedPathData.length;

  let lastCompletedIndex = -1;
  for (let idx = 0; idx < normalizedPathData.length; idx++) {
    if (isLearnCompletedByStudent(normalizedPathData[idx].completed, studentId)) {
      lastCompletedIndex = idx;
    }
  }

  const completedCount = lastCompletedIndex + 1;

  return (
    <div className="max-w-4xl mx-auto pb-16">
      {/* Hero */}
      <div className="mt-8 flex flex-col items-center text-center">
        <div className="w-20 h-20 rounded-[1.4rem] bg-[#EBF3FC] flex items-center justify-center shadow-lg shadow-[#2563eb]/20">
          <Rocket size={36} color="#4A90E2" />
        </div>
        <h2 className="mt-4 text-2xl font-black text-slate-900">Путь разработчика</h2>
        <p className="mt-1 text-sm font-bold text-[#4A90E2] tracking-[0.3em]">2026</p>

        <div className="mt-5 flex items-center bg-white rounded-2xl shadow-sm px-8 py-4 gap-8">
          <div className="text-center">
            <p className="text-xl font-black text-[#4A90E2]">{totalTasks}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Модулей</p>
          </div>
          <div className="w-px h-9 bg-slate-200"></div>
          <div className="text-center">
            <p className="text-xl font-black text-[#00C853]">{completedCount}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Завершено</p>
          </div>
          <div className="w-px h-9 bg-slate-200"></div>
          <div className="text-center">
            <p className="text-xl font-black text-[#FF6B6B]">{totalTasks - completedCount}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Осталось</p>
          </div>
        </div>
      </div>

      {/* Path nodes */}
      <div className="mt-10 space-y-7">
        {normalizedPathData.map((item, index) => {
          const tech = getTech(item.topic);
          const IconComp = tech.icon;
          const isCompleted = isLearnCompletedByStudent(item.completed, studentId);
          const isUnlocked =
            lastCompletedIndex === -1 ? index === 0 : index <= lastCompletedIndex + 1;
          const isCurrent = isUnlocked && !isCompleted;
          const isEven = index % 2 === 0;

          return (
            <div key={item.id} className="relative">
              <div
                className={`w-[82%] ${isEven ? "ml-0" : "ml-auto"}`}
              >
                <button
                  onClick={() => {
                    if (isUnlocked && !isCompleted) {
                      navigate(`/learn/${item.id}`, {
                        state: { item, pathData: normalizedPathData, index },
                      });
                    }
                  }}
                  className={`w-full text-left rounded-3xl p-5 border-2 transition-all relative overflow-hidden ${
                    !isUnlocked
                      ? "bg-[#F8FAFC] border-[#E9ECF0] opacity-70 cursor-default"
                      : isCompleted
                        ? "bg-[#FAFFF9] border-[#00C853]/30"
                        : isCurrent
                          ? "bg-[#FAFCFF] border-[#4A90E2]/40 shadow-lg shadow-[#2563eb]/10"
                          : "bg-white border-[#F1F5F9]"
                  }`}
                >
                  <div className="flex items-center">
                    <div className="relative shrink-0">
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center"
                        style={{ backgroundColor: isUnlocked ? tech.bg : "#F1F5F9" }}
                      >
                        <IconComp size={30} color={isUnlocked ? tech.color : "#94A3B8"} />
                      </div>
                      <div
                        className={`absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center border-2 border-white ${
                          isCompleted ? "bg-[#00C853]" : isUnlocked ? "bg-[#4A90E2]" : "bg-[#F1F5F9]"
                        }`}
                      >
                        {isCompleted ? (
                          <Check size={11} color="white" />
                        ) : !isUnlocked ? (
                          <Lock size={9} color="#94A3B8" />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-[#4A90E2]"></div>
                        )}
                      </div>
                    </div>

                    <div className="flex-1 ml-4 min-w-0">
                      <p
                        className="text-[10px] font-black tracking-[0.15em] uppercase"
                        style={{
                          color: isCompleted
                            ? "#00C853"
                            : isUnlocked
                              ? "#4A90E2"
                              : "#94A3B8",
                        }}
                      >
                        {isCompleted ? "ЗАВЕРШЕНО" : item.topic || "CORE"}
                      </p>
                      <h3
                        className={`mt-1 text-[15px] font-bold leading-5 truncate ${
                          isUnlocked ? "text-slate-900" : "text-slate-400"
                        }`}
                      >
                        {item.title}
                      </h3>
                      <div className="mt-2 flex items-center gap-2">
                        <span
                          className="px-2.5 py-1 rounded-lg text-[9px] font-extrabold uppercase tracking-wider"
                          style={{
                            backgroundColor: isCompleted
                              ? "rgba(0,200,83,0.1)"
                              : isUnlocked
                                ? "rgba(74,144,226,0.1)"
                                : "rgba(148,163,184,0.1)",
                            color: isCompleted ? "#00C853" : isUnlocked ? "#4A90E2" : "#94A3B8",
                          }}
                        >
                          {item.level}
                        </span>
                        {isCurrent && (
                          <span className="px-2 py-1 rounded-md bg-[#4A90E2]/10 text-[9px] font-extrabold text-[#4A90E2] tracking-wider">
                            ТЕКУЩИЙ
                          </span>
                        )}
                      </div>
                    </div>

                    <div
                      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ml-3 text-xs font-extrabold shrink-0 ${
                        isCompleted
                          ? "bg-[#00C853]/10 border-[#00C853]/30 text-[#00C853]"
                          : isCurrent
                            ? "bg-[#4A90E2]/10 border-[#4A90E2]/30 text-[#4A90E2]"
                            : "bg-[#F1F5F9] border-[#E9ECF0] text-[#94A3B8]"
                      }`}
                    >
                      {totalTasks - index}
                    </div>
                  </div>
                </button>
              </div>

              {/* Connector */}
              {index !== normalizedPathData.length - 1 && (
                <div className="absolute left-1/2 top-full -translate-x-1/2 w-0.5 h-7 flex flex-col items-center">
                  <div
                    className={`w-2 h-2 rounded-full ${index <= lastCompletedIndex ? "bg-[#00C853]" : "bg-slate-300"}`}
                  ></div>
                  <div
                    className={`w-0.5 flex-1 ${index <= lastCompletedIndex ? "bg-[#00C853]/30" : "bg-slate-300/40"}`}
                  ></div>
                  <div
                    className={`w-2 h-2 rounded-full ${index + 1 <= lastCompletedIndex ? "bg-[#00C853]" : "bg-slate-300"}`}
                  ></div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Finish node */}
      <div className="mt-8 flex flex-col items-center pb-6">
        <div className="w-px h-12 bg-slate-200"></div>
        <div className="w-20 h-20 rounded-[1.4rem] bg-[#FFFDE7] flex items-center justify-center shadow-lg shadow-amber-200/40">
          <Crown size={40} color="#FFD700" />
        </div>
        <p className="mt-3 text-lg font-black text-slate-900 tracking-[0.15em]">SENIOR DEVELOPER</p>
        <p className="mt-1 text-xs font-semibold text-slate-400">Финальная цель</p>
      </div>
    </div>
  );
}
