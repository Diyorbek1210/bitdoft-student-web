import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  RefreshCw,
  AlertCircle,
  Code2,
  ChevronRight,
  History,
  Calendar,
  Image as ImageIcon,
  XCircle,
  Trash2,
} from "lucide-react";

import { fetchHomeworks } from "../../app/slices/homework";
import { getSubmissions } from "../../app/slices/submitHomework";
import { getStudent } from "../../app/slices/auth";

export default function Homeworks() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    loading: hwLoading,
    uncompletedHomeworks = [],
    error: hwError,
    loaded: hwLoaded,
  } = useSelector((state) => state.homework);

  const {
    submissions = [],
    loading: subLoading,
    error: subError,
    loaded: subLoaded,
  } = useSelector((state) => state.homeworkSubmit || state.submit);

  const globalError = hwError || subError;

  const { id: authId, loading: authLoading } = useSelector((state) => state.auth);
  const [hiddenSubmissionIds, setHiddenSubmissionIds] = useState([]);
  const didAutoLoadStudent = useRef(false);
  const didAutoLoadHomeworks = useRef(false);

  useEffect(() => {
    if (didAutoLoadStudent.current) return;
    if (authId || authLoading) return;
    didAutoLoadStudent.current = true;
    dispatch(getStudent());
  }, [authId, authLoading, dispatch]);

  useEffect(() => {
    if (!authId) return;
    if (didAutoLoadHomeworks.current) return;
    if (hwLoading || subLoading) return;
    didAutoLoadHomeworks.current = true;
    if (!hwLoaded) {
      dispatch(fetchHomeworks());
    }
    if (!subLoaded) {
      dispatch(getSubmissions());
    }
  }, [authId, hwLoading, subLoading, hwLoaded, subLoaded, dispatch]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("hiddenHomeworkSubmissions");
      if (stored) {
        setHiddenSubmissionIds(JSON.parse(stored));
      }
    } catch (err) {
      console.warn("Failed to read hidden submissions from localStorage", err);
    }
  }, []);

  const hideSubmission = (submission) => {
    const id = submission.submissionId || submission.id;
    if (!id) return;

    const nextHiddenIds = [...new Set([...hiddenSubmissionIds, id])];
    setHiddenSubmissionIds(nextHiddenIds);
    localStorage.setItem(
      "hiddenHomeworkSubmissions",
      JSON.stringify(nextHiddenIds),
    );
  };

  const visibleSubmissions = submissions.filter((sub) => {
    const id = sub.submissionId || sub.id;
    return !hiddenSubmissionIds.includes(id);
  });

  const handleRefresh = () => {
    dispatch(fetchHomeworks());
    dispatch(getSubmissions());
  };

  return (
    <div className="p-8 max-w-7xl mx-auto bg-[#F8FAFC] min-h-screen font-sans">
      {/* Заголовок */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Панель управления
          </h1>
          <p className="text-slate-500 font-medium">
            Отслеживайте свой академический прогресс
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={hwLoading || subLoading}
          className="flex items-center justify-center space-x-2 bg-white border border-slate-200 hover:border-[#2563eb] hover:text-[#2563eb] text-slate-600 px-6 py-3 rounded-2xl transition-all shadow-sm disabled:opacity-50 font-bold text-sm"
        >
          <RefreshCw
            size={18}
            className={`${hwLoading || subLoading ? "animate-spin" : ""}`}
          />
          <span>Обновить данные</span>
        </button>
      </div>

      {globalError && (
        <div className="mb-6 flex items-center space-x-3 bg-red-50 border border-red-100 p-4 rounded-2xl text-red-600">
          <AlertCircle size={20} />
          <p className="font-bold text-sm uppercase tracking-wider">
            Ошибка: {globalError}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ЛЕВАЯ КОЛОНКА: Текущие задания */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] flex items-center">
              <Clock className="mr-2 text-amber-500" size={18} />
              Актуальные задания
            </h2>
            <span className="bg-amber-100 text-amber-700 text-[10px] font-black px-3 py-1 rounded-full">
              {uncompletedHomeworks.length} ЗАДАНИЙ
            </span>
          </div>

          <div className="grid gap-4">
            {hwLoading ? (
              [1, 2].map((i) => (
                <div
                  key={i}
                  className="h-44 bg-slate-200 animate-pulse rounded-3xl"
                ></div>
              ))
            ) : uncompletedHomeworks.length > 0 ? (
              uncompletedHomeworks.map((hw) => (
                <div
                  key={hw.id}
                  className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200 hover:shadow-xl hover:shadow-[#2563eb]/10 hover:-translate-y-1 transition-all group relative overflow-hidden"
                >
                  <div className="flex flex-col md:flex-row gap-5 justify-between items-start relative z-10 mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[#2563eb] bg-[#EFF6FF] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-[#BFDBFE]">
                          +{hw.score || 0} баллов
                        </span>
                      </div>
                      <h3 className="font-black text-xl text-slate-800 mb-2 group-hover:text-[#2563eb] transition-colors break-words">
                        {hw.question}
                      </h3>
                    </div>

                    {/* Rasm va uning ustiga bosganda yangi oynada ochilishi */}
                    {hw.imageUrl ? (
                      <a
                        href={hw.imageUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full md:w-32 h-24 rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 shrink-0 group-hover:border-[#BFDBFE] transition-colors block cursor-zoom-in"
                        title="Открыть изображение в новой вкладке"
                      >
                        <img
                          src={hw.imageUrl}
                          alt={hw.question}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                              "https://placehold.co/150?text=No+Image";
                          }}
                        />
                      </a>
                    ) : (
                      <div className="w-full md:w-32 h-24 rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300 shrink-0 bg-slate-50/50">
                        <ImageIcon size={20} className="mb-1" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">
                          Без фото
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Calendar size={14} /> Дедлайн:{" "}
                      {hw.deadline
                        ? new Date(hw.deadline).toLocaleDateString()
                        : "Нет дедлайна"}
                    </div>
                    <button
                      onClick={() =>
                        navigate("/submit-homework", {
                          state: { homework: hw },
                        })
                      }
                      className="flex items-center gap-2 bg-[#0B3C5D] text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-[#2563eb] transition-colors shadow-lg shadow-[#0b3c5d]/20"
                    >
                      Приступить <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white border-2 border-dashed border-slate-200 rounded-[3rem] p-16 text-center">
                <div className="bg-emerald-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-500 shadow-inner">
                  <CheckCircle2 size={36} />
                </div>
                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                  Всё выполнено!
                </h3>
                <p className="text-slate-400 text-sm mt-2">
                  На данный момент новых заданий нет.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ПРАВАЯ КОЛОНКА: История отправок */}
        <div className="lg:col-span-5 space-y-6">
          <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] flex items-center px-2">
            <History className="mr-2 text-[#2563eb]" size={18} />
            История решений
          </h2>

          <div className="space-y-4">
            {subLoading ? (
              [1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-20 bg-slate-100 animate-pulse rounded-2xl"
                ></div>
              ))
            ) : visibleSubmissions.length > 0 ? (
              visibleSubmissions.map((sub) => (
                <div
                  key={sub.submissionId || sub.id}
                  className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4 hover:border-[#BFDBFE] transition-all group"
                >
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${sub.accepted
                      ? "bg-emerald-50 text-emerald-500 border border-emerald-100"
                      : sub.rejected
                        ? "bg-red-50 text-red-500 border border-red-100"
                        : "bg-amber-50 text-amber-500 border border-amber-100"
                      }`}
                  >
                    {sub.accepted ? (
                      <CheckCircle2 size={24} />
                    ) : sub.rejected ? (
                      <XCircle size={24} />
                    ) : (
                      <Clock size={24} className="animate-pulse" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <h4 className="text-sm font-bold text-slate-800 truncate tracking-tight">
                        {sub.whichHom?.title || sub.question || "Без названия"}
                      </h4>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold ${sub.accepted
                          ? "bg-emerald-50 text-emerald-700"
                          : sub.rejected
                            ? "bg-red-50 text-red-700"
                            : "bg-amber-50 text-amber-700"
                          }`}
                      >
                        {sub.accepted
                          ? "Принято"
                          : sub.rejected
                            ? "Не принято"
                            : "На проверке"}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center justify-between gap-3">
                      <span className="flex items-center gap-1 text-[11px] text-slate-500">
                        <Code2 size={12} /> {sub.usedTime || 0} мин
                      </span>
                      {sub.rejected && sub.rejectionReason && (
                        <span className="text-[11px] text-red-500 font-medium">
                          Причина: {sub.rejectionReason}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => hideSubmission(sub)}
                    className="shrink-0 inline-flex items-center justify-center text-slate-500 hover:text-slate-800 border border-slate-200 hover:border-slate-300 rounded-full p-2 transition"
                    aria-label="Скрыть запись истории"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            ) : (
              <div className="p-10 text-center bg-slate-50 border border-dashed border-slate-200 rounded-3xl">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest italic">
                  История пуста
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
