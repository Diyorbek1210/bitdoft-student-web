import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../components/api/axios";

export const fetchHomeworks = createAsyncThunk(
  "homework/fetchHomeworks",
  async (_, { rejectWithValue, getState }) => {
    try {
      const { group, id } = getState().auth;

      if (!group) {
        return rejectWithValue("Guruh ID topilmadi");
      }

      const response = await api.get(
        `/homeworks/student/${id}/${group.id}/not-done`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      return response.data;
    } catch (error) {
      console.error("Fetch homeworks error:", error.message);
      return rejectWithValue(
        error.response?.data?.error || "Vazifalarni yuklashda xatolik",
      );
    }
  },
);

const initialState = {
  loading: false,
  homeworks: [],
  uncompletedHomeworks: [], // Boshlang'ich qiymat doim massiv
  error: null,
  loaded: false,
};

const homeworkSlice = createSlice({
  name: "homework",
  initialState,
  reducers: {
    clearHomeworks: (state) => {
      state.homeworks = [];
      state.uncompletedHomeworks = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHomeworks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHomeworks.fulfilled, (state, action) => {
        state.loading = false;

        const payloadData = action.payload?.homeworks || action.payload;

        if (
          payloadData &&
          typeof payloadData === "object" &&
          !Array.isArray(payloadData)
        ) {
          state.homeworks = payloadData.all || [];
          state.uncompletedHomeworks = payloadData.uncompleted || [];
        } else if (Array.isArray(payloadData)) {
          state.homeworks = payloadData;
          state.uncompletedHomeworks = payloadData;
        } else {
          state.homeworks = [];
          state.uncompletedHomeworks = [];
        }

        state.error = null;
        state.loaded = true;
      })
      .addCase(fetchHomeworks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.homeworks = [];
        state.uncompletedHomeworks = [];
      });
  },
});

export const { clearHomeworks } = homeworkSlice.actions;
export default homeworkSlice.reducer;
