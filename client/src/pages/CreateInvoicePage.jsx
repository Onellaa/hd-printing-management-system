import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { http } from "../api/http";
import { BackButton } from "../components/BackButton";
import { InvoicePreview } from "../components/InvoicePreview";
import { PageSection } from "../components/PageSection";
import { useToast } from "../context/ToastContext";

const blankLine = { itemId: "", description: "", quantity: 1, unitPrice: 0, amount: 0 };

const calculateTotals = (items) => {
  const normalized = items.map((item) => ({
    ...item,
    amount: Number(item.quantity || 0) * Number(item.unitPrice || 0),
  }));
  const subtotalWithoutVat = normalized.reduce((sum, item) => sum + item.amount, 0);
  const vatAmount = subtotalWithoutVat * 0.18;
  const totalWithVat = subtotalWithoutVat + vatAmount;

  return {
    items: normalized,
    subtotalWithoutVat,
    vatAmount,
    totalWithVat,
  };
};

export const CreateInvoicePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const toast = useToast();
  const [customers, setCustomers] = useState([]);
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    customerId: "",
    purchaseOrderId: "",
    invoiceDate: new Date().toISOString().slice(0, 10),
    creditPeriodDays: 0,
    notes: "",
    status: "DRAFT",
    items: [blankLine],
  });

  useEffect(() => {
    const loadData = async () => {
      const [customerResponse, itemResponse] = await Promise.all([
        http.get("/customers?status=ACTIVE"),
        http.get("/items"),
      ]);
      setCustomers(customerResponse.data);
      setItems(itemResponse.data);
    };

    loadData();
  }, []);

  useEffect(() => {
    if (!isEdit) return;

    const loadInvoice = async () => {
      const response = await http.get(`/invoices/${id}`);
      setForm({
        customerId: response.data.customerId,
        purchaseOrderId: response.data.purchaseOrderId || "",
        invoiceDate: response.data.invoiceDate?.slice(0, 10) || "",
        creditPeriodDays: response.data.creditPeriodDays || 0,
        notes: response.data.notes || "",
        status: response.data.status,
        items: response.data.items.map((item) => ({
          itemId: item.itemId || "",
          description: item.description,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
          amount: Number(item.amount),
        })),
      });
    };

    loadInvoice();
  }, [id, isEdit]);

  const selectedCustomer = useMemo(
    () => customers.find((customer) => customer.id === form.customerId),
    [customers, form.customerId]
  );

  useEffect(() => {
    if (!selectedCustomer) return;
    setForm((current) => ({
      ...current,
      creditPeriodDays: selectedCustomer.creditPeriodDays,
    }));
  }, [selectedCustomer]);

  const totals = useMemo(() => calculateTotals(form.items), [form.items]);

  const updateLine = (index, field, value) => {
    setForm((current) => ({
      ...current,
      items: current.items.map((item, lineIndex) =>
        lineIndex === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addLine = () => {
    setForm((current) => ({ ...current, items: [...current.items, blankLine] }));
  };

  const handleSubmit = async (nextStatus) => {
    try {
      if (isEdit) {
        await http.put(`/invoices/${id}`, {
          ...form,
          status: nextStatus,
          items: totals.items,
        });
        toast.success("Invoice updated successfully.");
      } else {
        await http.post("/invoices", {
          ...form,
          status: nextStatus,
          items: totals.items,
        });
        toast.success("Invoice created successfully.");
      }
      navigate("/invoices");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to save invoice.");
    }
  };

  return (
    <div className="invoice-page">
      <PageSection
        title={isEdit ? "Edit Invoice" : "Create Invoice"}
        leading={<BackButton to="/invoices" />}
      >
        <div className="invoice-editor">
          <div className="invoice-form-panel">
            <div className="form-grid">
              <label>
                Customer
                <select
                  value={form.customerId}
                  onChange={(e) => setForm({ ...form, customerId: e.target.value })}
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
                Invoice Date
                <input
                  type="date"
                  value={form.invoiceDate}
                  onChange={(e) => setForm({ ...form, invoiceDate: e.target.value })}
                />
              </label>
              <label className="full-width">
                Notes
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </label>
            </div>

            <div className="line-items-card">
              <div className="section-header">
                <h3>Invoice Items</h3>
                <button type="button" className="secondary-button" onClick={addLine}>
                  Add Line
                </button>
              </div>

              {form.items.map((line, index) => (
                <div className="line-item-row" key={index}>
                  <select value={line.itemId} onChange={(e) => updateLine(index, "itemId", e.target.value)}>
                    <option value="">Select item</option>
                    {items.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                  <input
                    placeholder="Description"
                    value={line.description}
                    onChange={(e) => updateLine(index, "description", e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="Qty"
                    value={line.quantity}
                    onChange={(e) => updateLine(index, "quantity", Number(e.target.value))}
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Unit price"
                    value={line.unitPrice}
                    onChange={(e) => updateLine(index, "unitPrice", Number(e.target.value))}
                  />
                  <div className="line-amount">{(Number(line.quantity || 0) * Number(line.unitPrice || 0)).toFixed(2)}</div>
                </div>
              ))}
            </div>

            <div className="button-row">
              <button type="button" className="secondary-button" onClick={() => handleSubmit("DRAFT")}>
                Save Draft
              </button>
              {!isEdit ? (
                <button type="button" className="primary-button" onClick={() => handleSubmit("ISSUED")}>
                  Save & Issue
                </button>
              ) : null}
            </div>
          </div>

          <InvoicePreview
            customer={selectedCustomer}
            invoiceForm={form}
            items={totals.items}
            totals={totals}
          />
        </div>
      </PageSection>
    </div>
  );
};
