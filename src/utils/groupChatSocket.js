import { io } from "socket.io-client";
import { SOCKET_BASE_URL } from "../components/api/axios";

let socket = null;
let currentStudentId = null;

function normalizeStudentId(studentId) {
  return String(studentId ?? "").trim();
}

function createSocket(studentId) {
  return io(SOCKET_BASE_URL, {
    autoConnect: false,
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    auth: { studentId },
  });
}

export function connectGroupChatSocket(studentId) {
  const storedStudentId = normalizeStudentId(
    studentId || localStorage.getItem("studentID"),
  );

  if (!storedStudentId) {
    return Promise.resolve(null);
  }

  if (socket && currentStudentId && currentStudentId !== storedStudentId) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }

  currentStudentId = storedStudentId;

  if (!socket) {
    socket = createSocket(storedStudentId);
  } else {
    socket.auth = { studentId: storedStudentId };
  }

  if (!socket.connected) {
    socket.connect();
  }

  return Promise.resolve(socket);
}

export function getGroupChatSocket() {
  return socket;
}

export function disconnectGroupChatSocket() {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
  currentStudentId = null;
}
