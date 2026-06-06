import PayButton from "./PayButton";

/** Mobile sticky bottom action bar (desktop puts the button in the left column). */
export default function PayFooter({ label, onPay }) {
  return (
    <div
      className="sticky bottom-0 w-full lg:hidden"
      style={{ background: "linear-gradient(to top, var(--app-bg) 70%, transparent)" }}
    >
      <div className="mx-auto w-full max-w-140 px-5 pt-3 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
        <PayButton label={label} onPay={onPay} />
      </div>
    </div>
  );
}
