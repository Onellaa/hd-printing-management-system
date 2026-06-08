import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { http } from "../api/http";
import { BackButton } from "../components/BackButton";
import { PageSection } from "../components/PageSection";
import { useToast } from "../context/ToastContext";

export const PaymentFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const toast = useToast();
  const [customers, setCustomers] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [form, setForm] = useState({
    invoiceId: "",
    customerId: "",
    paymentDate: new Date().toISOString().slice(0, 10),
    amount: 0,
    method: "BANK_TRANSFER",
    referenceNo: "",
    notes: "",
  });

  useEffect(() => {
    const loadData = async () => {
      const [customerResponse, invoiceResponse] = await Promise.all([
        http.get("/customers?status=ACTIVE"),
        http.get("/invoices"),
      ]);
      setCustomers(customerResponse.data);
      setInvoices(invoiceResponse.data);
    };

    loadData();
  }, []);

  useEffect(() => {
    if (!isEdit) return;

    const loadPayment = async () => {
      const response = await http.get(`/payments/${id}`);
      setForm({
        invoiceId: response.data.invoiceId,
        customerId: response.data.customerId,
        paymentDate: response.data.paymentDate?.slice(0, 10) || "",
        amount: Number(response.data.amount),
        method: response.data.method,
        referenceNo: response.data.referenceNo || "",
        notes: response.data.notes || "",
      });
    };

    loadPayment();
  }, [id, isEdit]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      if (isEdit) {
        await http.put(`/payments/${id}`, form);
        toast.success("Payment updated successfully.");
      } else {
        await http.post("/payments", form);
        toast.success("Payment recorded successfully.");
      }
      navigate("/payments-cheques?tab=payments");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to save payment.");
    }
  };

  return (
    <PageSection
      title={isEdit ? "Edit Payment" : "Record Payment"}
      leading={<BackButton to="/payments-cheques?tab=payments" />}
    >
      <form className="form-grid" onSubmit={handleSubmit}>
        <label>
          Invoice
          <select
            value={form.invoiceId}
            onChange={(e) => {
              const invoice = invoices.find((entry) => entry.id === e.target.value);
              setForm((current) => ({
                ...current,
                invoiceId: e.target.value,
                customerId: invoice?.customerId || "",
                amount: invoice?.totalWithVat || 0,
              }));
            }}
            required
          >
            <option value="">Select invoice</option>
            {invoices.map((invoice) => (
              <option key={invoice.id} value={invoice.id}>
                {invoice.invoiceNumber} - {invoice.customer?.companyName}
              </option>
            ))}
          </select>
        </label>
        <label>
          Customer
          <select
            value={form.customerId}
            onChange={(e) => setForm({ ...form, customerId: e.target.value })}
            required
          >
            <option value="">Select customer</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.companyName}
              </option>
            ))}
          </select>
        </label>
        <label>
          Payment Date
          <input
            type="date"
            value={form.paymentDate}
            onChange={(e) => setForm({ ...form, paymentDate: e.target.value })}
            required
          />
        </label>
        <label>
          Amount
          <input
            type="number"
            step="0.01"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
            required
          />
        </label>
        <label>
          Method
          <select
            value={form.method}
            onChange={(e) => setForm({ ...form, method: e.target.value })}
          >
            <option value="BANK_TRANSFER">Bank Transfer</option>
            <option value="CASH">Cash</option>
            <option value="CHEQUE">Cheque</option>
            <option value="CARD">Card</option>
            <option value="OTHER">Other</option>
          </select>
        </label>
        <label>
          Reference No
          <input
            value={form.referenceNo}
            onChange={(e) => setForm({ ...form, referenceNo: e.target.value })}
          />
        </label>
        <label className="full-width">
          Notes
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </label>
        <button className="primary-button full-width">Save Payment</button>
      </form>
    </PageSection>
  );
};
