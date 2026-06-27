import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { useState, useEffect } from "react";
import { isAuthenticated } from "./lib/auth";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import BrowserExtension from "./pages/BrowserExtension";
import Jobs from "./pages/Jobs";
import JobForm from "./pages/JobForm";
import Analytics from "./pages/Analytics";
import CapturedJobsPage from "./pages/CapturedJobsPage";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./components/AppLayout";
import ScrollToTop from "./components/ScrollToTop";

// React Router v7 future flags
const futureFlags = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      refetchInterval: 3000, // Background poll every 3 seconds for seamless real-time updates
      retry: 1,
    },
  },
});

function AutoSyncQueries() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleJobSaved = () => {
      queryClient.invalidateQueries();
    };

    window.addEventListener("hustlemap:job_saved", handleJobSaved);

    const handleMessage = (event) => {
      if (event.data?.type === "HUSTLEMAP_JOB_SAVED") {
        queryClient.invalidateQueries();
      }
    };
    window.addEventListener("message", handleMessage);

    const handleStorage = (e) => {
      if (e.key === "hustlemap_last_job_saved") {
        queryClient.invalidateQueries();
      }
    };
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("hustlemap:job_saved", handleJobSaved);
      window.removeEventListener("message", handleMessage);
      window.removeEventListener("storage", handleStorage);
    };
  }, [queryClient]);

  return null;
}

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
      <AutoSyncQueries />
      <BrowserRouter future={futureFlags}>
        <ScrollToTop />
        <div className="min-h-screen bg-background">
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
              path="/extension"
              element={
                <ProtectedRoute isAuth={isAuth}>
                  <AppLayout onLogout={() => setIsAuth(false)}>
                    <BrowserExtension />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute isAuth={isAuth}>
                  <AppLayout onLogout={() => setIsAuth(false)}>
                    <Analytics />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/captured"
              element={
                <ProtectedRoute isAuth={isAuth}>
                  <AppLayout onLogout={() => setIsAuth(false)}>
                    <CapturedJobsPage />
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
