import { configureStore } from '@reduxjs/toolkit';
import homeworkReducer from './slices/homework';
import news from './slices/getNews'
import submit from './slices/submitHomework'
import profile from './slices/profile'
import auth from './slices/auth'
import tasks from './slices/getTask'
import taskSubmit from './slices/submit'
import groupChats from './slices/groupChats'
export const store = configureStore({
  reducer: {
    homework: homeworkReducer,
    news:news,
    submit:submit,
    profile:profile,
    auth:auth,
    tasks:tasks,
    taskSubmit:taskSubmit,
    groupChats:groupChats,
  },
});
