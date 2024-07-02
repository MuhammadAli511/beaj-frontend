import { Route, HashRouter as Router, Routes } from "react-router-dom";
import { NotFound, Login, Dashboard, ContentManager, UserData, BeajOperations, ChatbotLogs } from "./pages";
import ProtectedRoute from './components/Auth/ProtectedRoute';

function App() {
  var isAuthenticated = localStorage.getItem('token') ? true : false;

  return (
    <Router>
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
    </Router>
  )
}

export default App;