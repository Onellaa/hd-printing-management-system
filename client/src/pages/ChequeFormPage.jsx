import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { http } from "../api/http";
import { BackButton } from "../components/BackButton";
import { PageSection } from "../components/PageSection";
import { useToast } from "../context/ToastContext";

export const ChequeFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const toast = useToast();
  const [customers, setCustomers] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [form, setForm] = useState({
    customerId: "",
    invoiceId: "",
    chequeNo: "",
    bankName: "",
    chequeDate: new Date().toISOString().slice(0, 10),
    depositDate: "",
    amount: 0,
    status: "PENDING",
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

    const loadCheque = async () => {
      const response = await http.get(`/cheques/${id}`);
      setForm({
        customerId: response.data.customerId,
        invoiceId: response.data.invoiceId || "",
        chequeNo: response.data.chequeNo,
        bankName: response.data.bankName,
        chequeDate: response.data.chequeDate?.slice(0, 10) || "",
        depositDate: response.data.depositDate?.slice(0, 10) || "",
        amount: Number(response.data.amount),
        status: response.data.status,
        notes: response.data.notes || "",
      });
    };

    loadCheque();
  }, [id, isEdit]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      if (isEdit) {
        await http.put(`/cheques/${id}`, {
          ...form,
          invoiceId: form.invoiceId || null,
          depositDate: form.depositDate || null,
        });
        toast.success("Cheque updated successfully.");
      } else {
        await http.post("/cheques", {
          ...form,
          invoiceId: form.invoiceId || null,
          depositDate: form.depositDate || null,
        });
        toast.success("Cheque recorded successfully.");
      }
      navigate("/payments-cheques?tab=cheques");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to save cheque.");
    }
  };

  return (
    <PageSection
      title={isEdit ? "Edit Cheque" : "Record Cheque"}
      leading={<BackButton to="/payments-cheques?tab=cheques" />}
    >
      <form className="form-grid" onSubmit={handleSubmit}>
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
          Invoice
          <select
            value={form.invoiceId}
            onChange={(e) => setForm({ ...form, invoiceId: e.target.value })}
          >
            <option value="">Optional invoice</option>
            {invoices.map((invoice) => (
              <option key={invoice.id} value={invoice.id}>
                {invoice.invoiceNumber}
              </option>
            ))}
          </select>
        </label>
        <label>
          Cheque No
          <input
            value={form.chequeNo}
            onChange={(e) => setForm({ ...form, chequeNo: e.target.value })}
            required
          />
        </label>
        <label>
          Bank Name
          <input
            value={form.bankName}
            onChange={(e) => setForm({ ...form, bankName: e.target.value })}
            required
          />
        </label>
        <label>
          Cheque Date
          <input
            type="date"
            value={form.chequeDate}
            onChange={(e) => setForm({ ...form, chequeDate: e.target.value })}
            required
          />
        </label>
        <label>
          Deposit Date
          <input
            type="date"
            value={form.depositDate}
            onChange={(e) => setForm({ ...form, depositDate: e.target.value })}
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
          Status
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            <option value="PENDING">Pending</option>
            <option value="DEPOSITED">Deposited</option>
            <option value="RETURNED">Returned</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </label>
        <label className="full-width">
          Notes
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </label>
        <button className="primary-button full-width">Save Cheque</button>
      </form>
    </PageSection>
  );
};
