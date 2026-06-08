import { Link } from "react-router-dom";
import { http } from "../api/http";
import { ActionButtons } from "../components/ActionButtons";
import { ConfirmDeleteModal } from "../components/ConfirmDeleteModal";
import { DataTable } from "../components/DataTable";
import { PageSection } from "../components/PageSection";
import { StatusBadge } from "../components/StatusBadge";
import { useToast } from "../context/ToastContext";
import { useFetch } from "../hooks/useFetch";
import { formatDate } from "../utils/formatters";
import { useState } from "react";
import { StatCard } from "../components/StatCard";

export const PurchaseOrdersPage = () => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const toast = useToast();
  const { data, loading, error, refetch } = useFetch(() => http.get("/purchase-orders"), []);
  const focusOrder = data[0];
  const openOrders = data.filter((order) => ["DRAFT", "CONFIRMED"].includes(order.status)).length;
  const completedOrders = data.filter((order) => order.status === "COMPLETED").length;

  const handleDelete = async () => {
    if (!selectedOrder) return;

    try {
      const response = await http.delete(`/purchase-orders/${selectedOrder.id}`);
      toast.success(response.data.message || "Purchase order deleted successfully.");
      setSelectedOrder(null);
      refetch();
    } catch (requestError) {
      toast.error(
        requestError.response?.data?.message || "Unable to delete purchase order."
      );
    }
  };

  return (
    <>
      <section className="page-intro">
        <div>
          <p className="page-label">Purchase Orders</p>
          <h2 className="page-title">Purchase Orders</h2>
          <p className="helper-text">Manage and track all purchase orders with clean operational visibility.</p>
        </div>
        <Link className="primary-button" to="/purchase-orders/new">Create PO</Link>
      </section>

      <section className="stats-grid dashboard-stats">
        <StatCard label="Total POs" value={data.length} hint="All purchase orders" icon="TP" />
        <StatCard label="Open POs" value={openOrders} tone="warning" hint="Need action or delivery" icon="OP" />
        <StatCard label="Completed" value={completedOrders} tone="success" hint="Closed successfully" icon="CP" />
        <StatCard label="Due for Delivery" value={data.filter((order) => order.deliveryDate).length} tone="danger" hint="Scheduled deliveries" icon="DL" />
      </section>

      <div className="dashboard-content-grid">
        <PageSection title="Purchase Order List">
          {loading ? <p>Loading purchase orders...</p> : null}
          {error ? <p className="error-text">{error}</p> : null}
          <DataTable
            columns={[
              { key: "poNumber", label: "PO No." },
              { key: "customer", label: "Customer", render: (row) => row.customer?.companyName },
              { key: "poDate", label: "PO Date", render: (row) => formatDate(row.poDate) },
              { key: "deliveryDate", label: "Delivery Date", render: (row) => formatDate(row.deliveryDate) },
              { key: "status", label: "Status", render: (row) => <StatusBadge status={row.status} /> },
              {
                key: "actions",
                label: "Action",
                render: (row) => (
                  <ActionButtons
                    viewTo={`/purchase-orders/${row.id}/edit`}
                    editTo={`/purchase-orders/${row.id}/edit`}
                    onDelete={() => setSelectedOrder(row)}
                  />
                ),
              },
            ]}
            rows={data}
          />
        </PageSection>

        <div className="dashboard-side-stack">
          <PageSection title="PO Summary">
            {focusOrder ? (
              <div className="detail-panel">
                <div className="detail-list">
                  <div><span>PO Number</span><strong>{focusOrder.poNumber}</strong></div>
                  <div><span>Customer</span><strong>{focusOrder.customer?.companyName || "-"}</strong></div>
                  <div><span>PO Date</span><strong>{formatDate(focusOrder.poDate)}</strong></div>
                  <div><span>Delivery Date</span><strong>{formatDate(focusOrder.deliveryDate)}</strong></div>
                  <div><span>Status</span><strong>{focusOrder.status}</strong></div>
                  <div><span>Total Items</span><strong>{focusOrder.items?.length || 0}</strong></div>
                </div>
                {focusOrder.notes ? <p className="helper-text">{focusOrder.notes}</p> : null}
              </div>
            ) : (
              <p className="helper-text">No purchase orders available.</p>
            )}
          </PageSection>
        </div>
      </div>
      <ConfirmDeleteModal
        isOpen={Boolean(selectedOrder)}
        onCancel={() => setSelectedOrder(null)}
        onConfirm={handleDelete}
      />
    </>
  );
};
