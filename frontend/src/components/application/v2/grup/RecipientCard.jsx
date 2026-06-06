import { ChevronRight } from "../icons";

/** Highlighted callout for the member receiving this round's pot. */
export default function RecipientCard({ recipient, onClick }) {
  return (
    <button className="gd-recipient" type="button" onClick={onClick}>
      <div className="gd-rc-av">{recipient.initials}</div>
      <div className="gd-rc-info">
        <div className="gd-rc-lbl">{recipient.label}</div>
        <div className="gd-rc-name">{recipient.name}</div>
        <div className="gd-rc-sub">{recipient.sub}</div>
      </div>
      <ChevronRight size={16} stroke="var(--emerald-dark)" strokeWidth={2.5} />
    </button>
  );
}
