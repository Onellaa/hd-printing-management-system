import { http } from "../api/http";
import { DataTable } from "../components/DataTable";
import { PageSection } from "../components/PageSection";
import { StatCard } from "../components/StatCard";
import { StatusBadge } from "../components/StatusBadge";
import { useFetch } from "../hooks/useFetch";
import { formatCurrency, formatDate } from "../utils/formatters";
import { Link } from "react-router-dom";

export const DashboardPage = () => {
  const { data, loading, error } = useFetch(() => http.get("/reports/dashboard-summary"), []);

  const cards = data.cards || {};

  return (
    <div className="page-grid">
      <section className="stats-grid dashboard-stats">
        <StatCard label="Total Invoices" value={cards.totalInvoices || 0} hint="This month" icon="IV" />
        <StatCard
          label="Outstanding Amount"
          value={formatCurrency(cards.outstandingAmount || 0)}
          tone="warning"
          hint="Pending collections"
          icon="OS"
        />
        <StatCard label="Paid Invoices" value={cards.paidInvoices || 0} tone="success" hint="Successfully settled" icon="PD" />
        <StatCard label="Upcoming Cheques" value={cards.upcomingCheques || 0} tone="info" hint="Next 30 days" icon="CH" />
        <StatCard label="Overdue Invoices" value={cards.overdueInvoices || 0} tone="danger" hint="Need follow-up" icon="OD" />
      </section>

      {loading ? <p>Loading dashboard...</p> : null}
      {error ? <p className="error-text">{error}</p> : null}

      <div className="dashboard-content-grid">
        <PageSection
          title="Recent Invoices"
          action={<Link className="ghost-link" to="/invoices">View All Invoices</Link>}
        >
          <DataTable
            columns={[
              { key: "invoiceNumber", label: "Invoice No" },
              { key: "customer", label: "Customer", render: (row) => row.customer?.companyName },
              { key: "invoiceDate", label: "Invoice Date", render: (row) => formatDate(row.invoiceDate) },
              { key: "dueDate", label: "Due Date", render: (row) => formatDate(row.dueDate) },
              { key: "totalWithVat", label: "Amount", render: (row) => formatCurrency(row.totalWithVat) },
              { key: "status", label: "Status", render: (row) => <StatusBadge status={row.status} /> },
            ]}
            rows={data.recentInvoices || []}
          />
        </PageSection>

        <div className="dashboard-side-stack">
          <PageSection
            title="Cheque Reminders"
            action={<Link className="ghost-link" to="/payments-cheques?tab=cheques">View All Cheques</Link>}
          >
            <div className="mini-list">
              {(data.chequeReminders || []).map((cheque) => (
                <div key={cheque.id} className="mini-list-row">
                  <div className="mini-date">
                    <span>{formatDate(cheque.chequeDate).split("/")[0]}</span>
                  </div>
                  <div className="mini-content">
                    <strong>{cheque.customer?.companyName}</strong>
                    <p>Cheque No. {cheque.chequeNo}</p>
                  </div>
                  <div className="mini-amount danger-text">{formatCurrency(cheque.amount)}</div>
                </div>
              ))}
            </div>
          </PageSection>

          <PageSection
            title="Recent Payments"
            action={<Link className="ghost-link" to="/payments-cheques?tab=payments">View All Payments</Link>}
          >
            <div className="mini-list">
              {(data.recentPayments || []).map((payment) => (
                <div key={payment.id} className="mini-list-row">
                  <div className="mini-status success-dot" />
                  <div className="mini-content">
                    <strong>{payment.customer?.companyName}</strong>
                    <p>{formatDate(payment.paymentDate)} via {payment.method}</p>
                  </div>
                  <div className="mini-amount success-text">{formatCurrency(payment.amount)}</div>
                </div>
              ))}
            </div>
          </PageSection>
        </div>
      </div>

      <PageSection title="Quick Actions">
        <div className="quick-actions-grid">
          <Link className="quick-action-card coral" to="/invoices/new">Create Invoice</Link>
          <Link className="quick-action-card amber" to="/purchase-orders/new">New Purchase Order</Link>
          <Link className="quick-action-card green" to="/customers/new">Add Customer</Link>
          <Link className="quick-action-card lilac" to="/payments-cheques/cheques/new">Record Cheque</Link>
          <Link className="quick-action-card rose" to="/payments-cheques/payments/new">Record Payment</Link>
          <Link className="quick-action-card gold" to="/reports">View Reports</Link>
        </div>
      </PageSection>
    </div>
  );
};
