import React from 'react';
import { Route, HashRouter as Router, Routes } from "react-router-dom";
import { NotFound, Login, Dashboard, ContentManager, UserData, BeajOperations, ChatbotLogs } from "./pages";
import ProtectedRoute from './components/Auth/ProtectedRoute';
import { SidebarProvider } from './components/SidebarContext';

function App() {
  var isAuthenticated = localStorage.getItem('token') ? true : false;

  return (
    <Router>
      <SidebarProvider> {/* Wrap all routes inside SidebarProvider */}
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/content-manager" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <ContentManager />
            </ProtectedRoute>
          } />
          <Route path="/user-data" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <UserData />
            </ProtectedRoute>
          } />
          <Route path="/beaj-operations" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <BeajOperations />
            </ProtectedRoute>
          } />
          <Route path="/chatbot-logs" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <ChatbotLogs />
            </ProtectedRoute>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </SidebarProvider>
    </Router>
  );
}

export default App;