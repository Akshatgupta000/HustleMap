import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { useState, useEffect } from "react";
import { isAuthenticated } from "./lib/auth";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Jobs from "./pages/Jobs";
import JobForm from "./pages/JobForm";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";

// React Router v7 future flags
const futureFlags = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  const [isAuth, setIsAuth] = useState(isAuthenticated());

  // Listen for storage changes (logout from other tabs, etc.)
  useEffect(() => {
    const handleStorageChange = () => {
      setIsAuth(isAuthenticated());
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter future={futureFlags}>
        <div
          className="min-h-screen"
          style={{
            backgroundImage: `
              linear-gradient(to right, #e5e7eb 1px, transparent 1px),
              linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
            backgroundColor: "#fafafa",
          }}
        >
          <Routes>
            <Route
              path="/"
              element={<Landing authState={{ isAuth, setIsAuth }} />}
            />
            <Route
              path="/login"
              element={
                isAuth ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <Login onLoginSuccess={() => setIsAuth(true)} />
                )
              }
            />
            <Route
              path="/register"
              element={
                isAuth ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <Register onRegisterSuccess={() => setIsAuth(true)} />
                )
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute isAuth={isAuth}>
                  <Navbar onLogout={() => setIsAuth(false)} />
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/jobs"
              element={
                <ProtectedRoute isAuth={isAuth}>
                  <Navbar onLogout={() => setIsAuth(false)} />
                  <Jobs />
                </ProtectedRoute>
              }
            />
            <Route
              path="/jobs/new"
              element={
                <ProtectedRoute isAuth={isAuth}>
                  <Navbar onLogout={() => setIsAuth(false)} />
                  <JobForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/jobs/edit/:id"
              element={
                <ProtectedRoute isAuth={isAuth}>
                  <Navbar onLogout={() => setIsAuth(false)} />
                  <JobForm />
                </ProtectedRoute>
              }
            />
          </Routes>
          <Toaster position="top-right" />
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
