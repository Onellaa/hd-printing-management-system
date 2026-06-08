import { Link } from "react-router-dom";
import { useState } from "react";
import { http } from "../api/http";
import { ActionButtons } from "../components/ActionButtons";
import { ConfirmDeleteModal } from "../components/ConfirmDeleteModal";
import { DataTable } from "../components/DataTable";
import { PageSection } from "../components/PageSection";
import { StatusBadge } from "../components/StatusBadge";
import { useToast } from "../context/ToastContext";
import { useFetch } from "../hooks/useFetch";
import { formatCurrency } from "../utils/formatters";

export const ItemsPage = () => {
  const [selectedItem, setSelectedItem] = useState(null);
  const toast = useToast();
  const { data, loading, error, refetch } = useFetch(() => http.get("/items"), []);

  const handleDelete = async () => {
    if (!selectedItem) return;

    try {
      const response = await http.delete(`/items/${selectedItem.id}`);
      toast.success(response.data.message || "Item updated successfully.");
      setSelectedItem(null);
      refetch();
    } catch (requestError) {
      toast.error(requestError.response?.data?.message || "Unable to delete item.");
    }
  };

  return (
    <>
      <PageSection title="Items" action={<Link className="primary-button" to="/items/new">Add Item</Link>}>
        {loading ? <p>Loading items...</p> : null}
        {error ? <p className="error-text">{error}</p> : null}
        <DataTable
          columns={[
            { key: "itemCode", label: "Code" },
            { key: "name", label: "Name" },
            { key: "unit", label: "Unit" },
            { key: "defaultUnitPrice", label: "Unit Price", render: (row) => formatCurrency(row.defaultUnitPrice) },
            { key: "status", label: "Status", render: (row) => <StatusBadge status={row.status} /> },
            {
              key: "actions",
              label: "Action",
              render: (row) => (
                <ActionButtons
                  viewTo={`/items/${row.id}/edit`}
                  editTo={`/items/${row.id}/edit`}
                  onDelete={() => setSelectedItem(row)}
                />
              ),
            },
          ]}
          rows={data}
        />
      </PageSection>
      <ConfirmDeleteModal
        isOpen={Boolean(selectedItem)}
        onCancel={() => setSelectedItem(null)}
        onConfirm={handleDelete}
      />
    </>
  );
};
