import { http } from "../api/http";
import { DataTable } from "../components/DataTable";
import { PageSection } from "../components/PageSection";
import { StatusBadge } from "../components/StatusBadge";
import { useFetch } from "../hooks/useFetch";
import { formatCurrency, formatDate } from "../utils/formatters";

export const ReportsPage = () => {
  const outstanding = useFetch(() => http.get("/reports/outstanding-invoices"), []);
  const cheques = useFetch(() => http.get("/reports/cheque-reminders"), []);

  return (
    <div className="page-grid">
      <PageSection title="Outstanding Invoices">
        <DataTable
          columns={[
            { key: "invoiceNumber", label: "Invoice No" },
            { key: "customer", label: "Customer", render: (row) => row.customer?.companyName },
            { key: "dueDate", label: "Due Date", render: (row) => formatDate(row.dueDate) },
            { key: "totalWithVat", label: "Total", render: (row) => formatCurrency(row.totalWithVat) },
            { key: "status", label: "Status", render: (row) => <StatusBadge status={row.status} /> },
          ]}
          rows={outstanding.data}
        />
      </PageSection>

      <PageSection title="Cheque Reminders">
        <DataTable
          columns={[
            { key: "chequeNo", label: "Cheque No" },
            { key: "customer", label: "Customer", render: (row) => row.customer?.companyName },
            { key: "chequeDate", label: "Cheque Date", render: (row) => formatDate(row.chequeDate) },
            { key: "amount", label: "Amount", render: (row) => formatCurrency(row.amount) },
          ]}
          rows={cheques.data}
        />
      </PageSection>
    </div>
  );
};

