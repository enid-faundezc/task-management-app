import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { TasksPage } from '../../pages/TasksPage';
import { LoginPage } from '../../pages/LoginPage';
import { TaskDetailPage } from '../../pages/TaskDetailPage';
import { ProtectedRoute } from './ProtectedRoute';

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected */}
        <Route element={<ProtectedRoute />}>
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/tasks/:id" element={<TaskDetailPage />} />
        </Route>

        {/* Default */}
        <Route path="*" element={<Navigate to="/tasks" replace />} />

      </Routes>
    </BrowserRouter>
  );
};