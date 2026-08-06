import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff,  Lock , Phone} from "lucide-react"; // Ikonkalar uchun
import api from "../api/axios";
import Logo from "../../assets/logo.png";

export default function Login() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // Parolni ko'rsatish holati
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const id = localStorage.getItem("studentID");
    if (id) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await api.post("/auth/login", {
        phone: phone.toLowerCase().trim(),
        password: password,
      });

      const { success, data } = response.data;

      if (success && data?.studentId) {
        const studentId = String(data.studentId);
        localStorage.setItem("studentID", studentId);
        navigate("/dashboard", { replace: true });
      } else {
        throw new Error("Ошибка авторизации");
      }
    } catch (err) {
      const message =
        err.response?.data?.message || "Неверный login или пароль";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-12 bg-gradient-to-br from-[#F3F7FA] via-white to-[#EAF2F8] sm:px-6 lg:px-8">
      <div className="w-full max-w-md p-8 bg-white border shadow-xl md:p-10 rounded-3xl shadow-slate-200/50 border-slate-100/80 backdrop-blur-sm">
        {/* Logotip va Sarlavha */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3">
            <img
              src={Logo}
              alt="BitSoft logo"
              className="w-11 h-11 rounded-xl shadow-sm"
            />
            <h2 className="text-3xl font-extrabold tracking-tight text-[#0B3C5D]">
              BITSOFT
            </h2>
          </div>
          <p className="mt-2 text-sm font-medium text-slate-500">
            Авторизация в системе
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleLogin}>
          {/* Xatolik xabari */}
          {error && (
            <div className="px-4 py-3 text-sm font-medium text-center border bg-rose-50 border-rose-100 text-rose-600 rounded-2xl animate-fade-in">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Phone Input */}
            <div>
              <label className="block mb-2 text-xs font-semibold tracking-wider uppercase text-slate-600">
                Телефон
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                  <Phone size={18} />
                </div>
                <input
                  type="tel"
                  required
                  className="block w-full py-3 pl-10 pr-4 text-sm font-medium transition-all duration-200 border border-slate-200 rounded-2xl bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] focus:bg-white"
                  placeholder="998 99 123 45 67"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            {/* Parol Input */}
            <div>
              <label className="block mb-2 text-xs font-semibold tracking-wider uppercase text-slate-600">
                Пароль
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="block w-full py-3 pl-10 pr-12 text-sm font-medium transition-all duration-200 border border-slate-200 rounded-2xl bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] focus:bg-white"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 transition-colors text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          {/* Login Tugmasi */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center items-center py-3.5 px-4 text-sm font-semibold rounded-2xl text-white transition-all duration-300 shadow-lg ${
                loading
                  ? "bg-slate-300 cursor-not-allowed shadow-none"
                  : "bg-[#1A1A1A] hover:bg-[#0B3C5D] shadow-[#1A1A1A]/20 hover:shadow-[#0B3C5D]/30 transform hover:-translate-y-0.5 active:translate-y-0"
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="w-5 h-5 mr-3 -ml-1 text-white animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Подождите...
                </span>
              ) : (
                "Войти в аккаунт"
              )}
            </button>
          </div>
        </form>

        {/* Parolni unutdingizmi? */}
        <div className="mt-6 text-center">
          <a
            href="#"
            className="text-xs font-semibold tracking-wide transition-colors text-slate-400 hover:text-[#2563eb]"
          >
            Забыли пароль?
          </a>
        </div>
      </div>
    </div>
  );
}
