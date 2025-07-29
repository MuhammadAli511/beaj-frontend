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
  UserProgress,
  PaymentVerification,
  AIServices
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
              <ProtectedRoute allowedRoles={["facilitator", "admin", "kid-lesson-creator", "teacher-lesson-creator"]}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/whatsapp-logs"
            element={
              <ProtectedRoute allowedRoles={["facilitator", "admin", "kid-lesson-creator", "teacher-lesson-creator"]}>
                <WhatsappLogs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/purchase-course"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <PurchaseCourse />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment-verification"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <PaymentVerification />
              </ProtectedRoute>
            }
          />
          <Route
            path="/last-active-users"
            element={
              <ProtectedRoute allowedRoles={["facilitator", "admin", "kid-lesson-creator", "teacher-lesson-creator"]}>
                <LastActiveUsers />
              </ProtectedRoute>
            }
          />
          {/* Admin Routes */}
          <Route
            path="/content-manager"
            element={
              <ProtectedRoute allowedRoles={["admin", "kid-lesson-creator", "teacher-lesson-creator"]}>
                <ContentManager />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user-feedback"
            element={
              <ProtectedRoute allowedRoles={["facilitator", "admin", "kid-lesson-creator", "teacher-lesson-creator"]}>
                <UserFeedback />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user-responses"
            element={
              <ProtectedRoute allowedRoles={["facilitator", "admin", "kid-lesson-creator", "teacher-lesson-creator"]}>
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
              <ProtectedRoute allowedRoles={["facilitator", "admin", "kid-lesson-creator", "teacher-lesson-creator"]}>
                <UsersData />
              </ProtectedRoute>
            }
          />
           <Route
            path="/user-progress"
            element={
              <ProtectedRoute allowedRoles={["facilitator", "admin", "kid-lesson-creator", "teacher-lesson-creator"]}>
                <UserProgress />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ai-services"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AIServices />
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
