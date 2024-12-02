import React from 'react';
import { Route, HashRouter as Router, Routes } from "react-router-dom";
import { NotFound, Login, Dashboard, ContentManager, BeajOperations, WhatsappLogs, PromptPlayground, UsersData, PurchaseCourse } from "./pages";
import { SidebarProvider } from './components/SidebarContext';

function App() {

  return (
    <Router>
      <SidebarProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/content-manager" element={<ContentManager />} />
          <Route path="/beaj-operations" element={<BeajOperations />} />
          <Route path="/prompt-playground" element={<PromptPlayground />} />
          <Route path="/users-data" element={<UsersData />} />
          <Route path="/whatsapp-logs" element={<WhatsappLogs />} />
          <Route path="/purchase-course" element={<PurchaseCourse />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </SidebarProvider>
    </Router>
  );
}

export default App;