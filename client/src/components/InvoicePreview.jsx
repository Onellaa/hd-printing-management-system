import { formatCurrency, formatDate } from "../utils/formatters";

export const InvoicePreview = ({ customer, invoiceForm, items, totals }) => (
  <div className="invoice-preview-shell">
    <div className="invoice-preview no-print">
      <div className="preview-header">
        <div>
          <p className="page-label">Invoice Preview</p>
          <h3>{customer?.companyName || "Select a customer"}</h3>
        </div>
        <div className="preview-meta">
          <span>Invoice Date: {formatDate(invoiceForm.invoiceDate)}</span>
          <span>Credit Period: {invoiceForm.creditPeriodDays || 0} days</span>
        </div>
      </div>
    </div>

    <div className="invoice-page invoice-preview-page">
      <div className="invoice-print-card">
        <div className="invoice-print-header">
          <div className="invoice-brand">
            <div className="invoice-brand-mark">HD</div>
            <div>
              <h2>HD PRINTING & PACKAGING (PVT) LTD.</h2>
              <p>Excellence in Printing & Packaging</p>
            </div>
          </div>
          <div className="invoice-print-meta">
            <h1>INVOICE</h1>
            <div className="invoice-number-chip">Preview</div>
            <div className="invoice-meta-grid">
              <span>Invoice Date</span>
              <strong>{formatDate(invoiceForm.invoiceDate)}</strong>
              <span>Credit Period</span>
              <strong>{invoiceForm.creditPeriodDays || 0} Days</strong>
            </div>
          </div>
        </div>

        <div className="invoice-info-panels">
          <div className="invoice-info-box">
            <h4>Invoice To</h4>
            <strong>{customer?.companyName || "Select customer"}</strong>
          </div>
          <div className="invoice-info-box">
            <h4>Invoice Notes</h4>
            <p>{invoiceForm.notes || "-"}</p>
          </div>
        </div>

        <table className="invoice-table">
          <thead>
            <tr>
              <th className="col-small">#</th>
              <th className="col-code">Item Code</th>
              <th className="col-description">Description</th>
              <th className="col-qty">Quantity</th>
              <th className="col-unit">Unit</th>
              <th className="col-price">Unit Price</th>
              <th className="col-amount">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={`${item.description}-${index}`}>
                <td className="col-small">{index + 1}</td>
                <td className="col-code">{item.itemCode || "-"}</td>
                <td className="col-description">{item.description || `Line item ${index + 1}`}</td>
                <td className="col-qty number-cell">{item.quantity || 0}</td>
                <td className="col-unit">{item.unit || "NO'S"}</td>
                <td className="col-price price-cell">{formatCurrency(item.unitPrice || 0)}</td>
                <td className="col-amount amount-cell">{formatCurrency(item.amount || 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="invoice-totals-box">
          <div><span>Total Without VAT</span><strong className="total-value">{formatCurrency(totals.subtotalWithoutVat)}</strong></div>
          <div><span>VAT 18%</span><strong className="total-value">{formatCurrency(totals.vatAmount)}</strong></div>
          <div className="grand-total"><span>Total With VAT</span><strong className="total-value">{formatCurrency(totals.totalWithVat)}</strong></div>
        </div>
      </div>
    </div>
  </div>
);
