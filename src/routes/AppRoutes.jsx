import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import OTPVerify from '../pages/OTPVerify';
import AdminRegister from '../pages/AdminRegister';
import AdminDashboard from '../pages/AdminDashboard';
import ManageUsers from '../pages/ManageUsers';
import WorkerDashboard from '../pages/WorkerDashboard';
import FilesPage from '../components/FilesPage';
import AuditLogPage from '../pages/AuditLogPage';
import ExecutiveDashboard from '../pages/ExecutiveDashboard';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/verify-otp" element={<OTPVerify />} />
      <Route path="/register-admin" element={<AdminRegister />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/manage-users" element={<ManageUsers />} />
      <Route path="/files" element={<FilesPage />} /> {/* Add this new route */}
      <Route path="/worker/dashboard" element={<WorkerDashboard />} />
      <Route path="//executive/dashboard" element={<ExecutiveDashboard />} />
      <Route path="/audit-logs" element={<AuditLogPage />} />
    </Routes>
  );
}
