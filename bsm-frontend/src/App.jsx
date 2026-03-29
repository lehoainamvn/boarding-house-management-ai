import { Routes, Route } from "react-router-dom";

/* AUTH */
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";

/* OWNER */
import Home from "./pages/owner/Home";
import Rooms from "./pages/owner/Rooms";
import RoomDetail from "./pages/owner/RoomDetail";
import RoomBill from "./pages/owner/RoomBill";
import Settings from "./pages/owner/Settings";
import Tenants from "./pages/owner/Tenants";
import Invoices from "./pages/owner/Invoices";
import InvoiceDetail from "./pages/owner/InvoiceDetail";
import Revenue from "./pages/owner/Revenue";
import MeterHistory from "./pages/owner/MeterHistory";
import Profile from "./pages/owner/Profile";
import ChangePassword from "./pages/owner/ChangePassword";
import Messages from "./pages/owner/Messages";
import RevenuePrediction from "./pages/owner/RevenuePrediction";

/* TENANT */
import TenantHome from "./pages/tenant/TenantHome";
import TenantRoom from "./pages/tenant/TenantRoom";
import TenantInvoices from "./pages/tenant/TenantInvoices";
import TenantContact from "./pages/tenant/TenantContact";
import TenantInvoiceDetail from "./pages/tenant/TenantInvoiceDetail";
import TenantStatistics from "./pages/tenant/TenantStatistics";
import TenantProfile from "./pages/tenant/TenantProfile";
import TenantChangePassword from "./pages/tenant/TenantChangePassword";
import PaymentReturn from "./pages/tenant/PaymentReturn";
/* LAYOUT */
import DashboardLayout from "./layouts/DashboardLayout";
import TenantLayout from "./layouts/TenantLayout";

/* PROTECT */
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <Routes>

      {/* AUTH */}
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot" element={<ForgotPassword />} />

      {/* ================= OWNER ================= */}
      <Route
        element={
          <ProtectedRoute role="OWNER">
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/home" element={<Home />} />
        <Route path="/rooms" element={<Rooms />} />
        <Route path="/rooms/:id" element={<RoomDetail />} />
        <Route path="/room-bill" element={<RoomBill />} />
        <Route path="/tenants" element={<Tenants />} />
        <Route path="/invoices" element={<Invoices />} />
        <Route path="/invoices/:id" element={<InvoiceDetail />} />
        <Route path="/revenue" element={<Revenue />} />
        <Route path="/meters" element={<MeterHistory />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/prediction" element={<RevenuePrediction />} />
        
      </Route>

      {/* ================= TENANT ================= */}
      <Route
        path="/tenant"
        element={
          <ProtectedRoute role="TENANT">
            <TenantLayout />
          </ProtectedRoute>
        }
      >
        <Route path="home" element={<TenantHome />} />
        <Route path="room" element={<TenantRoom />} />
        <Route path="invoices" element={<TenantInvoices />} />
        <Route path="contact" element={<TenantContact />} />
        <Route path="invoices/:id" element={<TenantInvoiceDetail />} />
        <Route path="payment-return" element={<PaymentReturn />} />
        <Route path="statistics" element={<TenantStatistics />} />
        <Route path="messages" element={<TenantContact />} />
        <Route path="profile" element={<TenantProfile />} />
        <Route path="change-password" element={<TenantChangePassword />} />
      </Route>

    </Routes>
  );
}