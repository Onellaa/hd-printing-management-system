import { Link } from "react-router-dom";
import { http } from "../api/http";
import { ConfirmDeleteModal } from "../components/ConfirmDeleteModal";
import { DataTable } from "../components/DataTable";
import { PageSection } from "../components/PageSection";
import { StatusBadge } from "../components/StatusBadge";
import { useToast } from "../context/ToastContext";
import { useFetch } from "../hooks/useFetch";
import { formatCurrency } from "../utils/formatters";
import { useState } from "react";
import { StatCard } from "../components/StatCard";

export const CustomersPage = () => {
  const [modalState, setModalState] = useState(null);
  const toast = useToast();
  const { data, loading, error, refetch } = useFetch(() => http.get("/customers"), []);
  const selectedCustomer = data[0];
  const activeCount = data.filter((customer) => customer.status === "ACTIVE").length;
  const inactiveCount = data.filter((customer) => customer.status === "INACTIVE").length;
  const averageCreditDays = data.length
    ? Math.round(
        data.reduce((sum, customer) => sum + Number(customer.creditPeriodDays || 0), 0) /
          data.length
      )
    : 0;

  const handleCustomerStatusChange = async () => {
    if (!modalState?.customer) return;

    try {
      const response =
        modalState.type === "reactivate"
          ? await http.post(`/customers/${modalState.customer.id}/reactivate`)
          : await http.post(`/customers/${modalState.customer.id}/deactivate`);

      toast.success(response.data.message || "Customer updated successfully.");
      setModalState(null);
      refetch();
    } catch (requestError) {
      toast.error(
        requestError.response?.data?.message || "Unable to update customer."
      );
    }
  };

  return (
    <>
      <section className="page-intro">
        <div>
          <p className="page-label">Customers</p>
          <h2 className="page-title">Customers</h2>
          <p className="helper-text">Manage your customer records, credit terms, and account status in one place.</p>
        </div>
        <Link className="primary-button" to="/customers/new">Add Customer</Link>
      </section>

      <section className="stats-grid dashboard-stats">
        <StatCard label="Total Customers" value={data.length} hint="All customer records" icon="TC" />
        <StatCard label="Active Customers" value={activeCount} tone="success" hint="Available for new invoices" icon="AC" />
        <StatCard label="Inactive Customers" value={inactiveCount} hint="Kept for historical records" icon="IC" />
        <StatCard label="Average Credit Days" value={averageCreditDays} tone="info" hint="Across all customers" icon="CD" />
      </section>

      <div className="dashboard-content-grid">
        <PageSection title="Customer Directory">
          {loading ? <p>Loading customers...</p> : null}
          {error ? <p className="error-text">{error}</p> : null}
          <DataTable
            columns={[
              { key: "companyName", label: "Customer Name" },
              { key: "contactPerson", label: "Contact Person" },
              { key: "phone", label: "Phone" },
              { key: "email", label: "Email" },
              { key: "creditPeriodDays", label: "Credit Period", render: (row) => `${row.creditPeriodDays} Days` },
              { key: "creditLimit", label: "Credit Limit", render: (row) => formatCurrency(row.creditLimit) },
              { key: "status", label: "Status", render: (row) => <StatusBadge status={row.status} /> },
              {
                key: "actions",
                label: "Action",
                render: (row) =>
                  row.status === "INACTIVE" ? (
                    <div className="action-group">
                      <Link className="text-action" to={`/customers/${row.id}/edit?mode=view`}>
                        View
                      </Link>
                      <button
                        type="button"
                        className="text-action"
                        onClick={() => setModalState({ type: "reactivate", customer: row })}
                      >
                        Reactivate
                      </button>
                    </div>
                  ) : (
                    <div className="action-group">
                      <Link className="text-action" to={`/customers/${row.id}/edit?mode=view`}>
                        View
                      </Link>
                      <Link className="text-action" to={`/customers/${row.id}/edit`}>
                        Edit
                      </Link>
                      <button
                        type="button"
                        className="text-action danger"
                        onClick={() => setModalState({ type: "deactivate", customer: row })}
                      >
                        Deactivate
                      </button>
                    </div>
                  ),
              },
            ]}
            rows={data}
          />
        </PageSection>

        <div className="dashboard-side-stack">
          <PageSection title="Customer Spotlight">
            {selectedCustomer ? (
              <div className="detail-panel">
                <div className="customer-spotlight-header">
                  <div className="customer-avatar">{selectedCustomer.companyName.slice(0, 2).toUpperCase()}</div>
                  <div>
                    <h4>{selectedCustomer.companyName}</h4>
                    <p>{selectedCustomer.contactPerson || "Primary contact not set"}</p>
                  </div>
                  <StatusBadge status={selectedCustomer.status} />
                </div>
                <div className="detail-list">
                  <div><span>Phone</span><strong>{selectedCustomer.phone || "-"}</strong></div>
                  <div><span>Email</span><strong>{selectedCustomer.email || "-"}</strong></div>
                  <div><span>Credit Period</span><strong>{selectedCustomer.creditPeriodDays} Days</strong></div>
                  <div><span>Credit Limit</span><strong>{formatCurrency(selectedCustomer.creditLimit)}</strong></div>
                  <div><span>Address</span><strong>{selectedCustomer.address || "-"}</strong></div>
                </div>
              </div>
            ) : (
              <p className="helper-text">No customers yet.</p>
            )}
          </PageSection>
        </div>
      </div>
      <ConfirmDeleteModal
        isOpen={Boolean(modalState)}
        title={
          modalState?.type === "reactivate"
            ? "Reactivate Customer"
            : "Deactivate Customer"
        }
        message={
          modalState?.type === "reactivate"
            ? "Are you sure you want to reactivate this customer?"
            : "Are you sure you want to deactivate this customer? This customer will no longer be available for new invoices, but past records will be kept."
        }
        confirmLabel={modalState?.type === "reactivate" ? "Reactivate" : "Deactivate"}
        isDanger={modalState?.type !== "reactivate"}
        onCancel={() => setModalState(null)}
        onConfirm={handleCustomerStatusChange}
      />
    </>
  );
};
