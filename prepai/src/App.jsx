import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";
import Landing from "./pages/landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/dashboard";
import Session from "./pages/Session";
// import Interview from "./pages/Interview";
import Report from "./pages/Report";
import Coach from "./pages/Coach";
import Interview from "./features/interview/Interview";
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "var(--blue-light)", fontSize: 16, fontWeight: 600 }}>
        Prep<span style={{ color: "#fff" }}>AI</span>
      </div>
    </div>
  );
  return user ? children : <Navigate to="/login" replace state={{ from: location }} />;
};

const AppRoutes = () => {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Landing />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
      <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
      <Route path="/session" element={<ProtectedRoute><Layout><Session /></Layout></ProtectedRoute>} />
      {/* <Route path="/interview" element={<ProtectedRoute><Layout><Interview /></Layout></ProtectedRoute>} /> */}

      // After fix
<Route path="/interview" element={<ProtectedRoute><Layout><Interview key={Date.now()} /></Layout></ProtectedRoute>} />
      <Route path="/report"    element={<ProtectedRoute><Layout><Report /></Layout></ProtectedRoute>} />
      <Route path="/coach"     element={<ProtectedRoute><Layout><Coach /></Layout></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  </BrowserRouter>
);

export default App;
