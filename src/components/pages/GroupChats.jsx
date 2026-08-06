import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RefreshCw, MessagesSquare, CloudOff, MessageCircle } from "lucide-react";
import api from "../api/axios";
import { fetchGroups, setSelectedGroup } from "../../app/slices/groupChats";
import { connectGroupChatSocket } from "../../utils/groupChatSocket";

const AVATAR_COLORS = [
  "#00A8A8", "#E07C24", "#6C63FF", "#E05A8C", "#2DB87F",
  "#D4A017", "#3B82F6", "#8B5CF6",
];

function getAvatarColor(name) {
  let hash = 0;
  for (let i = 0; i < (name || "").length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export default function GroupChats({ onSelectGroup }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { groups, loadingGroups, groupsError, groupsLoaded } = useSelector((state) => state.groupChats);
  const { id: authStudentId, role, groups: authGroups } = useSelector((state) => state.auth);
  const [lastMessages, setLastMessages] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const socketRef = useRef(null);
  const lastMessagesRef = useRef({});
  const joinedGroupsRef = useRef(new Set());
  const didAutoLoadRef = useRef(false);

  const visibleGroups = useMemo(() => {
    if (role === "ADMIN") {
      return groups;
    }

    const allowedIds = new Set((authGroups || []).map((group) => String(group?.id)));
    if (allowedIds.size === 0) {
      return [];
    }

    return groups.filter((group) => allowedIds.has(String(group.id)));
  }, [groups, authGroups, role]);

  const loadData = useCallback(async () => {
    try {
      const groupsData = await dispatch(fetchGroups()).unwrap();
      const allowedGroups =
        role === "ADMIN"
          ? groupsData
          : groupsData.filter((group) =>
              (authGroups || []).some(
                (allowedGroup) => String(allowedGroup?.id) === String(group.id),
              ),
            );

      if (allowedGroups && allowedGroups.length > 0) {
        const messagesPromises = allowedGroups.map((group) =>
          api.get(`/chat/group/${group.id}`).then((res) => ({
            groupId: group.id,
            lastMsg: res.data && res.data.length > 0 ? res.data[res.data.length - 1] : null,
          })),
        );
        const results = await Promise.all(messagesPromises);
        const newLastMessages = {};
        results.forEach(({ groupId, lastMsg }) => {
          if (lastMsg) newLastMessages[groupId] = lastMsg;
        });
        setLastMessages(newLastMessages);
      }
    } catch (error) {
      console.error("Failed to load groups", error);
    }
  }, [dispatch, role, authGroups]);

  useEffect(() => {
    // Mount paytida faqat bir marta yuklash — muvaffaqiyatsizlikda ham loop bo'lmaydi
    if (didAutoLoadRef.current) return;
    if (groupsLoaded || loadingGroups) return;
    didAutoLoadRef.current = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, [groupsLoaded, loadingGroups, loadData]);

  useEffect(() => {
    lastMessagesRef.current = lastMessages;
  }, [lastMessages]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  useEffect(() => {
    let isMounted = true;

    const handleNewMessage = (message) => {
      if (!message?.groupId) {
        return;
      }
      setLastMessages((current) => ({
        ...current,
        [message.groupId]: message,
      }));
    };

    const handleMessageEdited = (message) => {
      const entries = Object.entries(lastMessagesRef.current);
      const match = entries.find(([, lastMsg]) => String(lastMsg?.id) === String(message?.id));
      if (!match) return;
      const [groupId] = match;
      setLastMessages((current) => ({
        ...current,
        [groupId]: {
          ...current[groupId],
          content: message.content,
          updatedAt: message.updatedAt,
        },
      }));
    };

    const refreshGroupLastMessage = async (groupId) => {
      try {
        const response = await api.get(`/chat/group/${groupId}`);
        const lastMsg =
          response.data && response.data.length > 0
            ? response.data[response.data.length - 1]
            : null;
        setLastMessages((current) => {
          const next = { ...current };
          if (lastMsg) {
            next[groupId] = lastMsg;
          } else {
            delete next[groupId];
          }
          return next;
        });
      } catch (error) {
        console.error("Failed to refresh group last message", error);
      }
    };

    const handleMessageDeleted = ({ id }) => {
      const entries = Object.entries(lastMessagesRef.current);
      const match = entries.find(([, lastMsg]) => String(lastMsg?.id) === String(id));
      if (!match) return;
      const [groupId] = match;
      refreshGroupLastMessage(groupId);
    };

    const joinAdminGroups = (socket, availableGroups) => {
      if (role !== "ADMIN" || !availableGroups.length) return;
      availableGroups.forEach((group) => {
        const groupKey = String(group.id);
        if (joinedGroupsRef.current.has(groupKey)) return;
        joinedGroupsRef.current.add(groupKey);
        socket.emit("join_group", { groupId: String(group.id).trim() });
      });
    };

    connectGroupChatSocket(authStudentId).then((socket) => {
      if (!socket || !isMounted) return;

      socketRef.current = socket;
      socket.off("new_message", handleNewMessage);
      socket.off("message_edited", handleMessageEdited);
      socket.off("message_deleted", handleMessageDeleted);

      socket.on("new_message", handleNewMessage);
      socket.on("message_edited", handleMessageEdited);
      socket.on("message_deleted", handleMessageDeleted);

      joinAdminGroups(socket, visibleGroups);
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
  }, [authStudentId, visibleGroups, role]);

  const handlePress = (group) => {
    dispatch(setSelectedGroup({ id: group.id, name: group.name }));
    if (onSelectGroup) {
      onSelectGroup(group);
    } else {
      navigate("/chat", { state: { groupId: group.id, groupName: group.name } });
    }
  };

  if (loadingGroups && !refreshing) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="w-10 h-10 border-4 border-[#00A8A8] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-bold text-slate-500">Загрузка групп...</p>
      </div>
    );
  }

  if (groupsError && !refreshing) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="w-20 h-20 rounded-full bg-[#00A8A8]/10 flex items-center justify-center">
          <CloudOff size={36} color="#64748B" />
        </div>
        <p className="text-lg font-bold text-slate-800">Не удалось загрузить</p>
        <p className="text-sm text-slate-500">Проверьте подключение к интернету</p>
        <button
          onClick={onRefresh}
          className="flex items-center gap-2 px-6 py-3 bg-[#00A8A8] text-white font-bold rounded-full shadow-lg shadow-[#00A8A8]/30 hover:bg-[#009a9a] transition"
        >
          <RefreshCw size={18} /> Повторить
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pb-12">
      {/* Header */}
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#0B3C5D] via-[#103D5C] to-[#14537A] p-8 shadow-xl shadow-[#0b3c5d]/20">
        <div className="absolute -top-8 -right-6 w-32 h-32 rounded-full bg-[#00A8A8]/12"></div>
        <div className="absolute -bottom-6 right-16 w-24 h-24 rounded-full bg-white/5"></div>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-white tracking-wide">Чаты</h1>
            <p className="mt-1 text-[13px] font-medium text-white/50">Общение с группами</p>
          </div>
          <div className="flex items-center gap-2 bg-white/12 px-4 py-2.5 rounded-full">
            <MessageCircle size={18} color="rgba(255,255,255,0.9)" />
            <span className="text-white font-bold">{visibleGroups.length}</span>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-[#00A8A8]"></div>
          <div className="flex-1 h-0.5 bg-white/10 rounded-full"></div>
        </div>
      </div>

      {/* List */}
      <div className="mt-6 space-y-3">
        {visibleGroups.length === 0 && (
          <div className="flex flex-col items-center py-24">
            <div className="w-20 h-20 rounded-full bg-[#00A8A8]/10 flex items-center justify-center mb-5">
              <MessagesSquare size={34} color="#00A8A8" />
            </div>
            <p className="text-lg font-bold text-slate-800">Группы не найдены</p>
            <p className="mt-1 text-sm text-slate-500">Нет доступных групп для общения</p>
          </div>
        )}

        {visibleGroups.map((item) => {
          const lastMsg = lastMessages[item.id];
          const avatarColor = getAvatarColor(item.name);
          return (
            <button
              key={item.id}
              onClick={() => handlePress(item)}
              className="w-full flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-left"
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: avatarColor }}
              >
                <span className="text-white text-2xl font-extrabold">
                  {(item.name || "?").charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[16px] font-bold text-slate-800 truncate">{item.name}</span>
                  <span className="text-xs font-medium text-slate-400 shrink-0">
                    {lastMsg
                      ? new Date(lastMsg.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : ""}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-500 truncate">
                  {lastMsg ? lastMsg.content : "Нет сообщений"}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
