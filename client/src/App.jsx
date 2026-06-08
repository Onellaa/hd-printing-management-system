import { Navigate, Route, Routes } from "react-router-dom";
import { ChequeFormPage } from "./pages/ChequeFormPage";
import { useAuth } from "./context/AuthContext";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { CreateInvoicePage } from "./pages/CreateInvoicePage";
import { CustomerFormPage } from "./pages/CustomerFormPage";
import { CustomersPage } from "./pages/CustomersPage";
import { DashboardPage } from "./pages/DashboardPage";
import { InvoiceDetailPage } from "./pages/InvoiceDetailPage";
import { InvoicesPage } from "./pages/InvoicesPage";
import { ItemFormPage } from "./pages/ItemFormPage";
import { ItemsPage } from "./pages/ItemsPage";
import { LoginPage } from "./pages/LoginPage";
import { PaymentFormPage } from "./pages/PaymentFormPage";
import { PaymentsChequesPage } from "./pages/PaymentsChequesPage";
import { PurchaseOrderFormPage } from "./pages/PurchaseOrderFormPage";
import { PurchaseOrdersPage } from "./pages/PurchaseOrdersPage";
import { ReportsPage } from "./pages/ReportsPage";
import { SettingsPage } from "./pages/SettingsPage";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="customers/new" element={<CustomerFormPage />} />
        <Route path="customers/:id/edit" element={<CustomerFormPage />} />
        <Route path="items" element={<ItemsPage />} />
        <Route path="items/new" element={<ItemFormPage />} />
        <Route path="items/:id/edit" element={<ItemFormPage />} />
        <Route path="purchase-orders" element={<PurchaseOrdersPage />} />
        <Route path="purchase-orders/new" element={<PurchaseOrderFormPage />} />
        <Route path="purchase-orders/:id/edit" element={<PurchaseOrderFormPage />} />
        <Route path="invoices" element={<InvoicesPage />} />
        <Route path="invoices/new" element={<CreateInvoicePage />} />
        <Route path="invoices/:id" element={<InvoiceDetailPage />} />
        <Route path="invoices/:id/edit" element={<CreateInvoicePage />} />
        <Route path="payments-cheques" element={<PaymentsChequesPage />} />
        <Route path="payments-cheques/payments/new" element={<PaymentFormPage />} />
        <Route path="payments-cheques/payments/:id/edit" element={<PaymentFormPage />} />
        <Route path="payments-cheques/cheques/new" element={<ChequeFormPage />} />
        <Route path="payments-cheques/cheques/:id/edit" element={<ChequeFormPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}
