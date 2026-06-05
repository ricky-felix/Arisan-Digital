import { Check } from "../icons";

/**
 * ReminderButton — toggleable action button that switches to a "sent" state.
 *
 * Props:
 *   sent       boolean      — whether the action has already been triggered
 *   onClick    () => void   — handler called when the idle button is clicked
 *   idleLabel  string       — label shown while not yet sent (e.g. "Ingatkan")
 *   sentLabel  string       — label shown after sending (e.g. "Terkirim", "Lunas")
 *   variant    "lv" | "em"  — controls which CSS modifier pair is applied:
 *                               "lv"  → idle: ba-btn lv  / sent: ba-btn sent-lv
 *                               "em"  → idle: ba-btn em  / sent: ba-btn sent
 */
export default function ReminderButton({ sent, onClick, idleLabel, sentLabel, variant = "lv" }) {
  const sentClass  = variant === "em" ? "ba-btn sent"    : "ba-btn sent-lv";
  const idleClass  = variant === "em" ? "ba-btn em"      : "ba-btn lv";

  if (sent) {
    return (
      <span className={sentClass}>
        <Check size={11} strokeWidth={3} />{" "}
        {sentLabel}
      </span>
    );
  }

  return (
    <button type="button" className={idleClass} onClick={onClick}>
      {idleLabel}
    </button>
  );
}
