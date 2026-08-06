import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../components/api/axios";

export const getStudent = createAsyncThunk(
  "auth/getInfo",
  async (_, { rejectWithValue }) => {
    try {
      const studentid = localStorage.getItem("studentID");
      if (!studentid) {
        return rejectWithValue("No student ID");
      }

      const response = await api.get(`/students/${studentid}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "Network Error";
      return rejectWithValue(message);
    }
  },
);

const initialState = {
  isLogged: false,
  loading: false,
  username: "",
  fullname: "",
  phone: "",
  group: "",
  groups: [],
  parentsNumber: "",
  error: null,
  id: "",
  profileUrl: "",
  role: "",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem("studentID");
      state.isLogged = false;
      state.username = "";
      state.fullname = "";
      state.phone = "";
      state.group = "";
      state.groups = [];
      state.parentsNumber = "";
      state.error = null;
      state.id = "";
      state.profileUrl = "";
      state.role = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getStudent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getStudent.fulfilled, (state, action) => {
        const user = action.payload;
        state.isLogged = true;
        state.loading = false;
        state.username = user.username || "";
        state.fullname = user.fullName || user.name || "";
        state.phone = user.phone || "";
        const groupsArray =
          user.groups || user.group || user.groupData || user.groupInfo || [];
        if (Array.isArray(groupsArray) && groupsArray.length > 0) {
          state.group = groupsArray[0];
          state.groups = groupsArray;
        } else if (groupsArray && typeof groupsArray === "object") {
          state.group = groupsArray;
          state.groups = [groupsArray];
        } else if (groupsArray && typeof groupsArray === "string") {
          state.group = { id: groupsArray, name: groupsArray };
          state.groups = [{ id: groupsArray, name: groupsArray }];
        } else {
          state.group = "";
          state.groups = [];
        }
        state.parentsNumber = user.parentPhoneNumber || user.parentNumber || "";
        state.id = user.id;
        state.role = user.role || "STUDENT";
        state.profileUrl = user.profileImageUrl || user.profileUrl || "";
      })
      .addCase(getStudent.rejected, (state, action) => {
        state.loading = false;
        state.isLogged = false;
        state.error = action.payload;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
