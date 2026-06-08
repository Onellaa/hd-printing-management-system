import { Link, useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { http } from "../api/http";
import { ActionButtons } from "../components/ActionButtons";
import { ConfirmDeleteModal } from "../components/ConfirmDeleteModal";
import { DataTable } from "../components/DataTable";
import { PageSection } from "../components/PageSection";
import { StatCard } from "../components/StatCard";
import { StatusBadge } from "../components/StatusBadge";
import { useToast } from "../context/ToastContext";
import { formatCurrency, formatDate } from "../utils/formatters";

const tabs = [
  { key: "payments", label: "Payments" },
  { key: "cheques", label: "Cheques" },
];

export const PaymentsChequesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") === "cheques" ? "cheques" : "payments";
  const [payments, setPayments] = useState([]);
  const [cheques, setCheques] = useState([]);
  const [confirmState, setConfirmState] = useState(null);
  const toast = useToast();

  useEffect(() => {
    refreshLists();
  }, []);

  const refreshLists = async () => {
    const [paymentResponse, chequeResponse] = await Promise.all([
      http.get("/payments"),
      http.get("/cheques"),
    ]);
    setPayments(paymentResponse.data);
    setCheques(chequeResponse.data);
  };

  const paymentSummary = useMemo(() => {
    const totalAmount = payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
    const today = new Date().toISOString().slice(0, 10);
    const todayCount = payments.filter(
      (payment) => new Date(payment.paymentDate).toISOString().slice(0, 10) === today
    ).length;

    return {
      totalPayments: payments.length,
      totalAmount,
      todayCount,
      latestPayment: payments[0]?.amount || 0,
    };
  }, [payments]);

  const chequeSummary = useMemo(() => {
    const pending = cheques.filter((cheque) => cheque.status === "PENDING");
    const deposited = cheques.filter((cheque) => cheque.status === "DEPOSITED");
    const upcoming = pending.filter((cheque) => {
      const chequeDate = new Date(cheque.chequeDate);
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);
      return chequeDate >= today && chequeDate <= nextWeek;
    });

    return {
      totalCheques: cheques.length,
      pendingCount: pending.length,
      depositedCount: deposited.length,
      upcomingCount: upcoming.length,
      reminders: upcoming,
    };
  }, [cheques]);

  const handleDelete = async () => {
    if (!confirmState) return;

    try {
      const response =
        confirmState.type === "payment"
          ? await http.delete(`/payments/${confirmState.record.id}`)
          : await http.delete(`/cheques/${confirmState.record.id}`);

      toast.success(response.data.message || "Record deleted successfully.");
      setConfirmState(null);
      refreshLists();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to delete record.");
    }
  };

  return (
    <div className="page-grid">
      <section className="page-intro">
        <div>
          <p className="page-label">Cheques & Payments</p>
          <h2 className="page-title">Cheques & Payments</h2>
          <p className="helper-text">
            Manage payments, cheques, deposits and reminders.
          </p>
        </div>
      </section>

      <div className="tab-bar">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={activeTab === tab.key ? "tab-button active" : "tab-button"}
            onClick={() => setSearchParams({ tab: tab.key })}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "payments" ? (
        <>
          <section className="stats-grid dashboard-stats">
            <StatCard label="Total Payments" value={paymentSummary.totalPayments} hint="Recorded receipts" icon="TP" />
            <StatCard
              label="Total Collected"
              value={formatCurrency(paymentSummary.totalAmount)}
              tone="success"
              hint="Collected this period"
              icon="TC"
            />
            <StatCard label="Payments Today" value={paymentSummary.todayCount} hint="Captured today" icon="TD" />
            <StatCard
              label="Latest Payment"
              value={formatCurrency(paymentSummary.latestPayment)}
              tone="warning"
              hint="Most recent entry"
              icon="LP"
            />
          </section>

          <PageSection
            title="Payments"
            action={
              <Link className="primary-button" to="/payments-cheques/payments/new">
                Record Payment
              </Link>
            }
          >
            <DataTable
              columns={[
                { key: "paymentDate", label: "Date", render: (row) => formatDate(row.paymentDate) },
                { key: "customer", label: "Customer", render: (row) => row.customer?.companyName },
                { key: "invoice", label: "Invoice", render: (row) => row.invoice?.invoiceNumber },
                { key: "amount", label: "Amount", render: (row) => formatCurrency(row.amount) },
                { key: "method", label: "Method" },
                { key: "referenceNo", label: "Reference" },
                {
                  key: "actions",
                  label: "Action",
                  render: (row) => (
                    <ActionButtons
                      viewTo={`/payments-cheques/payments/${row.id}/edit`}
                      editTo={`/payments-cheques/payments/${row.id}/edit`}
                      onDelete={() => setConfirmState({ type: "payment", record: row })}
                    />
                  ),
                },
              ]}
              rows={payments}
            />
          </PageSection>
        </>
      ) : (
        <>
          <section className="stats-grid dashboard-stats">
            <StatCard label="Total Cheques" value={chequeSummary.totalCheques} hint="All cheque records" icon="TC" />
            <StatCard label="Pending" value={chequeSummary.pendingCount} tone="warning" hint="Awaiting collection" icon="PN" />
            <StatCard label="Deposited" value={chequeSummary.depositedCount} tone="success" hint="Already deposited" icon="DP" />
            <StatCard label="Due Soon" value={chequeSummary.upcomingCount} tone="danger" hint="Upcoming reminders" icon="DS" />
          </section>

          <PageSection
            title="Cheque Reminders"
            action={
              <Link className="primary-button" to="/payments-cheques/cheques/new">
                Record Cheque
              </Link>
            }
          >
            <DataTable
              columns={[
                { key: "chequeNo", label: "Cheque No" },
                { key: "customer", label: "Customer", render: (row) => row.customer?.companyName },
                { key: "bankName", label: "Bank" },
                { key: "chequeDate", label: "Cheque Date", render: (row) => formatDate(row.chequeDate) },
                { key: "amount", label: "Amount", render: (row) => formatCurrency(row.amount) },
              ]}
              rows={chequeSummary.reminders}
              emptyMessage="No cheque reminders for the next 7 days."
            />
          </PageSection>

          <PageSection title="Cheques">
            <DataTable
              columns={[
                { key: "chequeNo", label: "Cheque No" },
                { key: "bankName", label: "Bank" },
                { key: "customer", label: "Customer", render: (row) => row.customer?.companyName },
                { key: "chequeDate", label: "Cheque Date", render: (row) => formatDate(row.chequeDate) },
                { key: "amount", label: "Amount", render: (row) => formatCurrency(row.amount) },
                { key: "status", label: "Status", render: (row) => <StatusBadge status={row.status} /> },
                {
                  key: "actions",
                  label: "Action",
                  render: (row) => (
                    <ActionButtons
                      viewTo={`/payments-cheques/cheques/${row.id}/edit`}
                      editTo={`/payments-cheques/cheques/${row.id}/edit`}
                      onDelete={() => setConfirmState({ type: "cheque", record: row })}
                    />
                  ),
                },
              ]}
              rows={cheques}
            />
          </PageSection>
        </>
      )}
      <ConfirmDeleteModal
        isOpen={Boolean(confirmState)}
        onCancel={() => setConfirmState(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
};
