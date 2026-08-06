import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import {
  SandpackProvider,
  SandpackCodeEditor,
  SandpackPreview,
  SandpackLayout,
  SandpackConsole,
  useSandpack,
} from "@codesandbox/sandpack-react";
import {
  submitHomeworkAction,
  resetSubmitState,
} from "../../app/slices/submitHomework";

const SubmitButton = ({ onFinalSubmit, loading, disabled }) => {
  const { sandpack } = useSandpack();

  const handleInnerClick = () => {
    const latestCode = sandpack.files["/index.html"].code;
    onFinalSubmit(latestCode);
  };

  return (
    <button
      type="button"
      onClick={handleInnerClick}
      disabled={loading || disabled}
      className="bg-emerald-600 text-white px-6 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-900/20"
    >
      {loading ? "Отправка..." : "Отправить работу"}
    </button>
  );
};

export default function SubmitHomework() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const homework = location?.state?.homework;

  const { loading, submited, error } = useSelector((state) => state.submit);
  const { id } = useSelector((state) => state.auth);

  const [desc, setDesc] = useState("");
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [seconds, setSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  const locked = seconds === 0;

  const initialCode = `<!DOCTYPE html>\n<html>\n<head>\n  <style>\n    body { background: #0f172a; color: white; font-family: sans-serif; display: grid; place-content: center; height: 100vh; margin: 0; }\n    h1 { color: #10b981; }\n  </style>\n</head>\n<body>\n  <h1>System Online</h1>\n  <script>\n    console.log("Terminal ready...");\n  </script>\n</body>\n</html>`;

  useEffect(() => {
    if (submited) {
      alert("Работа успешно отправлена!");
      dispatch(resetSubmitState());
      // Dashboard'ning "Homeworks" tabiga qaytish (News'ga emas)
      navigate("/dashboard", { state: { tab: "Homeworks" } });
    }
  }, [submited, dispatch, navigate]);

  // Sahifadan chiqilganda submit holatini (xatoni ham) tozalash
  useEffect(() => {
    return () => {
      dispatch(resetSubmitState());
    };
  }, [dispatch]);

  useEffect(() => {
    let interval = null;
    if (timerActive) {
      interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timerActive]);

  // Rasm preview URL'ni tozalash (Memory leak oldini olish uchun)
  useEffect(() => {
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);

  const handleImageSelect = (file) => {
    if (!file) return;
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
    }
    setImage(file);
    setImageUrl(URL.createObjectURL(file));
  };

  const handleFinalSubmit = (latestCode) => {
    console.log("ПРОВЕРКА:", {
      homeworkId: homework?.id,
      studentId: id,
      seconds: seconds,
      desc: desc,
    });

    if (!desc.trim()) {
      alert("Пожалуйста, напишите описание работы");
      return;
    }

    const finalUsedTime = seconds > 0 ? seconds : 1;

    if (!homework?.id) {
      alert(
        "Ошибка: ID домашнего задания не найден! Проверьте данные.",
      );
      return;
    }
    if (!id) {
      alert("Ошибка: ID ученика не найден! Войдите в систему заново.");
      return;
    }

    const formData = new FormData();

    formData.append("homeworkId", String(homework.id));
    formData.append("studentId", String(id));
    formData.append("usedTime", String(finalUsedTime));
    formData.append("desc", desc.trim());

    const normalizedCode = (code) => (code || "").replace(/\s+/g, "");
    const isCodeChanged = normalizedCode(latestCode) !== normalizedCode(initialCode);
    if (isCodeChanged) {
      formData.append("code", latestCode || "");
    }

    if (image) {
      formData.append("image", image); // Backend'dagi upload.single("image") bilan bir xil
    }

    // FormData ichini to'liq tekshirish (Brauzer konsolida ko'rinadi)
    console.log("ОТПРАВЛЯЕМЫЙ FORMDATA:");
    for (let pair of formData.entries()) {
      console.log(`${pair[0]}:`, pair[1]);
    }

    dispatch(submitHomeworkAction(formData));
  };

  if (!homework) return null;

  return (
    <div className="h-screen flex flex-col bg-[#F3F4F6] text-slate-900 transition-colors duration-300">
      <SandpackProvider
        template="static"
        files={{ "/index.html": initialCode }}
        theme="dark"
        options={{ recompileMode: "immediate" }}
      >
        <nav className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-6 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-slate-100 rounded-full transition"
            >
              <svg
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                Проект
              </span>
              <span className="text-xs font-bold">{homework.title}</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="font-mono text-sm font-bold px-4 py-2 rounded-xl border bg-slate-100 border-slate-200 text-emerald-600">
                {new Date(seconds * 1000).toISOString().substr(11, 8)}
              </div>
            </div>

            <SubmitButton
              onFinalSubmit={handleFinalSubmit}
              loading={loading}
              disabled={locked}
            />
          </div>
        </nav>

        {error && (
          <div className="bg-red-50 border-b border-red-200 px-6 py-3 flex items-center gap-3 text-red-600">
            <svg
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
              className="shrink-0"
            >
              <path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs font-bold uppercase tracking-wider">
              Ошибка отправки: {typeof error === "string" ? error : "Попробуйте ещё раз"}
            </p>
          </div>
        )}

        <div className="flex flex-1 overflow-hidden">
          {/* Enhanced Sidebar */}
          <aside className="w-80 border-r border-slate-200 p-6 flex flex-col gap-8 overflow-y-auto bg-white">
            <section>
              <label className="text-[10px] font-black uppercase text-slate-400 mb-3 block tracking-widest">
                Сессия
              </label>
              <button
                type="button"
                onClick={() => setTimerActive(!timerActive)}
                className={`w-full py-3 rounded-xl text-xs font-bold transition-all border ${
                  timerActive
                    ? "bg-red-50 border-red-200 text-red-600"
                    : "bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100"
                }`}
              >
                {timerActive ? "ПАУЗА" : "НАЧАТЬ"}
              </button>
              {locked && (
                <p className="text-[10px] text-slate-400 mt-2 text-center">
                  Нажмите «НАЧАТЬ», чтобы разблокировать работу
                </p>
              )}
            </section>

            <section className="flex-1">
              <label className="text-[10px] font-black uppercase text-slate-400 mb-3 block tracking-widest">
                Заметки
              </label>
              <textarea
                className="w-full h-48 p-4 rounded-2xl text-xs outline-none border bg-slate-50 border-slate-200 focus:border-emerald-500/50 resize-none font-sans text-slate-900 disabled:bg-slate-100 disabled:opacity-60 disabled:cursor-not-allowed"
                placeholder="Кратко опишите ваше решение..."
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                disabled={locked}
              />
            </section>

            <section>
              <label className="text-[10px] font-black uppercase text-slate-400 mb-3 block tracking-widest">
                Скриншот
              </label>
              <div className={`relative border-2 border-dashed rounded-2xl h-44 flex flex-col items-center justify-center transition-all overflow-hidden border-slate-200 bg-slate-50 ${
                locked
                  ? "opacity-60 cursor-not-allowed"
                  : "cursor-pointer group hover:border-emerald-500/50"
              }`}>
                {image ? (
                  <img
                    src={imageUrl}
                    className="w-full h-full object-cover"
                    alt="upload"
                  />
                ) : (
                  <div className="text-center flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mb-1">
                      <svg
                        width="20"
                        height="20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400">
                      ЗАГРУЗИТЬ СКРИНШОТ
                    </p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  onChange={(e) => handleImageSelect(e.target.files[0])}
                  disabled={locked}
                />
              </div>
            </section>
          </aside>

          <main className="flex-1 flex flex-col bg-[#F3F4F6]">
            <SandpackLayout
              style={{ height: "100%", border: "none", borderRadius: 0 }}
            >
              <SandpackCodeEditor
                showLineNumbers
                readOnly={locked}
                style={{ height: "100%", flex: 1.3, fontSize: "13px" }}
              />
              <div className="flex flex-col flex-1 border-l border-slate-200">
                <div className="h-3/5 bg-white relative">
                  <SandpackPreview
                    showNavigator={false}
                    showOpenInCodeSandbox={false}
                    style={{ height: "100%" }}
                  />
                </div>
                <div className="h-2/5 border-t border-slate-200 bg-white">
                  <div className="flex items-center gap-2 p-3 border-b border-slate-200">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                      Консоль
                    </span>
                  </div>
                  <SandpackConsole
                    variant="light"
                    style={{ height: "calc(100% - 35px)" }}
                  />
                </div>
              </div>
            </SandpackLayout>
          </main>
        </div>
      </SandpackProvider>
    </div>
  );
}
