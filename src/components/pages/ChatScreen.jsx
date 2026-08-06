import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ArrowUp, ChevronLeft, MessagesSquare } from "lucide-react";
import {
  fetchGroupMessages,
  sendGroupMessage,
  markGroupAsRead,
  setSelectedGroup,
  upsertRealtimeMessage,
  updateRealtimeMessage,
  removeRealtimeMessage,
} from "../../app/slices/groupChats";
import { connectGroupChatSocket } from "../../utils/groupChatSocket";

const NAME_COLORS = [
  "#E07C24", "#00A8A8", "#6C63FF", "#E05A8C", "#2DB87F",
  "#D4A017", "#3B82F6", "#E85D75", "#10B981", "#8B5CF6",
];

function getNameColor(name) {
  if (!name) return NAME_COLORS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return NAME_COLORS[Math.abs(hash) % NAME_COLORS.length];
}

function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return parts[0][0].toUpperCase();
}

function formatMessageTime(dateStr) {
  try {
    return new Date(dateStr).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function formatDateSeparator(dateStr) {
  try {
    const d = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return "Сегодня";
    if (d.toDateString() === yesterday.toDateString()) return "Вчера";

    return d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
  } catch {
    return "";
  }
}

function shouldShowDateSeparator(current, previous) {
  if (!previous) return true;
  try {
    return new Date(current).toDateString() !== new Date(previous).toDateString();
  } catch {
    return false;
  }
}

export default function ChatScreen({ groupId: propGroupId, groupName: propGroupName, onBack }) {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { groupId: stateGroupId, groupName: stateGroupName } = location?.state || {};
  const groupId = propGroupId || stateGroupId;
  const groupName = propGroupName || stateGroupName;

  const { messages, loadingMessages, messagesError } = useSelector(
    (state) => state.groupChats,
  );
  const { id: authStudentId, fullname, profileUrl } = useSelector((state) => state.auth);
  const studentId = authStudentId || localStorage.getItem("studentID");

  const [draft, setDraft] = useState("");
  const [tempMessages, setTempMessages] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const endRef = useRef(null);
  const socketRef = useRef(null);

  const scrollToBottom = useCallback((smooth = true) => {
    setTimeout(() => {
      endRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
    }, 50);
  }, []);

  const loadMessages = useCallback(async () => {
    if (!groupId) return;
    try {
      await dispatch(fetchGroupMessages(groupId)).unwrap();
      await dispatch(markGroupAsRead(groupId));
    } catch (error) {
      console.error("Failed to load messages", error);
    }
  }, [groupId, dispatch]);

  useEffect(() => {
    if (!groupId) {
      if (onBack) {
        onBack();
      } else {
        navigate("/dashboard", { replace: true });
      }
      return;
    }
    dispatch(setSelectedGroup({ id: groupId, name: groupName }));
    loadMessages();
  }, [groupId, groupName, dispatch, navigate, loadMessages, onBack]);

  useEffect(() => {
    scrollToBottom(false);
  }, [messages.length, tempMessages.length, scrollToBottom]);

  useEffect(() => {
    let isMounted = true;

    const handleNewMessage = (message) => {
      if (String(message?.groupId) !== String(groupId)) return;
      dispatch(upsertRealtimeMessage(message));
    };

    const handleMessageEdited = (message) => {
      dispatch(updateRealtimeMessage(message));
    };

    const handleMessageDeleted = ({ id }) => {
      dispatch(removeRealtimeMessage({ id }));
    };

    connectGroupChatSocket(studentId).then((socket) => {
      if (!socket || !isMounted) return;

      socketRef.current = socket;
      socket.off("new_message", handleNewMessage);
      socket.off("message_edited", handleMessageEdited);
      socket.off("message_deleted", handleMessageDeleted);

      socket.on("new_message", handleNewMessage);
      socket.on("message_edited", handleMessageEdited);
      socket.on("message_deleted", handleMessageDeleted);
      socket.emit("join_group", { groupId: String(groupId).trim() });
    });

    return () => {
      isMounted = false;
      const socket = socketRef.current;
      if (socket) {
        socket.off("new_message", handleNewMessage);
        socket.off("message_edited", handleMessageEdited);
        socket.off("message_deleted", handleMessageDeleted);
      }
    };
  }, [studentId, groupId, dispatch]);

  const handleSend = async () => {
    const trimmed = draft.trim();
    if (!trimmed || !studentId) return;

    const temp = {
      id: `optimistic-${Date.now()}`,
      content: trimmed,
      groupId,
      pending: true,
      createdAt: new Date().toISOString(),
      student: { id: studentId, name: fullname, profileImageUrl: profileUrl },
    };
    setDraft("");
    setTempMessages((prev) => [...prev, temp]);
    scrollToBottom(true);

    try {
      await dispatch(
        sendGroupMessage({
          content: trimmed,
          studentId: String(studentId).trim(),
          groupId: String(groupId).trim(),
        }),
      ).unwrap();
    } catch (error) {
      setDraft(trimmed);
    } finally {
      setTempMessages((prev) => prev.filter((m) => m.id !== temp.id));
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMessages();
    setRefreshing(false);
  };

  const sortedMessages = useMemo(() => {
    const all = [...messages, ...tempMessages];
    return all.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }, [messages, tempMessages]);

  const membersCount = useMemo(() => {
    const ids = new Set();
    messages.forEach((m) => {
      if (m.student?.id) ids.add(m.student.id);
    });
    return ids.size;
  }, [messages]);

  if (!groupId) return null;

  if (loadingMessages && !refreshing) {
    return (
      <div className="h-full bg-[#F0F4F8] flex flex-col">
        <Header groupName={groupName} membersCount={null} onBack={onBack || (() => navigate(-1))} />
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <div className="w-10 h-10 border-4 border-[#00A8A8] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-bold text-slate-500">Загрузка сообщений...</p>
        </div>
      </div>
    );
  }

  if (messagesError && !refreshing) {
    return (
      <div className="h-full bg-[#F0F4F8] flex flex-col">
        <Header groupName={groupName} membersCount={null} onBack={onBack || (() => navigate(-1))} />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-8">
          <div className="w-20 h-20 rounded-full bg-[#00A8A8]/10 flex items-center justify-center">
            <MessagesSquare size={38} color="#64748B" />
          </div>
          <p className="text-lg font-bold text-slate-800">Не удалось загрузить</p>
          <p className="text-sm text-slate-500">Проверьте подключение к интернету</p>
          <button
            onClick={onRefresh}
            className="flex items-center gap-2 px-6 py-3 bg-[#00A8A8] text-white font-bold rounded-full shadow-lg shadow-[#00A8A8]/30 hover:bg-[#009a9a] transition"
          >
            Повторить
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-[#F0F4F8] flex flex-col overflow-hidden">
      <Header groupName={groupName} membersCount={membersCount} onBack={onBack || (() => navigate(-1))} />

      <div className="flex-1 overflow-y-auto px-4 py-3">
        {sortedMessages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-[#00A8A8]/10 flex items-center justify-center mb-4">
              <MessagesSquare size={36} color="#B2DFDB" />
            </div>
            <p className="text-lg font-bold text-slate-700">Пока нет сообщений</p>
            <p className="text-sm text-slate-400 mt-1">Начните общение первым</p>
          </div>
        )}

        {sortedMessages.map((item, index) => {
          const prevItem = index > 0 ? sortedMessages[index - 1] : null;
          const showDate = shouldShowDateSeparator(item.createdAt, prevItem?.createdAt);
          const isOwn = item.student?.id === studentId;
          const senderName = item.student?.name || item.student?.fullName || "";
          const avatarUrl = item.student?.profileImageUrl || item.student?.profileUrl || "";
          const nameColor = getNameColor(senderName);

          return (
            <div key={item.id}>
              {showDate && (
                <div className="flex items-center gap-3 my-4">
                  <div className="flex-1 h-px bg-[#E4EBF1]"></div>
                  <span className="px-3.5 py-1.5 rounded-xl bg-[#0B3C5D]/[0.06] text-[11px] font-semibold text-slate-500">
                    {formatDateSeparator(item.createdAt)}
                  </span>
                  <div className="flex-1 h-px bg-[#E4EBF1]"></div>
                </div>
              )}

              <div
                className={`flex mb-1.5 ${isOwn ? "justify-end pl-12" : "justify-start pr-12"}`}
              >
                {!isOwn && (
                  <div className="mr-2 self-end shrink-0">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt=""
                        className="w-9 h-9 rounded-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-[#00A8A8] flex items-center justify-center">
                        <span className="text-white text-xs font-bold">{getInitials(senderName)}</span>
                      </div>
                    )}
                  </div>
                )}

                <div
                  className={`max-w-[78%] px-3.5 py-2.5 rounded-[1.25rem] ${
                    isOwn
                      ? "bg-[#00A8A8] text-white rounded-br-md"
                      : "bg-white text-slate-800 border border-[#E4EBF1] rounded-bl-md"
                  } ${item.pending ? "opacity-60" : ""}`}
                >
                  {!isOwn && senderName && (
                    <p className="text-[13px] font-bold mb-0.5" style={{ color: nameColor }}>
                      {senderName}
                    </p>
                  )}
                  <p className="text-[15px] leading-6 break-words whitespace-pre-wrap">{item.content}</p>
                  <div className="flex items-center justify-end gap-1 mt-1">
                    <span className={`text-[10px] ${isOwn ? "text-white/70" : "text-slate-400"}`}>
                      {formatMessageTime(item.createdAt)}
                    </span>
                    {item.pending && <span className="text-[10px] opacity-70">...</span>}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={endRef}></div>
      </div>

      {/* Input bar */}
      <div className="bg-white rounded-t-3xl px-4 pt-3 pb-4 flex items-end gap-2.5 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="flex-1 bg-[#F7F9FC] border border-[#DEE5ED] rounded-[1.6rem] px-5 py-3 min-h-[54px] max-h-32 overflow-y-auto">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Сообщение..."
            maxLength={2000}
            rows={1}
            className="w-full bg-transparent outline-none resize-none text-[15px] text-slate-800 leading-5"
            style={{ minHeight: "20px" }}
          />
        </div>
        <button
          onClick={handleSend}
          disabled={!draft.trim() || !studentId}
          className="w-12 h-12 rounded-full bg-[#00A8A8] flex items-center justify-center text-white shadow-lg shadow-[#00A8A8]/30 hover:bg-[#009a9a] transition disabled:bg-slate-400 disabled:shadow-none"
        >
          <ArrowUp size={24} />
        </button>
      </div>
    </div>
  );
}

function Header({ groupName, membersCount, onBack }) {
  return (
    <div className="bg-[#0B3C5D] px-4 pb-4 pt-5 rounded-b-[1.75rem] flex items-center shadow-lg shadow-[#0b3c5d]/25 shrink-0">
      <button
        onClick={onBack}
        className="w-11 h-11 rounded-full bg-white/15 flex items-center justify-center text-white hover:bg-white/25 transition"
      >
        <ChevronLeft size={22} />
      </button>
      <div className="flex-1 ml-3 min-w-0">
        <h1 className="text-white font-bold text-[17px] truncate">{groupName || "Группа"}</h1>
        {membersCount !== null && (
          <p className="text-white/55 text-xs mt-0.5">
            {membersCount > 0 ? `${membersCount} участников` : "Группа"}
          </p>
        )}
      </div>
    </div>
  );
}
