import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ArrowRight, Star, X, ShieldCheck } from "lucide-react";
import { getTest, markTaskCompletedOptimistic, rollbackTaskCompletedOptimistic } from "../../app/slices/getTask";
import { submitTask } from "../../app/slices/submit";

export default function TestPage() {
  const navigate = useNavigate();
  const { taskId } = useParams();
  const location = useLocation();
  const dispatch = useDispatch();

  const { pending, tests, testError } = useSelector((state) => state.tasks);
  const { loading: submitting } = useSelector((state) => state.taskSubmit);
  const studentId = useSelector((state) => state.auth.id) || localStorage.getItem("studentID");

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [completed, setCompleted] = useState(0);
  const [result, setResult] = useState(null);
  const [finalScore, setFinalScore] = useState(0);

  useEffect(() => {
    if (taskId) {
      dispatch(getTest({ id: taskId }));
    }
  }, [taskId, dispatch]);

  const questions = tests || [];
  const currentData = questions[currentQuestion];

  const handleSelectOption = (opt) => {
    setSelectedOptionId(opt.id);
  };

  const handleCheckTest = () => {
    if (!currentData) return;

    const correctAnswer = currentData.variants?.find((opt) => opt.isTrue === true);
    const isRight = correctAnswer && correctAnswer.id === selectedOptionId;

    if (isRight) setCompleted((prev) => prev + 1);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setSelectedOptionId(null);
    } else {
      const score = isRight ? completed + 1 : completed;
      setFinalScore(score);
      setResult(score === tests.length ? "success" : "failed");
    }
  };

  const handleContinue = async () => {
    if (!taskId || !studentId) return;
    dispatch(markTaskCompletedOptimistic({ taskId, studentId }));
    try {
      await dispatch(submitTask({ taskId })).unwrap();
      navigate("/dashboard");
    } catch {
      dispatch(rollbackTaskCompletedOptimistic({ taskId, studentId }));
      navigate("/dashboard");
    }
  };

  const handleRetry = () => {
    setResult(null);
    setCurrentQuestion(0);
    setSelectedOptionId(null);
    setCompleted(0);
    dispatch(getTest({ id: taskId }));
  };

  if (pending) {
    return (
      <div className="h-screen bg-[#0B1220] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#6C63FF] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-sm font-medium text-white/60">Загрузка теста...</p>
      </div>
    );
  }

  if (testError || !currentData) {
    return (
      <div className="h-screen bg-[#0B1220] flex flex-col items-center justify-center px-6 text-center">
        <X size={64} color="#E0E0E0" />
        <p className="mt-4 text-lg text-white/70 font-semibold">Тесты не найдены</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-6 px-5 py-3 bg-[#6C63FF] text-white text-sm font-bold rounded-xl hover:bg-[#5a52e0] transition"
        >
          Вернуться назад
        </button>
      </div>
    );
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const percentage = questions.length > 0 ? Math.round((finalScore / questions.length) * 100) : 0;

  if (result === "success") {
    return (
      <div className="h-screen bg-white flex flex-col items-center justify-center px-6 relative overflow-hidden">
        <div className="absolute top-24 left-8 text-[#F0F0F0] text-6xl font-black opacity-40 select-none">{"{ }"}</div>
        <div className="absolute bottom-24 right-8 text-[#F0F0F0] text-6xl font-black opacity-40 select-none">{"</>"}</div>

        <div className="w-36 h-36 rounded-full bg-[#F0FDF4] border-2 border-[#DCFCE7] flex items-center justify-center mb-8">
          <ShieldCheck size={72} color="#22C55E" />
        </div>
        <p className="text-3xl font-black text-[#1A1A1A] tracking-wide">ПОЗДРАВЛЯЕМ!</p>
        <p className="mt-3 text-base text-slate-500 text-center max-w-sm leading-6">
          Вы успешно завершили задание. Весь функционал проверен и работает идеально!
        </p>
        <div className="mt-6 flex items-center gap-2 bg-[#DCFCE7] px-5 py-2.5 rounded-full">
          <ShieldCheck size={18} color="#22C55E" />
          <span className="text-[13px] font-extrabold text-[#15803D] uppercase">Задание успешно выполнено</span>
        </div>

        <button
          onClick={handleContinue}
          disabled={submitting}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[calc(100%-2.5rem)] max-w-md flex items-center justify-center gap-3 bg-[#22C55E] h-16 rounded-2xl text-white font-extrabold text-lg shadow-lg shadow-[#22C55E]/30 hover:bg-[#1fb554] transition disabled:opacity-60"
        >
          {submitting ? (
            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          ) : (
            <>
              ПРОДОЛЖИТЬ <ArrowRight size={20} />
            </>
          )}
        </button>
      </div>
    );
  }

  if (result === "failed") {
    return (
      <div className="h-screen bg-white flex flex-col items-center justify-center px-6 relative">
        <div className="w-32 h-32 rounded-full bg-[#FEF2F2] border-2 border-[#FEE2E2] flex items-center justify-center mb-8">
          <X size={64} color="#EF4444" />
        </div>
        <p className="text-2xl font-black text-[#1A1A1A]">Не совсем...</p>
        <p className="mt-2 text-base text-slate-500">Попробуйте ещё раз, у вас получится!</p>
        <p className="mt-6 text-sm font-bold text-slate-400 uppercase tracking-widest">
          Результат
        </p>
        <p className="mt-1 text-4xl font-black text-[#6C63FF]">
          {finalScore}
          <span className="text-xl text-slate-400"> / {questions.length}</span>
        </p>
        <div className="mt-4 w-52 h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#6C63FF] rounded-full transition-all"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        <p className="mt-2 text-xs font-bold text-slate-400">{percentage}% правильных</p>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[calc(100%-2.5rem)] max-w-md space-y-3">
          <button
            onClick={handleRetry}
            className="w-full flex items-center justify-center gap-3 bg-[#6C63FF] h-14 rounded-2xl text-white font-extrabold text-base shadow-lg shadow-[#6C63FF]/30 hover:bg-[#5a52e0] transition"
          >
            Попробовать снова <ArrowRight size={18} />
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            className="w-full flex items-center justify-center gap-3 bg-[#F1F5F9] h-14 rounded-2xl text-slate-600 font-bold text-base hover:bg-slate-200 transition"
          >
            К заданиям
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#F3F4F6] flex flex-col overflow-hidden">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#0B1220] via-[#111827] to-[#1F2937] px-6 pt-6 pb-4 rounded-b-[1.8rem] shrink-0">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-slate-200 hover:bg-white/20 transition"
          >
            <X size={20} />
          </button>
          <div className="flex items-baseline">
            <span className="text-white text-xl font-extrabold">{currentQuestion + 1}</span>
            <span className="text-white/60 text-sm font-semibold"> / {questions.length}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-[#FBBF24]/15 px-3 py-1.5 rounded-lg">
            <Star size={14} color="#FBBF24" />
            <span className="text-[11px] font-extrabold text-[#FBBF24]">+10 XP</span>
          </div>
        </div>

        <div className="mt-4 h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#6C63FF] rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <div className="mt-4">
          <p className="text-[10px] font-extrabold text-[#93C5FD] tracking-[0.2em]">TEST MODE</p>
          <p className="mt-1 text-white text-xl font-black leading-7 line-clamp-2">
            {currentData.hint || "Тест"}
          </p>
          <p className="mt-1 text-white/55 text-xs font-semibold">
            {currentQuestion + 1} из {questions.length} вопросов
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-5 pt-5 pb-32">
        <div className="bg-white rounded-3xl p-5 border border-[#E5E7EB] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-[0.15em]">
              Question
            </span>
            <span className="text-xs font-bold text-slate-400">
              {currentQuestion + 1}/{questions.length}
            </span>
          </div>

          <p className="text-[16px] text-slate-600 leading-6">{currentData.question}</p>

          <div className="mt-4 space-y-3">
            {currentData.variants &&
              currentData.variants.map((opt, index) => {
                const isSelected = selectedOptionId === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectOption(opt)}
                    className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border-2 transition text-left ${
                      isSelected ? "border-[#6C63FF] bg-[#F8F7FF]" : "border-[#F0F0F0] bg-white hover:border-slate-200"
                    }`}
                  >
                    <span
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-extrabold ${
                        isSelected ? "bg-[#6C63FF] text-white" : "bg-[#F5F5F5] text-slate-500"
                      }`}
                    >
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className={`flex-1 text-[15px] font-semibold ${isSelected ? "text-slate-800" : "text-slate-600"}`}>
                      {opt.name}
                    </span>
                    <span
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        isSelected ? "border-[#6C63FF]" : "border-slate-200"
                      }`}
                    >
                      {isSelected && <span className="w-2.5 h-2.5 rounded-full bg-[#6C63FF]"></span>}
                    </span>
                  </button>
                );
              })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 bg-[#F3F4F6] border-t border-[#E5E7EB] px-5 py-4">
        <button
          onClick={handleCheckTest}
          disabled={!selectedOptionId}
          className={`w-full flex items-center justify-center gap-3 h-14 rounded-2xl font-extrabold text-base transition ${
            selectedOptionId
              ? "bg-[#6C63FF] text-white shadow-lg shadow-[#6C63FF]/30 hover:bg-[#5a52e0]"
              : "bg-[#F5F5F5] text-slate-400"
          }`}
        >
          {currentQuestion === questions.length - 1 ? "ЗАВЕРШИТЬ" : "ПРОДОЛЖИТЬ"}
          <ArrowRight size={20} color={selectedOptionId ? "white" : "#9CA3AF"} />
        </button>
      </div>
    </div>
  );
}
