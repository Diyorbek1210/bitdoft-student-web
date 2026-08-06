import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./components/auth/Login";
import Homeworks from "./components/pages/Homeworks";
import SubmitHomework from "./components/pages/SingleHomework";
import Dashboard from "./components/Layout/Dashboard";
import Library from "./components/pages/Library";
import Rating from "./components/pages/Rating";
import News from "./components/pages/News";
import LearnTask from "./components/pages/LearnTask";
import TestPage from "./components/pages/TestPage";

const PrivateRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem("studentID");
  return isAuthenticated ? children : <Navigate to="/" />;
};

export default function App() {
  return (
    <div className="min-h-screen bg-[#F3F7FA]">
      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          path="/homeworks"
          element={
            <PrivateRoute>
              <Homeworks />
            </PrivateRoute>
          }
        />
        <Route
          path="/news"
          element={
            <PrivateRoute>
              <News />
            </PrivateRoute>
          }
        />
        <Route
          path="/library"
          element={
            <PrivateRoute>
              <Library />
            </PrivateRoute>
          }
        />
        <Route
          path="/rating"
          element={
            <PrivateRoute>
              <Rating />
            </PrivateRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/submit-homework"
          element={
            <PrivateRoute>
              <SubmitHomework />
            </PrivateRoute>
          }
        />

        <Route
          path="/learn/:taskId"
          element={
            <PrivateRoute>
              <LearnTask />
            </PrivateRoute>
          }
        />
        <Route
          path="/learn/:taskId/test"
          element={
            <PrivateRoute>
              <TestPage />
            </PrivateRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
