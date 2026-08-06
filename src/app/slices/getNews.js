import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../components/api/axios";

export const getNews = createAsyncThunk(
  "getNews/news",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/news", {
        headers: {
          "Content-Type": "application/json",
        },
      });

      return response.data;
    } catch (error) {
      console.log("error-news", error);
      return rejectWithValue("Error occurred while fetching news");
    }
  },
);

export const toggleNewsLike = createAsyncThunk(
  "news/toggleLike",
  async ({ newsId, userId }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/news/${newsId}/toggle-like`, { userId });
      return response.data;
    } catch (error) {
      return rejectWithValue("Error toggling like");
    }
  },
);

const initialState = {
  news: [],
  loading: false,
  error: false,
  loaded: false,
};

const newsSlice = createSlice({
  name: "news",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getNews.pending, (state) => {
        state.loading = true;
      })
      .addCase(getNews.fulfilled, (state, action) => {
        state.loading = false;
        state.news = action.payload?.news || action.payload || [];
        state.error = false;
        state.loaded = true;
      })
      .addCase(getNews.rejected, (state) => {
        state.loading = false;
        state.error = true;
      })
      .addCase(toggleNewsLike.fulfilled, (state, action) => {
        const updatedNews = action.payload;
        if (updatedNews && updatedNews.id) {
          const index = state.news.findIndex((n) => n.id === updatedNews.id);
          if (index !== -1) {
            state.news[index] = updatedNews;
          }
        }
      });
  },
});

export default newsSlice.reducer;
