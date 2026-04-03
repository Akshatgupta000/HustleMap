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
import AppLayout from "./components/AppLayout";

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
  const [isAuth, setIsAuth] = useState(() => isAuthenticated());

  // Listen for storage changes (logout from other tabs, etc.)
  useEffect(() => {
    const handleStorageChange = () => {
      const auth = isAuthenticated();
      setIsAuth(auth);
    };

    window.addEventListener("storage", handleStorageChange);
    // Periodically sync auth state if needed, though storage listener is usually enough
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter future={futureFlags}>
        <div className="min-h-screen bg-notion-bg">
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
                  <AppLayout onLogout={() => setIsAuth(false)}>
                    <Dashboard />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/jobs"
              element={
                <ProtectedRoute isAuth={isAuth}>
                  <AppLayout onLogout={() => setIsAuth(false)}>
                    <Jobs />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/jobs/new"
              element={
                <ProtectedRoute isAuth={isAuth}>
                  <AppLayout onLogout={() => setIsAuth(false)}>
                    <JobForm />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/jobs/edit/:id"
              element={
                <ProtectedRoute isAuth={isAuth}>
                  <AppLayout onLogout={() => setIsAuth(false)}>
                    <JobForm />
                  </AppLayout>
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
