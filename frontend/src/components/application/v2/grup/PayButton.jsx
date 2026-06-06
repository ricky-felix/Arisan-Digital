import { Card } from "../icons";

/** Primary "pay my dues" button — reused by the mobile sticky bar and the
 *  desktop left column. */
export default function PayButton({ label, onPay }) {
  return (
    <button className="gd-pay-btn" type="button" onClick={onPay}>
      <Card size={16} stroke="white" strokeWidth={2.5} />
      {label}
    </button>
  );
}
