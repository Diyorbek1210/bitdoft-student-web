import React, { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  FileCode2,
  Rocket,
  Footprints,
} from "lucide-react";

export default function LearnTask() {
  const navigate = useNavigate();
  const location = useLocation();
  const { taskId } = useParams();
  const { tasks } = useSelector((state) => state.tasks);

  const stateItem = location?.state?.item;
  const pathData = location?.state?.pathData || [];
  const startIndex = location?.state?.index ?? 0;

  const fromStore = tasks.find((t) => String(t.id) === String(taskId));
  const item = stateItem || fromStore;

  const steps = item?.steps ?? item?.learn ?? [];
  const hasValidData = Array.isArray(steps) && steps.length > 0;
  const totalSteps = hasValidData ? steps.length : 0;

  const [currentIndex, setCurrentIndex] = useState(startIndex > 0 ? 0 : 0);
  const [currentStep, setCurrentStep] = useState(0);

  const step = steps[currentStep];

  if (!hasValidData) {
    return (
      <div className="h-screen bg-[#0A0E14] flex flex-col items-center justify-center px-6 text-center">
        <p className="text-2xl font-extrabold text-white">Dars topilmadi</p>
        <p className="mt-3 text-sm text-white/65 max-w-sm">
          Bu kurs uchun bosqichlar yuborilmagan yoki ma'lumot formati noto'g'ri.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="mt-6 px-5 py-3 bg-[#4A90E2] text-white text-sm font-bold rounded-xl hover:bg-[#3b82d6] transition"
        >
          Orqaga qaytish
        </button>
      </div>
    );
  }

  const isLastStep = currentStep === totalSteps - 1;

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const goToTest = () => {
    navigate(`/learn/${item.id}/test`, {
      state: {
        taskId: item.id,
        nextItem: pathData[startIndex + 1] || null,
        pathData,
        nextIndex: startIndex + 1,
      },
    });
  };

  return (
    <div className="h-screen bg-[#0A0E14] flex flex-col relative overflow-hidden">
      {/* Top header */}
      <div className="relative z-20 bg-[#0A0E14]/85 backdrop-blur px-5 pt-6 pb-4">
        <div className="flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition"
          >
            <ChevronLeft size={26} />
          </button>
          <div className="flex-1 ml-4 min-w-0">
            <h1 className="text-white font-extrabold text-[17px] truncate">{item.title}</h1>
            <p className="text-white/50 text-xs mt-0.5 truncate">{item.desc}</p>
          </div>
        </div>

        <div className="mt-4 h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#4A90E2] rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Step body */}
      <div className="flex-1 overflow-y-auto pb-40">
        {step?.imageUrl ? (
          <div className="h-[45vh] bg-black flex items-center justify-center">
            <img
              src={step.imageUrl}
              alt=""
              className="max-h-full max-w-full object-contain"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          </div>
        ) : (
          <div className="h-[45vh] flex flex-col items-center justify-center mx-6 mt-6 rounded-3xl bg-[#F8FAFC] border border-[#E2E8F0] px-6 text-center">
            <FileCode2 size={48} color="#94A3B8" />
            <p className="mt-4 text-lg font-extrabold text-slate-900">Vizual mavjud emas</p>
            <p className="mt-2 text-sm text-slate-500">Bu bosqichda faqat matn yoki kod bor.</p>
          </div>
        )}

        {/* Step info */}
        <div className="mx-5 mt-6 bg-white rounded-[1.8rem] px-6 pt-5 pb-6">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 bg-[#4A90E2]/10 px-3 py-1.5 rounded-lg">
              <Footprints size={14} color="#4A90E2" />
              <span className="text-xs font-extrabold text-[#4A90E2]">Шаг {currentStep + 1}</span>
            </span>
            <span className="text-sm font-bold text-slate-400">
              {currentStep + 1}/{totalSteps}
            </span>
          </div>
          <p className="mt-4 text-[16px] text-slate-700 leading-7 whitespace-pre-wrap">
            {step?.desc}
          </p>
        </div>
      </div>

      {/* Bottom actions */}
      <div className="absolute bottom-0 left-0 right-0 z-30 bg-white border-t border-[#F1F5F9] px-6 py-4 flex items-center justify-between">
        {currentStep > 0 ? (
          <button
            onClick={handleBack}
            className="w-[52px] h-[52px] rounded-full bg-[#F1F5F9] border border-[#E2E8F0] flex items-center justify-center text-[#4A90E2] hover:bg-slate-200 transition"
          >
            <ArrowLeft size={22} />
          </button>
        ) : (
          <div className="w-[52px]"></div>
        )}

        {!isLastStep ? (
          <button
            onClick={handleNext}
            className="flex items-center gap-2 bg-[#4A90E2] px-7 py-3.5 rounded-full text-white font-extrabold text-sm shadow-lg shadow-[#4A90E2]/30 hover:bg-[#3b82d6] transition"
          >
            Далее <ArrowRight size={20} />
          </button>
        ) : (
          <button
            onClick={goToTest}
            className="flex items-center gap-2 bg-[#00C853] px-7 py-3.5 rounded-full text-white font-extrabold text-sm shadow-lg shadow-[#00C853]/30 hover:bg-[#00b34a] transition"
          >
            Тест <Rocket size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
