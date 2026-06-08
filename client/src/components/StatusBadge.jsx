import { getStatusTone } from "../utils/formatters";

export const StatusBadge = ({ status }) => (
  <span className={`status-badge ${getStatusTone(status)}`}>{status}</span>
);

