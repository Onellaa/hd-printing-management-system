import { Link } from "react-router-dom";
import { http } from "../api/http";
import { ActionButtons } from "../components/ActionButtons";
import { ConfirmDeleteModal } from "../components/ConfirmDeleteModal";
import { DataTable } from "../components/DataTable";
import { PageSection } from "../components/PageSection";
import { StatusBadge } from "../components/StatusBadge";
import { useToast } from "../context/ToastContext";
import { useFetch } from "../hooks/useFetch";
import { formatCurrency, formatDate } from "../utils/formatters";
import { useState } from "react";

export const InvoicesPage = () => {
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const toast = useToast();
  const { data, loading, error, refetch } = useFetch(() => http.get("/invoices"), []);

  const handleDelete = async () => {
    if (!selectedInvoice) return;

    try {
      const response = await http.delete(`/invoices/${selectedInvoice.id}`);
      toast.success(response.data.message || "Invoice updated successfully.");
      setSelectedInvoice(null);
      refetch();
    } catch (requestError) {
      toast.error(
        requestError.response?.data?.message || "Unable to update invoice."
      );
    }
  };

  return (
    <>
      <PageSection title="Invoices" action={<Link className="primary-button" to="/invoices/new">Create Invoice</Link>}>
        {loading ? <p>Loading invoices...</p> : null}
        {error ? <p className="error-text">{error}</p> : null}
        <DataTable
          columns={[
            { key: "invoiceNumber", label: "Invoice No" },
            { key: "customer", label: "Customer", render: (row) => row.customer?.companyName },
            { key: "invoiceDate", label: "Date", render: (row) => formatDate(row.invoiceDate) },
            { key: "dueDate", label: "Due Date", render: (row) => formatDate(row.dueDate) },
            { key: "totalWithVat", label: "Total", render: (row) => formatCurrency(row.totalWithVat) },
            { key: "status", label: "Status", render: (row) => <StatusBadge status={row.status} /> },
            {
              key: "actions",
              label: "Action",
              render: (row) => (
                <ActionButtons
                  viewTo={`/invoices/${row.id}`}
                  editTo={`/invoices/${row.id}/edit`}
                  disableEdit={row.status !== "DRAFT"}
                  onDelete={() => setSelectedInvoice(row)}
                  deleteLabel={row.status === "DRAFT" ? "Delete" : "Void"}
                  disableDelete={row.status === "PAID" || row.status === "CANCELLED"}
                />
              ),
            },
          ]}
          rows={data}
        />
      </PageSection>
      <ConfirmDeleteModal
        isOpen={Boolean(selectedInvoice)}
        title={selectedInvoice?.status === "DRAFT" ? "Delete Invoice" : "Void Invoice"}
        message="Are you sure you want to delete this record? This action cannot be undone."
        confirmLabel={selectedInvoice?.status === "DRAFT" ? "Delete" : "Void Invoice"}
        onCancel={() => setSelectedInvoice(null)}
        onConfirm={handleDelete}
      />
    </>
  );
};
