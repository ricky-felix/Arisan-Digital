import React from "react";
import { motion } from "framer-motion";
import { PaymentSummaryCard } from "../../components/app/PaymentSummaryCard";
import { PendingPaymentItem } from "../../components/app/PendingPaymentItem";
import { BayarHistoryItem } from "../../components/app/BayarHistoryItem";
import { BottomNav } from "../../components/app/BottomNav";
import { PENDING_PAYMENTS, PAYMENT_HISTORY } from "../../data/appMockData";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, delay },
});

export function BayarPage() {
  return (
    <div className="flex min-h-svh flex-col bg-gray-50">
      <header className="sticky top-0 z-40 bg-white px-5 pt-12 pb-4 shadow-sm">
        <div className="mx-auto max-w-lg">
          <h1 className="text-lg font-bold text-gray-900">Pembayaran</h1>
          <p className="text-xs text-gray-400">Tagihan & riwayat transaksi</p>
        </div>
      </header>

      <main className="mx-auto w-full max-w-lg flex-1 space-y-5 px-5 pb-28 pt-5">
        <motion.div {...fadeUp(0)}>
          <PaymentSummaryCard pendingPayments={PENDING_PAYMENTS} />
        </motion.div>

        <motion.div {...fadeUp(0.05)}>
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-gray-800">Tagihan Bulan Ini</h2>
            <div className="flex flex-col gap-2.5">
              {PENDING_PAYMENTS.map((payment) => (
                <PendingPaymentItem key={payment.id} payment={payment} />
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div {...fadeUp(0.1)}>
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <h2 className="mb-1 text-sm font-semibold text-gray-800">Riwayat Transaksi</h2>
            <div>
              {PAYMENT_HISTORY.map((item) => (
                <BayarHistoryItem key={item.id} item={item} />
              ))}
            </div>
          </div>
        </motion.div>
      </main>

      <BottomNav />
    </div>
  );
}

export default BayarPage;
