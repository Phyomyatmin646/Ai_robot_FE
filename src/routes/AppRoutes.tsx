import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';
import { ProtectedRoute } from './ProtectedRoute';

import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { DevicesPage } from '../pages/devices/DevicesPage';
import { DeviceDetailPage } from '../pages/device-detail/DeviceDetailPage';
import { ConversationsPage } from '../pages/conversations/ConversationsPage';
import { AudioLibraryPage } from '../pages/audio/AudioLibraryPage';
import { TodoPage } from '../pages/todo/TodoPage';
import { RemindersPage } from '../pages/reminders/RemindersPage';
import { NotificationsPage } from '../pages/notifications/NotificationsPage';
import { KnowledgePage } from '../pages/knowledge/KnowledgePage';
import { McpToolsPage } from '../pages/mcp/McpToolsPage';
import { AnalyticsPage } from '../pages/analytics/AnalyticsPage';
import { SettingsPage } from '../pages/settings/SettingsPage';
import { SystemHealthPage } from '../pages/health/SystemHealthPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected Dashboard Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/devices" element={<DevicesPage />} />
          <Route path="/devices/:id" element={<DeviceDetailPage />} />
          <Route path="/conversations" element={<Navigate to="/" replace />} />
          <Route path="/audio" element={<AudioLibraryPage />} />
          <Route path="/todo" element={<TodoPage />} />
          <Route path="/reminders" element={<RemindersPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/knowledge" element={<KnowledgePage />} />
          <Route path="/mcp" element={<McpToolsPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/health" element={<SystemHealthPage />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

