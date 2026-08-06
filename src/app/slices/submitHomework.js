import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../components/api/axios";

export const submitHomeworkAction = createAsyncThunk(
  "homework/submitHomework",
  async (formData, { rejectWithValue }) => {
    try {
      console.log("Sending homework via FormData...");

      const response = await api.post(`/homeworks/submit`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Server response:", response.data);

      return response.data;
    } catch (error) {
      console.log("Redux Thunk Error:", error?.response?.data || error.message);

      return rejectWithValue(
        error?.response?.data?.message ||
          "Vazifani topshirishda xatolik yuz berdi",
      );
    }
  },
);

export const getSubmissions = createAsyncThunk(
  "homework/getSubmissions",
  async (_, { rejectWithValue, getState }) => {
    try {
      const { id, group } = getState().auth;

      if (!id) return rejectWithValue("Student ID topilmadi");

      const res = await api.get(`/homeworks/student/${id}/${group.id}/done`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Tarixni yuklashda xatolik",
      );
    }
  },
);

const initialState = {
  loading: false,
  error: null,
  submissions: [],
  submited: false,
  loaded: false,
};

const submitHomeworkSlice = createSlice({
  name: "homeworkSubmit",
  initialState,
  reducers: {
    resetSubmitState: (state) => {
      state.loading = false;
      state.error = null;
      state.submited = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // SUBMIT CASE
      .addCase(submitHomeworkAction.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.submited = false;
      })
      .addCase(submitHomeworkAction.fulfilled, (state) => {
        state.loading = false;
        state.submited = true;
        state.error = null;
      })
      .addCase(submitHomeworkAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.submited = false;
      })

      // GET SUBMISSIONS CASE
      .addCase(getSubmissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSubmissions.fulfilled, (state, action) => {
        state.loading = false;
        state.submissions = action.payload; // Ma'lumotlarni massivga yozamiz
        state.loaded = true;
      })
      .addCase(getSubmissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetSubmitState } = submitHomeworkSlice.actions;
export default submitHomeworkSlice.reducer;
