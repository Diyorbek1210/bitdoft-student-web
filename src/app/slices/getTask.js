import api from "../../components/api/axios";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export const getTasks = createAsyncThunk(
  "getTasks/tasks",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get(`/learn`);
      const data = res.data;
      return data;
    } catch (error) {
      console.log("Error occurred while getting tasks", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);
export const getTest = createAsyncThunk(
  "getTaskTest/test",
  async ({ id }, { rejectWithValue }) => {
    try {
      const res = await api.get(`/tests/${id}`);
      const data = res.data;
      return data;
    } catch (error) {
      console.log("Error occurred while getting tests", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

const initialState = {
  tasks: [],
  loading: false,
  error: false,
  pending: false,
  testError: false,
  tests: [],
  loaded: false,
};

const getTaskSlices = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    markTaskCompletedOptimistic: (state, action) => {
      const { taskId, studentId } = action.payload;
      const task = state.tasks.find((t) => String(t.id) === String(taskId));
      if (!task) return;
      task.completed = Array.isArray(task.completed) ? task.completed : [];
      const already = task.completed.some((s) =>
        typeof s === "string" ? s === studentId : s?.id === studentId,
      );
      if (!already) task.completed.push(studentId);
    },
    rollbackTaskCompletedOptimistic: (state, action) => {
      const { taskId, studentId } = action.payload;
      const task = state.tasks.find((t) => String(t.id) === String(taskId));
      if (!task || !Array.isArray(task.completed)) return;
      task.completed = task.completed.filter((s) =>
        typeof s === "string" ? s !== studentId : s?.id !== studentId,
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getTasks.pending, (state, action) => {
        state.loading = true;
        state.error = false;
      })
      .addCase(getTasks.fulfilled, (state, action) => {
        state.tasks = action.payload.tasks;
        state.loading = false;
        state.error = false;
        state.loaded = true;
      })

      .addCase(getTasks.rejected, (state, action) => {
        state.error = true;
        state.loading = false;
        state.tasks = [];
      })

      .addCase(getTest.pending, (state, action) => {
        state.pending = true;
        state.testError = false;
      })
      .addCase(getTest.fulfilled, (state, action) => {
        state.pending = false;
        state.tests = action.payload.data || [];
        state.testError = false;
      })
      .addCase(getTest.rejected, (state, action) => {
        state.pending = false;
        state.testError = true;
        state.tests = [];
      });
  },
});

export const { markTaskCompletedOptimistic, rollbackTaskCompletedOptimistic } =
  getTaskSlices.actions;

export default getTaskSlices.reducer;
