import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bot } from 'lucide-react';

export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-canvas space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-primary-hover flex items-center justify-center text-white shadow-glow-violet animate-bounce">
          <Bot className="w-6 h-6" />
        </div>
        <span className="text-xs font-mono text-neutral-slate">Restoring Robot Session...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

