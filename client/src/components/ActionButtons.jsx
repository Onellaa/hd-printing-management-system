import { Link } from "react-router-dom";

export const ActionButtons = ({
  viewTo,
  editTo,
  onDelete,
  deleteLabel = "Delete",
  disableEdit = false,
  disableDelete = false,
}) => (
  <div className="action-group">
    {viewTo ? (
      <Link className="text-action" to={viewTo}>
        View
      </Link>
    ) : null}
    {editTo ? (
      disableEdit ? (
        <span className="text-action disabled">Edit</span>
      ) : (
        <Link className="text-action" to={editTo}>
          Edit
        </Link>
      )
    ) : null}
    {onDelete ? (
      disableDelete ? (
        <span className="text-action disabled">{deleteLabel}</span>
      ) : (
        <button type="button" className="text-action danger" onClick={onDelete}>
          {deleteLabel}
        </button>
      )
    ) : null}
  </div>
);
