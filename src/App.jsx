import React from "react";
import { Route, HashRouter as Router, Routes } from "react-router-dom";
import {
  NotFound,
  Login,
  Dashboard,
  ContentManager,
  WhatsappLogs,
  PromptPlayground,
  UsersData,
  PurchaseCourse,
  AddUsers,
  LastActiveUsers,
  UserFeedback,
  UserResponses,
  UserProgress
} from "./pages";
import { SidebarProvider } from "./components/SidebarContext";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <SidebarProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Login />} />

          {/* Facilitator Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={["facilitator", "admin"]}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/whatsapp-logs"
            element={
              <ProtectedRoute allowedRoles={["facilitator", "admin"]}>
                <WhatsappLogs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/purchase-course"
            element={
              <ProtectedRoute allowedRoles={["facilitator", "admin"]}>
                <PurchaseCourse />
              </ProtectedRoute>
            }
          />
          <Route
            path="/last-active-users"
            element={
              <ProtectedRoute allowedRoles={["facilitator", "admin"]}>
                <LastActiveUsers />
              </ProtectedRoute>
            }
          />
          {/* Admin Routes */}
          <Route
            path="/content-manager"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <ContentManager />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user-feedback"
            element={
              <ProtectedRoute allowedRoles={["facilitator", "admin"]}>
                <UserFeedback />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user-responses"
            element={
              <ProtectedRoute allowedRoles={["facilitator", "admin"]}>
                <UserResponses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/add-users"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AddUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/prompt-playground"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <PromptPlayground />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users-data"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <UsersData />
              </ProtectedRoute>
            }
          />
           <Route
            path="/user-progress"
            element={
              <ProtectedRoute allowedRoles={["facilitator", "admin"]}>
                <UserProgress />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </SidebarProvider>
    </Router>
  );
}

export default App;
