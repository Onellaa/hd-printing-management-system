import { Link } from "react-router-dom";

export const BackButton = ({ to }) => (
  <Link className="back-button" to={to}>
    <span aria-hidden="true">←</span>
    <span>Back</span>
  </Link>
);
