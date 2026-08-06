import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../components/api/axios";

export const updateStudentPassword = createAsyncThunk(
  "profile/updatePassword",
  async ({ password }, { rejectWithValue, getState }) => {
    try {
      const authState = getState().auth;
      const id = authState.id || authState.user?.id;

      if (!id) {
        return rejectWithValue("Foydalanuvchi ID topilmadi");
      }

      const res = await api.put(
        `/students/${id}/password`,
        { password },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      return res.data;
    } catch (error) {
      console.log("Password update error:", error);
      return rejectWithValue(
        error.response?.data?.message || "Паролни янгилашда хатолик",
      );
    }
  },
);

export const updateProfile = createAsyncThunk(
  "profile/update",
  async (formData, { rejectWithValue, getState }) => {
    try {
      const authState = getState().auth;
      const id = authState.id || authState.user?.id;

      if (!id) {
        return rejectWithValue("Foydalanuvchi ID topilmadi");
      }

      const res = await api.put(`/students/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return res.data;
    } catch (error) {
      console.log("Thunk error:", error);
      return rejectWithValue(
        error.response?.data?.message || "Yangilashda xatolik",
      );
    }
  },
);

export const getAllStudent = createAsyncThunk(
  "students/get",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/students/leaderboard", {
        headers: {
          "Content-Type": "application/json",
        },
      });
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Ma'lumot olishda xatolik",
      );
    }
  },
);

const initialState = {
  loading: false,
  error: null,
  students: [],
  currentStudent: null,
  loaded: false,
};

const studentSlice = createSlice({
  name: "students",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllStudent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllStudent.fulfilled, (state, action) => {
        state.loading = false;
        const sorted = [...action.payload].sort((a, b) => b.rating - a.rating);
        state.students = sorted.map((item, index) => ({
          ...item,
          rank: index + 1,
        }));
        state.loaded = true;
      })
      .addCase(getAllStudent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.students = state.students.map((student) =>
          student.id === action.payload.id ? action.payload : student,
        );
        state.error = null;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // ⚠️ Password update cases
      .addCase(updateStudentPassword.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateStudentPassword.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(updateStudentPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = studentSlice.actions;
export default studentSlice.reducer;
