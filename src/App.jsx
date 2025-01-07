import React from 'react';
import { Route, HashRouter as Router, Routes } from "react-router-dom";
import { NotFound, Login, Dashboard, ContentManager, BeajOperations, WhatsappLogs, PromptPlayground, UsersData, PurchaseCourse } from "./pages";
import { SidebarProvider } from './components/SidebarContext';
import ProtectedRoute from './components/ProtectedRoute';

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
              <ProtectedRoute allowedRoles={['facilitator', 'admin']}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/whatsapp-logs"
            element={
              <ProtectedRoute allowedRoles={['facilitator', 'admin']}>
                <WhatsappLogs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/purchase-course"
            element={
              <ProtectedRoute allowedRoles={['facilitator', 'admin']}>
                <PurchaseCourse />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/content-manager"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ContentManager />
              </ProtectedRoute>
            }
          />
          <Route
            path="/beaj-operations"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <BeajOperations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/prompt-playground"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <PromptPlayground />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users-data"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <UsersData />
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
