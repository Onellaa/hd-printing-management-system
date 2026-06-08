import { useEffect, useState } from "react";
import { http } from "../api/http";
import { PageSection } from "../components/PageSection";

const defaultForm = {
  companyName: "HD Printing & Packaging",
  companyTagline: "",
  address: "",
  phone: "",
  email: "",
  taxNumber: "",
  website: "",
  invoicePrefix: "INV",
  bankName: "",
  bankAccountName: "",
  bankAccountNumber: "",
  paymentInstructions: "",
  authorizedByName: "",
  authorizedByTitle: "",
  signatureText: "",
  footerNote: "",
};

export const SettingsPage = () => {
  const [form, setForm] = useState(defaultForm);

  useEffect(() => {
    const loadProfile = async () => {
      const response = await http.get("/settings/company-profile");
      if (response.data) {
        setForm(response.data);
      }
    };

    loadProfile();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    await http.put("/settings/company-profile", form);
  };

  return (
    <PageSection title="Company Profile">
      <form className="form-grid" onSubmit={handleSubmit}>
        <label>
          Company Name
          <input value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} />
        </label>
        <label>
          Company Tagline
          <input value={form.companyTagline || ""} onChange={(e) => setForm({ ...form, companyTagline: e.target.value })} />
        </label>
        <label>
          Phone
          <input value={form.phone || ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </label>
        <label>
          Email
          <input value={form.email || ""} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </label>
        <label>
          Invoice Prefix
          <input value={form.invoicePrefix || "INV"} onChange={(e) => setForm({ ...form, invoicePrefix: e.target.value })} />
        </label>
        <label className="full-width">
          Address
          <textarea value={form.address || ""} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        </label>
        <label>
          Tax Number
          <input value={form.taxNumber || ""} onChange={(e) => setForm({ ...form, taxNumber: e.target.value })} />
        </label>
        <label>
          Website
          <input value={form.website || ""} onChange={(e) => setForm({ ...form, website: e.target.value })} />
        </label>
        <label>
          Bank Name
          <input value={form.bankName || ""} onChange={(e) => setForm({ ...form, bankName: e.target.value })} />
        </label>
        <label>
          Bank Account Name
          <input value={form.bankAccountName || ""} onChange={(e) => setForm({ ...form, bankAccountName: e.target.value })} />
        </label>
        <label>
          Bank Account Number
          <input value={form.bankAccountNumber || ""} onChange={(e) => setForm({ ...form, bankAccountNumber: e.target.value })} />
        </label>
        <label>
          Authorized By Title
          <input value={form.authorizedByTitle || ""} onChange={(e) => setForm({ ...form, authorizedByTitle: e.target.value })} />
        </label>
        <label>
          Authorized By Name
          <input value={form.authorizedByName || ""} onChange={(e) => setForm({ ...form, authorizedByName: e.target.value })} />
        </label>
        <label>
          Signature Text
          <input value={form.signatureText || ""} onChange={(e) => setForm({ ...form, signatureText: e.target.value })} />
        </label>
        <label className="full-width">
          Payment Instructions
          <textarea value={form.paymentInstructions || ""} onChange={(e) => setForm({ ...form, paymentInstructions: e.target.value })} />
        </label>
        <label className="full-width">
          Footer Note
          <textarea value={form.footerNote || ""} onChange={(e) => setForm({ ...form, footerNote: e.target.value })} />
        </label>
        <button className="primary-button full-width">Save Profile</button>
      </form>
    </PageSection>
  );
};
