const styles = {
  DRAFT: "neutral", IN_REVIEW: "blue", PUBLISHED: "green",
  RETURNED: "orange", SUPERSEDED: "muted"
};
export default function StatusBadge({ status = "UNKNOWN" }) {
  return <span className={`status-badge ${styles[status] || "neutral"}`}><i/> {status.replaceAll("_", " ")}</span>;
}