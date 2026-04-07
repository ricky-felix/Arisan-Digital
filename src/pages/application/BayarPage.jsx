import React from "react";
import { motion } from "framer-motion";
import { PaymentSummaryCard } from "../../components/app/PaymentSummaryCard";
import { PendingPaymentItem } from "../../components/app/PendingPaymentItem";
import { BayarHistoryItem } from "../../components/app/BayarHistoryItem";
import { BottomNav } from "../../components/app/BottomNav";
import { usePayments } from "../../hooks/usePayments";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, delay },
});

function SkeletonCard({ className = "" }) {
  return <div className={`animate-pulse rounded-2xl bg-gray-200 ${className}`} />;
}

export function BayarPage() {
  const { pending, history, loading, error, markPaid } = usePayments();

  return (
    <div className="flex min-h-svh flex-col bg-gray-50">
      <header className="sticky top-0 z-40 bg-white px-5 pt-12 pb-4 shadow-sm">
        <div className="mx-auto max-w-lg">
          <h1 className="text-lg font-bold text-gray-900">Pembayaran</h1>
          <p className="text-xs text-gray-400">Tagihan &amp; riwayat transaksi</p>
        </div>
      </header>

      <main className="mx-auto w-full max-w-lg flex-1 space-y-5 px-5 pb-28 pt-5">
        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
        )}

        {loading ? (
          <>
            <SkeletonCard className="h-36" />
            <SkeletonCard className="h-48" />
            <SkeletonCard className="h-56" />
          </>
        ) : (
          <>
            {pending.length > 0 && (
              <motion.div {...fadeUp(0)}>
                <PaymentSummaryCard pendingPayments={pending} />
              </motion.div>
            )}

            <motion.div {...fadeUp(0.05)}>
              <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                <h2 className="mb-3 text-sm font-semibold text-gray-800">Tagihan Bulan Ini</h2>
                {pending.length > 0 ? (
                  <div className="flex flex-col gap-2.5">
                    {pending.map((payment) => (
                      <PendingPaymentItem
                        key={payment.id}
                        payment={payment}
                        onPay={(method) => markPaid(payment.id, method)}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="py-4 text-center text-sm text-gray-400">
                    Tidak ada tagihan yang tertunda.
                  </p>
                )}
              </div>
            </motion.div>

            <motion.div {...fadeUp(0.1)}>
              <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                <h2 className="mb-1 text-sm font-semibold text-gray-800">Riwayat Transaksi</h2>
                {history.length > 0 ? (
                  history.map((item) => (
                    <BayarHistoryItem key={item.id} item={item} />
                  ))
                ) : (
                  <p className="py-4 text-center text-sm text-gray-400">
                    Belum ada transaksi.
                  </p>
                )}
              </div>
            </motion.div>
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
}

export default BayarPage;
