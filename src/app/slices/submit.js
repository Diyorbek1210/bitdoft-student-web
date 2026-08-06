import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../components/api/axios";
export const submitTask = createAsyncThunk(
  "submitTask/task",
  async ({ taskId }, { rejectWithValue, getState }) => {
    try {
      const stateStudentId = getState().auth?.id;
      const storedStudentId = localStorage.getItem("studentID");
      const studentId = stateStudentId || storedStudentId;

      if (!studentId) return rejectWithValue("Student ID topilmadi");

      const res = await api.put(`/learn/${studentId}/complete/${taskId}`, {}, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      return res.data;
    } catch (error) {
      console.log("Xatolik:", error.response?.data || error.message);
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

const initialState = {
  loading: false,
  submited: false,
  error: false,
};

const submitSlice = createSlice({
  name: "submit",
  initialState,
  reducers: {
    cleanStates: (state) => {
      state.loading = false;
      state.error = false;
      state.submited = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitTask.pending, (state, action) => {
        state.loading = true;
        state.error = false;
        state.submited = false;
      })
      .addCase(submitTask.fulfilled, (state, _) => {
        state.loading = false;
        state.submited = true;
        state.error = false;
      })
      .addCase(submitTask.rejected, (state, _) => {
        state.loading = false;
        state.error = true;
        state.submited = false;
      });
  },
});
export const { cleanStates } = submitSlice.actions;
export default submitSlice.reducer;
