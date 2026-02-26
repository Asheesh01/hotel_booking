import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import RoomList from './pages/RoomList';
import BookingForm from './pages/BookingForm';
import BookingHistory from './pages/BookingHistory';
import RebookPage from './pages/RebookPage';
import AdminRoomManagement from './pages/AdminRoomManagement';
import ReceptionDashboard from './pages/ReceptionDashboard';
import './index.css';

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/" element={<Navigate to="/rooms" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/rooms" element={<RoomList />} />

        {/* User protected */}
        <Route path="/book/:id" element={
          <ProtectedRoute>
            <BookingForm />
          </ProtectedRoute>
        } />
        <Route path="/bookings/my" element={
          <ProtectedRoute>
            <BookingHistory />
          </ProtectedRoute>
        } />
        <Route path="/bookings/:reservationNumber/rebook" element={
          <ProtectedRoute>
            <RebookPage />
          </ProtectedRoute>
        } />

        {/* Admin protected */}
        <Route path="/admin/rooms" element={
          <ProtectedRoute requiredRole="ADMIN">
            <AdminRoomManagement />
          </ProtectedRoute>
        } />

        {/* Reception protected */}
        <Route path="/reception" element={
          <ProtectedRoute requiredRole="RECEPTION">
            <ReceptionDashboard />
          </ProtectedRoute>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/rooms" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

