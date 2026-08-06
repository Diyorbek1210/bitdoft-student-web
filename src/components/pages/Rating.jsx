import React, { useEffect, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllStudent } from "../../app/slices/profile";
import {
  Trophy,
  Medal,
  Crown,
  TrendingUp,
  User,
  Loader2,
  ArrowUpRight,
} from "lucide-react";

export default function Rating() {
  const dispatch = useDispatch();
  const { students, loading, loaded } = useSelector((state) => state.profile);
  const didAutoLoad = useRef(false);

  useEffect(() => {
    if (didAutoLoad.current) return;
    if (loaded || loading) return;
    didAutoLoad.current = true;
    dispatch(getAllStudent());
  }, [loaded, loading, dispatch]);

  const sortedStudents = useMemo(() => {
    return [...(students || [])].sort(
      (a, b) => (b.rating || 0) - (a.rating || 0),
    );
  }, [students]);

  const topThree = sortedStudents.slice(0, 3);
  const remainingStudents = sortedStudents.slice(3);

  if (loading && (!students || students.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400">
        <Loader2 className="animate-spin mb-4 text-[#00A8A8]" size={40} />
        <span className="text-xs font-black uppercase tracking-widest text-slate-500">
          Загрузка рейтинга...
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      <div className="bg-[#0B3C5D] pt-12 pb-24 px-6 rounded-b-[3rem] shadow-2xl shadow-[#0b3c5d]/20 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-5%] w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 bg-[#00A8A8] rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-sm font-black text-[#7FD1D1] uppercase tracking-[0.4em] mb-2">
              Таблица лидеров
            </h2>
            <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic flex items-center justify-center gap-3">
              <Trophy className="text-yellow-400" size={32} /> Leaderboard
            </h1>
          </div>

          <div className="flex items-end justify-center gap-4 sm:gap-10 mt-8">
            {topThree[1] && (
              <TopStudentCard
                student={topThree[1]}
                rank={2}
                color="border-slate-300"
                badge="bg-slate-300"
                height="h-32 sm:h-40"
              />
            )}

            {topThree[0] && (
              <div className="relative group">
                <Crown
                  className="absolute -top-10 left-1/2 -translate-x-1/2 text-yellow-400 animate-bounce"
                  size={40}
                />
                <TopStudentCard
                  student={topThree[0]}
                  rank={1}
                  color="border-yellow-400"
                  badge="bg-yellow-400 shadow-lg shadow-yellow-400/50"
                  height="h-44 sm:h-56"
                  isMain={true}
                />
              </div>
            )}

            {/* 3-o'rin */}
            {topThree[2] && (
              <TopStudentCard
                student={topThree[2]}
                rank={3}
                color="border-orange-400"
                badge="bg-orange-400"
                height="h-28 sm:h-32"
              />
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto -mt-12 px-6">
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-white sticky top-0 z-10">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Список всех студентов
            </span>
            <TrendingUp size={18} className="text-[#00A8A8]" />
          </div>

          <div className="divide-y divide-slate-50">
            {remainingStudents.map((student, index) => (
              <div
                key={student.id}
                className="flex items-center gap-4 p-5 hover:bg-slate-50 transition-colors group"
              >
                <div className="w-8 text-center text-xs font-black text-slate-300 group-hover:text-[#00A8A8] transition-colors">
                  {index + 4}
                </div>

                <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                  <img
                    src={
                      student.profileImageUrl ||
                      "https://ui-avatars.com/api/?name=" + student.name
                    }
                    alt={student.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-slate-800 truncate uppercase tracking-tight">
                    {student.name}
                  </h4>
                </div>

                <div className="text-right shrink-0">
                  <div className="flex items-center gap-1 justify-end">
                    <span className="text-lg font-black text-[#00A8A8]">
                      {student.rating || 0}
                    </span>
                    <ArrowUpRight size={14} className="text-emerald-500" />
                  </div>
                  <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
                    баллов
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TopStudentCard({
  student,
  rank,
  color,
  badge,
  height,
  isMain = false,
}) {
  return (
    <div
      className={`flex flex-col items-center transition-all duration-500 hover:-translate-y-2`}
    >
      <div className={`relative mb-4`}>
        <div
          className={`rounded-full p-1 border-4 ${color} ${isMain ? "w-24 h-24 sm:w-32 sm:h-32" : "w-16 h-16 sm:w-24 sm:h-24"} overflow-hidden bg-white/10 backdrop-blur-md`}
        >
          <img
            src={
              student?.profileImageUrl ||
              "https://ui-avatars.com/api/?name=" + student?.name
            }
            alt={student?.name}
            className="w-full h-full object-cover rounded-full"
          />
        </div>
        <div
          className={`absolute -bottom-2 left-1/2 -translate-x-1/2 ${badge} text-white w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-black border-4 border-[#0B3C5D]`}
        >
          {rank}
        </div>
      </div>
      <div className="text-center max-w-[100px] sm:max-w-[150px]">
        <p className="text-white text-[10px] sm:text-xs font-black truncate uppercase mb-1">
          {student?.name || "Student"}
        </p>
        <div
          className={`inline-block px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-[9px] sm:text-[11px] font-black uppercase tracking-tighter`}
        >
          {student?.rating || 0} b
        </div>
      </div>
    </div>
  );
}
