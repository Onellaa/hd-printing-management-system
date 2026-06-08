import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { http } from "../api/http";
import { BackButton } from "../components/BackButton";
import { PageSection } from "../components/PageSection";
import { StatusBadge } from "../components/StatusBadge";
import { formatCurrency, formatDate } from "../utils/formatters";

export const InvoiceDetailPage = () => {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);

  useEffect(() => {
    const loadInvoice = async () => {
      const response = await http.get(`/invoices/${id}`);
      setInvoice(response.data);
    };

    loadInvoice();
  }, [id]);

  const markPaid = async () => {
    const response = await http.post(`/invoices/${id}/mark-paid`);
    setInvoice(response.data);
  };

  const issueInvoice = async () => {
    const response = await http.post(`/invoices/${id}/issue`);
    setInvoice(response.data);
  };

  const openPdf = async () => {
    const response = await http.get(`/invoices/${id}/pdf`, {
      responseType: "blob",
    });

    const pdfUrl = URL.createObjectURL(
      new Blob([response.data], { type: "application/pdf" })
    );
    window.open(pdfUrl, "_blank", "noopener,noreferrer");
  };

  if (!invoice) {
    return <p>Loading invoice...</p>;
  }

  return (
    <PageSection
      title={`Invoice ${invoice.invoiceNumber}`}
      leading={<BackButton to="/invoices" />}
      action={
        <div className="button-row no-print">
          <button className="secondary-button no-print" onClick={openPdf}>
            Print / PDF
          </button>
          {invoice.status === "DRAFT" ? (
            <button className="primary-button no-print" onClick={issueInvoice}>
              Issue Invoice
            </button>
          ) : null}
          {invoice.status !== "PAID" ? (
            <button className="primary-button no-print" onClick={markPaid}>
              Mark Paid
            </button>
          ) : null}
        </div>
      }
    >
      <div className="detail-grid">
        <div className="detail-card">
          <p>Customer</p>
          <h3>{invoice.customer?.companyName}</h3>
          <p>{invoice.customer?.contactPerson}</p>
          <p>{invoice.customer?.phone}</p>
        </div>
        <div className="detail-card">
          <p>Status</p>
          <StatusBadge status={invoice.status} />
          <p>Invoice Date: {formatDate(invoice.invoiceDate)}</p>
          <p>Due Date: {formatDate(invoice.dueDate)}</p>
        </div>
      </div>

      <div className="line-items-card">
        {invoice.items.map((item) => (
          <div className="preview-item-row" key={item.id}>
            <span>{item.description}</span>
            <span>{item.quantity}</span>
            <span>{formatCurrency(item.unitPrice)}</span>
            <strong>{formatCurrency(item.amount)}</strong>
          </div>
        ))}
      </div>

      <div className="preview-totals compact">
        <div>
          <span>Total Without VAT</span>
          <strong>{formatCurrency(invoice.subtotalWithoutVat)}</strong>
        </div>
        <div>
          <span>VAT 18%</span>
          <strong>{formatCurrency(invoice.vatAmount)}</strong>
        </div>
        <div className="grand-total">
          <span>Total With VAT</span>
          <strong>{formatCurrency(invoice.totalWithVat)}</strong>
        </div>
      </div>
    </PageSection>
  );
};
