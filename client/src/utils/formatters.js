export const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(Number(value || 0));

export const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString("en-IN") : "-";

export const getStatusTone = (status) => {
  const tones = {
    ACTIVE: "success",
    INACTIVE: "muted",
    PAID: "success",
    OVERDUE: "danger",
    ISSUED: "warning",
    DRAFT: "muted",
    CANCELLED: "muted",
    PENDING: "warning",
    DEPOSITED: "info",
    RETURNED: "danger",
  };

  return tones[status] || "muted";
};
