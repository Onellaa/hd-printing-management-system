import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { http } from "../api/http";
import { BackButton } from "../components/BackButton";
import { PageSection } from "../components/PageSection";
import { useToast } from "../context/ToastContext";

const blankItem = { itemId: "", description: "", quantity: 1, unitPrice: 0 };

export const PurchaseOrderFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const toast = useToast();
  const [customers, setCustomers] = useState([]);
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    poNumber: "",
    customerId: "",
    poDate: new Date().toISOString().slice(0, 10),
    deliveryDate: "",
    status: "DRAFT",
    notes: "",
    items: [blankItem],
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

    const loadOrder = async () => {
      const response = await http.get(`/purchase-orders/${id}`);
      setForm({
        poNumber: response.data.poNumber,
        customerId: response.data.customerId,
        poDate: response.data.poDate?.slice(0, 10) || "",
        deliveryDate: response.data.deliveryDate?.slice(0, 10) || "",
        status: response.data.status,
        notes: response.data.notes || "",
        items: response.data.items.map((item) => ({
          itemId: item.itemId,
          description: item.description,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
        })),
      });
    };

    loadOrder();
  }, [id, isEdit]);

  const updateLineItem = (index, field, value) => {
    setForm((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addLine = () => {
    setForm((current) => ({ ...current, items: [...current.items, blankItem] }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      if (isEdit) {
        await http.put(`/purchase-orders/${id}`, form);
        toast.success("Purchase order updated successfully.");
      } else {
        await http.post("/purchase-orders", form);
        toast.success("Purchase order created successfully.");
      }

      navigate("/purchase-orders");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to save purchase order."
      );
    }
  };

  return (
    <PageSection
      title={isEdit ? "Edit Purchase Order" : "Create Purchase Order"}
      leading={<BackButton to="/purchase-orders" />}
    >
      <form className="form-grid" onSubmit={handleSubmit}>
        <label>
          PO Number
          <input value={form.poNumber} onChange={(e) => setForm({ ...form, poNumber: e.target.value })} required />
        </label>
        <label>
          Customer
          <select value={form.customerId} onChange={(e) => setForm({ ...form, customerId: e.target.value })} required>
            <option value="">Select customer</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.companyName}
              </option>
            ))}
          </select>
        </label>
        <label>
          PO Date
          <input type="date" value={form.poDate} onChange={(e) => setForm({ ...form, poDate: e.target.value })} />
        </label>
        <label>
          Delivery Date
          <input type="date" value={form.deliveryDate} onChange={(e) => setForm({ ...form, deliveryDate: e.target.value })} />
        </label>
        <label>
          Status
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            <option value="DRAFT">Draft</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </label>
        <label className="full-width">
          Notes
          <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </label>

        <div className="line-items-card full-width">
          <div className="section-header">
            <h3>PO Items</h3>
            <button type="button" className="secondary-button" onClick={addLine}>
              Add Line
            </button>
          </div>
          {form.items.map((line, index) => (
            <div className="line-item-row" key={index}>
              <select value={line.itemId} onChange={(e) => updateLineItem(index, "itemId", e.target.value)}>
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
                onChange={(e) => updateLineItem(index, "description", e.target.value)}
              />
              <input
                type="number"
                placeholder="Qty"
                value={line.quantity}
                onChange={(e) => updateLineItem(index, "quantity", Number(e.target.value))}
              />
              <input
                type="number"
                step="0.01"
                placeholder="Unit price"
                value={line.unitPrice}
                onChange={(e) => updateLineItem(index, "unitPrice", Number(e.target.value))}
              />
            </div>
          ))}
        </div>

        <button className="primary-button full-width">
          {isEdit ? "Update Purchase Order" : "Save Purchase Order"}
        </button>
      </form>
    </PageSection>
  );
};
