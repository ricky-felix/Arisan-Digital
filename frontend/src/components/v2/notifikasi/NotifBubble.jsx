/**
 * NotifBubble — wrapper for one notification message row.
 *
 * Props:
 *   side     "incoming" | "outgoing"
 *   avatar   string (initials) | React node — only rendered for incoming rows
 *   children React node — the .bub-card … content
 *
 * Structure mirrors the page exactly:
 *   .bub-row <side>
 *     .bub-avatar  (incoming only; may contain a string or a node such as an icon)
 *     .bub-body
 *       {children}
 */
export default function NotifBubble({ side, avatar, children }) {
  return (
    <div className={`bub-row ${side}`}>
      {side === "incoming" && (
        <div className="bub-avatar">{avatar}</div>
      )}
      <div className="bub-body">
        {children}
      </div>
    </div>
  );
}
