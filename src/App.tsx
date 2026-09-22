import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import LandingPage from "./pages/LandingPage";
import SystemReport from "./pages/SystemReport";
import { ThemeProvider } from "./context/ThemeContext";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const user = localStorage.getItem("nexus_user");
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

export default function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route path="/report" element={<SystemReport />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}
