import React, { useEffect, useRef, useState } from "react";
import {
  Newspaper,
  BookOpen,
  GraduationCap,
  Trophy,
  LogOut,
  Loader2,
  X,
  Camera,
  Smartphone,
  Users,
  Phone,
  Rocket,
  MessagesSquare,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { getStudent, logout } from "../../app/slices/auth";
import { updateProfile } from "../../app/slices/profile";
import { useLocation, useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";

// Sahifalar
import Library from "../pages/Library";
import Homeworks from "../pages/Homeworks";
import Rating from "../pages/Rating";
import News from "../pages/News";
import Learn from "../pages/Learn";
import GroupChats from "../pages/GroupChats";
import ChatScreen from "../pages/ChatScreen";

export default function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  // Masalan, vazifa topshirilgandan keyin "Homeworks" tabiga qaytish uchun
  const [activeTab, setActiveTab] = useState(location.state?.tab || "News");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);

  const {
    fullname,
    username,
    phone,
    group,
    parentsNumber,
    profileUrl,
    loading,
    id,
  } = useSelector((state) => state.auth);
  const didAutoLoad = useRef(false);

  useEffect(() => {
    if (didAutoLoad.current) return;
    if (id || loading) return;
    didAutoLoad.current = true;
    dispatch(getStudent());
  }, [id, loading, dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  // Cloudinary yuklash mantiqi
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "ml_default");

    try {
      const res = await fetch(
        "https://api.cloudinary.com/v1_1/daancrhjy/image/upload",
        {
          method: "POST",
          body: formData,
        },
      );
      const data = await res.json();
      if (data.secure_url) {
        await dispatch(updateProfile({ profileUrl: data.secure_url })).unwrap();
        dispatch(getStudent());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleSelectChat = (group) => {
    setSelectedChat(group);
  };

  const handleBackFromChat = () => {
    setSelectedChat(null);
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-white">
        <Loader2 className="animate-spin text-[#2563eb] mb-4" size={40} />
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
          Загрузка системы
        </span>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-900">
      {/* SIDEBAR */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-8 flex items-center gap-3">
          <img src={logo} alt="Bitsoft" className="h-12 w-12 rounded-xl object-contain" />
          <h1 className="text-2xl font-black text-slate-900 tracking-tighter italic uppercase">
            Bitsoft
          </h1>
        </div>

        <nav className="flex-1 px-6 space-y-1">
          {[
            { id: "News", label: "Новости", icon: <Newspaper size={18} /> },
            { id: "Homeworks", label: "Задания", icon: <BookOpen size={18} /> },
            {
              id: "Library",
              label: "Библиотека",
              icon: <GraduationCap size={18} />,
            },
            { id: "Rating", label: "Рейтинг", icon: <Trophy size={18} /> },
            { id: "Learn", label: "Обучение", icon: <Rocket size={18} /> },
            { id: "GroupChats", label: "Чат", icon: <MessagesSquare size={18} /> },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setSelectedChat(null);
              }}
              className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 ${
                activeTab === item.id
                  ? "bg-[#0B3C5D] text-white shadow-xl shadow-[#0b3c5d]/20"
                  : "text-slate-400 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {item.icon}
              <span className="text-sm font-bold">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-6">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-5 py-4 text-red-500 hover:bg-red-50 rounded-2xl transition-all"
          >
            <LogOut size={18} />
            <span className="text-xs font-black uppercase tracking-widest">
              Выйти
            </span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* HEADER - faqat News sahifasida profile ko'rsatiladi */}
        {activeTab === "News" && !selectedChat && (
          <header className="h-16 bg-white border-b border-slate-100 px-6 flex items-center justify-end shrink-0">
            <button
              onClick={() => setIsProfileOpen(true)}
              className="flex items-center gap-4 pl-6 border-l border-slate-100 group transition-all"
            >
              <div className="text-right hidden md:block">
                <p className="text-xs font-black text-slate-900 group-hover:text-[#2563eb] transition-colors uppercase tracking-tight">
                  {fullname}
                </p>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                  Активный ученик
                </p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-[#0B3C5D] overflow-hidden shadow-lg group-hover:scale-105 transition-transform">
                {profileUrl ? (
                  <img src={profileUrl} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white font-black text-xs">
                    {fullname?.charAt(0)}
                  </div>
                )}
              </div>
            </button>
          </header>
        )}

        <div className={`flex-1 overflow-y-auto ${activeTab === "GroupChats" && selectedChat ? '' : 'p-6'}`}>
          {activeTab === "News" && <News />}
          {activeTab === "Homeworks" && <Homeworks />}
          {activeTab === "Library" && <Library />}
          {activeTab === "Rating" && <Rating />}
          {activeTab === "Learn" && <Learn />}
          {activeTab === "GroupChats" && !selectedChat && (
            <GroupChats onSelectGroup={handleSelectChat} />
          )}
          {activeTab === "GroupChats" && selectedChat && (
            <ChatScreen
              groupId={selectedChat.id}
              groupName={selectedChat.name}
              onBack={handleBackFromChat}
            />
          )}
        </div>
      </main>

      {isProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            onClick={() => setIsProfileOpen(false)}
          ></div>

          <div className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsProfileOpen(false)}
              className="absolute top-6 right-6 p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors z-20"
            >
              <X size={16} />
            </button>

            <div className="bg-[#0B3C5D] p-10 pt-16 flex flex-col items-center relative">
              <div className="relative group">
                <div className="w-24 h-24 rounded-[2rem] bg-[#00A8A8] ring-4 ring-white/10 overflow-hidden shadow-2xl flex items-center justify-center">
                  {uploading ? (
                    <Loader2 className="animate-spin text-white" size={24} />
                  ) : profileUrl ? (
                    <img
                      src={profileUrl}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl font-black text-white italic">
                      {fullname?.charAt(0)}
                    </span>
                  )}
                </div>
                <label className="absolute -bottom-2 -right-2 bg-white p-2 rounded-xl shadow-xl cursor-pointer hover:scale-110 transition-transform">
                  <Camera size={14} className="text-slate-600" />
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
              </div>
              <h2 className="text-xl font-black text-white mt-6 tracking-tighter uppercase italic">
                {fullname}
              </h2>
              <p className="text-[#7FD1D1] font-bold uppercase tracking-[0.2em] text-[9px] mt-1">
                @{username}
              </p>
            </div>

            {/* Modal Content */}
            <div className="p-8 space-y-6">
              <ModalInfoRow
                icon={<Smartphone size={16} />}
                label="Номер телефона"
                value={phone}
              />
              <ModalInfoRow
                icon={<Users size={16} />}
                label="Группа"
                value={group?.name || group}
              />
              <ModalInfoRow
                icon={<Phone size={16} />}
                label="Телефон родителей"
                value={parentsNumber}
              />

              <button
                onClick={handleLogout}
                className="w-full mt-4 flex items-center justify-center gap-3 p-4 border border-red-100 text-red-500 rounded-2xl hover:bg-red-50 transition-all font-black uppercase text-[10px] tracking-widest"
              >
                <LogOut size={16} /> Выйти из системы
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ModalInfoRow({ icon, label, value }) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-0.5">
          {label}
        </p>
        <p className="text-xs font-bold text-slate-800">
          {value || "Не указано"}
        </p>
      </div>
    </div>
  );
}
