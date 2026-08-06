import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../components/api/axios";

export const fetchGroups = createAsyncThunk(
  "groupChats/fetchGroups",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/groups");
      return response.data || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || "Failed to load groups");
    }
  }
);

export const fetchGroupMessages = createAsyncThunk(
  "groupChats/fetchGroupMessages",
  async (groupId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/chat/group/${groupId}`);
      return response.data || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || "Failed to load messages");
    }
  }
);

export const sendGroupMessage = createAsyncThunk(
  "groupChats/sendGroupMessage",
  async ({ content, studentId, groupId }, { rejectWithValue }) => {
    try {
      const response = await api.post("/chat", { content, studentId, groupId });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || "Failed to send message");
    }
  }
);

export const deleteGroupMessage = createAsyncThunk(
  "groupChats/deleteGroupMessage",
  async (messageId, { rejectWithValue }) => {
    try {
      await api.delete(`/chat/${messageId}`);
      return messageId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || "Failed to delete message");
    }
  }
);

export const updateGroupMessage = createAsyncThunk(
  "groupChats/updateGroupMessage",
  async ({ messageId, content }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/chat/${messageId}`, { content });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || "Failed to update message");
    }
  }
);

const initialState = {
  groups: [],
  selectedGroup: null,
  messages: [],
  loadingGroups: false,
  loadingMessages: false,
  sending: false,
  groupsError: null,
  messagesError: null,
  sendError: null,
  groupsLoaded: false,
};

function sameId(left, right) {
  return String(left) === String(right);
}

function upsertMessage(state, message) {
  if (!message) return;
  const matchesSelectedGroup =
    state.selectedGroup && sameId(state.selectedGroup.id, message.groupId);

  if (!matchesSelectedGroup) {
    return;
  }

  const index = state.messages.findIndex((item) => sameId(item.id, message.id));
  if (index >= 0) {
    state.messages[index] = { ...state.messages[index], ...message };
    return;
  }

  state.messages.push(message);
}

const groupChatsSlice = createSlice({
  name: "groupChats",
  initialState,
  reducers: {
    setSelectedGroup: (state, action) => {
      state.selectedGroup = action.payload;
      state.messages = [];
      state.messagesError = null;
    },
    clearGroupChats: (state) => {
      state.groups = [];
      state.selectedGroup = null;
      state.messages = [];
      state.groupsError = null;
      state.messagesError = null;
      state.sendError = null;
      state.loadingGroups = false;
      state.loadingMessages = false;
      state.sending = false;
      state.groupsLoaded = false;
    },
    clearSendError: (state) => {
      state.sendError = null;
    },
    upsertRealtimeMessage: (state, action) => {
      upsertMessage(state, action.payload);
    },
    updateRealtimeMessage: (state, action) => {
      const { id, content, updatedAt } = action.payload || {};
      const index = state.messages.findIndex((message) => sameId(message.id, id));
      if (index >= 0) {
        state.messages[index] = {
          ...state.messages[index],
          content,
          updatedAt,
        };
      }
    },
    removeRealtimeMessage: (state, action) => {
      const { id } = action.payload || {};
      state.messages = state.messages.filter((message) => !sameId(message.id, id));
    },
    updateGroupUnread: (state, action) => {
      const { groupId, unreadCount } = action.payload;
      const group = state.groups.find((g) => String(g.id) === String(groupId));
      if (group) {
        group.unreadCount = unreadCount;
      }
    },
    markGroupAsRead: (state, action) => {
      const groupId = action.payload;
      const group = state.groups.find((g) => String(g.id) === String(groupId));
      if (group) {
        group.unreadCount = 0;
      }
      localStorage.setItem(`lastSeen_${groupId}`, Date.now().toString());
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGroups.pending, (state) => {
        state.loadingGroups = true;
        state.groupsError = null;
      })
      .addCase(fetchGroups.fulfilled, (state, action) => {
        state.loadingGroups = false;
        state.groups = action.payload.map((g) => ({ ...g, unreadCount: 0 }));
        state.groupsLoaded = true;
        if (!state.selectedGroup && action.payload.length > 0) {
          state.selectedGroup = action.payload[0];
        }
      })
      .addCase(fetchGroups.rejected, (state, action) => {
        state.loadingGroups = false;
        state.groupsError = action.payload;
      })
      .addCase(fetchGroupMessages.pending, (state) => {
        state.loadingMessages = true;
        state.messagesError = null;
      })
      .addCase(fetchGroupMessages.fulfilled, (state, action) => {
        state.loadingMessages = false;
        state.messages = action.payload;
      })
      .addCase(fetchGroupMessages.rejected, (state, action) => {
        state.loadingMessages = false;
        state.messagesError = action.payload;
      })
      .addCase(sendGroupMessage.pending, (state) => {
        state.sending = true;
        state.sendError = null;
      })
      .addCase(sendGroupMessage.fulfilled, (state, action) => {
        state.sending = false;
        upsertMessage(state, action.payload);
      })
      .addCase(sendGroupMessage.rejected, (state, action) => {
        state.sending = false;
        state.sendError = action.payload;
      })
      .addCase(deleteGroupMessage.fulfilled, (state, action) => {
        state.messages = state.messages.filter((message) => message.id !== action.payload);
      })
      .addCase(updateGroupMessage.fulfilled, (state, action) => {
        state.messages = state.messages.map((message) =>
          message.id === action.payload.id ? action.payload : message
        );
      });
  },
});

export const {
  setSelectedGroup,
  clearGroupChats,
  clearSendError,
  updateGroupUnread,
  markGroupAsRead,
  upsertRealtimeMessage,
  updateRealtimeMessage,
  removeRealtimeMessage,
} = groupChatsSlice.actions;
export default groupChatsSlice.reducer;
