import React from 'react';
import { Route, HashRouter as Router, Routes } from "react-router-dom";
import { NotFound, Login, Dashboard, ContentManager, UserData, BeajOperations, ChatbotLogs, ChatbotStats } from "./pages";
import { SidebarProvider } from './components/SidebarContext';

function App() {

  return (
    <Router>
      <SidebarProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/content-manager" element={<ContentManager />} />
          <Route path="/user-data" element={<UserData />} />
          <Route path="/beaj-operations" element={<BeajOperations />} />
          <Route path="/chatbot-logs" element={<ChatbotLogs />} />
          <Route path="/chatbot-stats" element={<ChatbotStats />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </SidebarProvider>
    </Router>
  );
}

export default App;