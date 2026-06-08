import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { http } from "../api/http";
import { BackButton } from "../components/BackButton";
import { PageSection } from "../components/PageSection";
import { useToast } from "../context/ToastContext";

const initialForm = {
  companyName: "",
  contactPerson: "",
  phone: "",
  email: "",
  address: "",
  creditPeriodDays: 30,
  creditLimit: 0,
  status: "ACTIVE",
};

export const CustomerFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [searchParams] = useSearchParams();
  const toast = useToast();
  const [form, setForm] = useState(initialForm);
  const isViewMode = searchParams.get("mode") === "view";
  const isInactive = form.status === "INACTIVE";
  const disableEditing = isViewMode || isInactive;

  const pageTitle = useMemo(() => {
    if (!isEdit) return "Add Customer";
    if (isViewMode || isInactive) return "View Customer";
    return "Edit Customer";
  }, [isEdit, isInactive, isViewMode]);

  useEffect(() => {
    if (!isEdit) return;

    const loadCustomer = async () => {
      const response = await http.get(`/customers/${id}`);
      setForm(response.data);
    };

    loadCustomer();
  }, [id, isEdit]);

  useEffect(() => {
    if (isEdit && isInactive && !isViewMode) {
      toast.error(
        "This customer is inactive. Please reactivate the customer before editing."
      );
    }
  }, [isEdit, isInactive, isViewMode, toast]);

  const handleChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      if (isEdit) {
        if (isInactive) {
          toast.error(
            "This customer is inactive. Please reactivate the customer before editing."
          );
          return;
        }
        await http.put(`/customers/${id}`, form);
        toast.success("Customer updated successfully.");
      } else {
        await http.post("/customers", form);
        toast.success("Customer created successfully.");
      }

      navigate("/customers");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to save customer.");
    }
  };

  return (
    <PageSection
      title={pageTitle}
      leading={<BackButton to="/customers" />}
    >
      {isInactive ? (
        <p className="form-notice">
          This customer is inactive. Please reactivate the customer before editing.
        </p>
      ) : null}
      <form className="form-grid" onSubmit={handleSubmit}>
        <label>
          Company Name
          <input value={form.companyName} onChange={(e) => handleChange("companyName", e.target.value)} required disabled={disableEditing} />
        </label>
        <label>
          Contact Person
          <input value={form.contactPerson || ""} onChange={(e) => handleChange("contactPerson", e.target.value)} disabled={disableEditing} />
        </label>
        <label>
          Phone
          <input value={form.phone || ""} onChange={(e) => handleChange("phone", e.target.value)} disabled={disableEditing} />
        </label>
        <label>
          Email
          <input type="email" value={form.email || ""} onChange={(e) => handleChange("email", e.target.value)} disabled={disableEditing} />
        </label>
        <label className="full-width">
          Address
          <textarea value={form.address || ""} onChange={(e) => handleChange("address", e.target.value)} disabled={disableEditing} />
        </label>
        <label>
          Credit Period Days
          <input type="number" value={form.creditPeriodDays} onChange={(e) => handleChange("creditPeriodDays", Number(e.target.value))} disabled={disableEditing} />
        </label>
        <label>
          Credit Limit
          <input type="number" step="0.01" value={form.creditLimit} onChange={(e) => handleChange("creditLimit", Number(e.target.value))} disabled={disableEditing} />
        </label>
        <label>
          Status
          <select value={form.status} onChange={(e) => handleChange("status", e.target.value)} disabled>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </label>

        {!disableEditing ? (
          <button className="primary-button full-width">
            {isEdit ? "Update Customer" : "Save Customer"}
          </button>
        ) : null}
      </form>
    </PageSection>
  );
};
