import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { http } from "../api/http";
import { BackButton } from "../components/BackButton";
import { PageSection } from "../components/PageSection";
import { useToast } from "../context/ToastContext";

const initialForm = {
  itemCode: "",
  name: "",
  description: "",
  unit: "",
  defaultUnitPrice: 0,
  status: "ACTIVE",
};

export const ItemFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const toast = useToast();
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    if (!isEdit) return;

    const loadItem = async () => {
      const response = await http.get(`/items/${id}`);
      setForm(response.data);
    };

    loadItem();
  }, [id, isEdit]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      if (isEdit) {
        await http.put(`/items/${id}`, form);
        toast.success("Item updated successfully.");
      } else {
        await http.post("/items", form);
        toast.success("Item created successfully.");
      }

      navigate("/items");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to save item.");
    }
  };

  return (
    <PageSection
      title={isEdit ? "Edit Item" : "Add Item"}
      leading={<BackButton to="/items" />}
    >
      <form className="form-grid" onSubmit={handleSubmit}>
        <label>
          Item Code
          <input
            value={form.itemCode}
            onChange={(e) => setForm({ ...form, itemCode: e.target.value })}
            required
          />
        </label>
        <label>
          Name
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </label>
        <label>
          Unit
          <input
            value={form.unit}
            onChange={(e) => setForm({ ...form, unit: e.target.value })}
            required
          />
        </label>
        <label>
          Default Unit Price
          <input
            type="number"
            step="0.01"
            value={form.defaultUnitPrice}
            onChange={(e) =>
              setForm({ ...form, defaultUnitPrice: Number(e.target.value) })
            }
          />
        </label>
        <label className="full-width">
          Description
          <textarea
            value={form.description || ""}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </label>
        <label>
          Status
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </label>

        <button className="primary-button full-width">
          {isEdit ? "Update Item" : "Save Item"}
        </button>
      </form>
    </PageSection>
  );
};
