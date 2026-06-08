import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../../styles/app-v2.css";
import { transactionsService } from "../../../services";
import { Check, Clock, AlertCircle } from "../../../components/application/v2/icons";
import ScreenHeader from "../../../components/application/v2/ScreenHeader";

function fmt(amount) {
  return "Rp " + Number(amount).toLocaleString("id-ID");
}

// Map backend transaction status values to display config.
// Backend shape per item (best-effort mapping — adapt if fields differ):
//   { id, type: "arisan"|"patungan", group_name, description, amount, created_at, status }
const STATUS_CONFIG = {
  lunas:     { label: "Lunas",   icon: Check,         bg: "bg-brand-primary-soft",   text: "text-brand-primary-hover" },
  paid:      { label: "Lunas",   icon: Check,         bg: "bg-brand-primary-soft",   text: "text-brand-primary-hover" },
  confirmed: { label: "Lunas",   icon: Check,         bg: "bg-brand-primary-soft",   text: "text-brand-primary-hover" },
  pending:   { label: "Pending", icon: Clock,         bg: "bg-[#fef3c7]",            text: "text-[#92400e]" },
  gagal:     { label: "Gagal",   icon: AlertCircle,   bg: "bg-[#fee2e2]",            text: "text-error" },
  failed:    { label: "Gagal",   icon: AlertCircle,   bg: "bg-[#fee2e2]",            text: "text-error" },
};

const TYPE_CONFIG = {
  arisan:   { dot: "bg-brand-primary",   label: "Arisan" },
  patungan: { dot: "bg-brand-secondary", label: "Patungan" },
};

/**
 * Normalize a raw transaction from the backend into the shape the list UI expects.
 * The backend response may use snake_case field names; we map them here.
 */
function normalizeTransaction(tx) {
  return {
    id:          tx.id,
    type:        tx.type ?? "arisan",
    // Backend may send group_name or groupName
    groupName:   tx.group_name ?? tx.groupName ?? "—",
    description: tx.description ?? tx.notes ?? "—",
    amount:      Number(tx.amount ?? 0),
    // Format the date; fall back to raw string if parsing fails
    date: tx.created_at
      ? (() => {
          try {
            return new Date(tx.created_at).toLocaleDateString("id-ID", {
              day: "numeric", month: "short", year: "numeric",
            });
          } catch {
            return String(tx.created_at);
          }
        })()
      : (tx.date ?? "—"),
    status: tx.status ?? "pending",
  };
}

export default function RiwayatTransaksi() {
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── Fetch transactions on mount ──────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        // GET /transactions/me
        const raw = await transactionsService.getMine();
        if (cancelled) return;
        const list = Array.isArray(raw) ? raw : [];
        setTransactions(list.map(normalizeTransaction));
      } catch (err) {
        if (cancelled) return;
        console.error('[RiwayatTransaksi] failed to load transactions:', err.message);
        setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="v2-screen">
      <div className="v2-inner" style={{ overflowY: "auto" }}>

        {/* ── Sticky header ── */}
        <ScreenHeader title="Riwayat Transaksi" onBack={() => navigate("/app/profil")}>
          {loading && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-line border-t-brand-primary" aria-hidden="true" />
          )}
        </ScreenHeader>

        {/* ── Content column ── */}
        <div className="mx-auto w-full max-w-[480px] px-5 py-6 lg:max-w-[600px] lg:px-6">

          {/* ── Loading skeleton ── */}
          {loading && (
            <div className="flex flex-col gap-3" aria-busy="true" aria-label="Memuat transaksi">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 animate-pulse rounded-card bg-gray-soft" />
              ))}
            </div>
          )}

          {/* ── Error state ── */}
          {!loading && error && (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <div className="grid h-20 w-20 place-items-center rounded-[22px] bg-[#fee2e2] text-error">
                <AlertCircle size={38} strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-[17px] font-extrabold tracking-[-0.02em] text-ink-1">
                  Gagal memuat transaksi
                </p>
                <p className="mt-1.5 text-[13px] font-medium leading-relaxed text-ink-3">
                  {error}
                </p>
              </div>
            </div>
          )}

          {/* ── Empty state ── */}
          {!loading && !error && transactions.length === 0 && (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <div className="grid h-20 w-20 place-items-center rounded-[22px] bg-gray-soft text-ink-3">
                <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              </div>
              <div>
                <p className="text-[17px] font-extrabold tracking-[-0.02em] text-ink-1">
                  Belum ada transaksi
                </p>
                <p className="mt-1.5 text-[13px] font-medium leading-relaxed text-ink-3">
                  Transaksi dari arisan dan patungan yang kamu ikuti akan muncul di sini.
                </p>
              </div>
            </div>
          )}

          {/* ── Transaction list ── */}
          {!loading && !error && transactions.length > 0 && (
            <div className="flex flex-col gap-3">

              {/* Legend */}
              <div className="flex items-center gap-4 px-1 pb-1">
                {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
                  <span key={key} className="flex items-center gap-1.5 text-[11px] font-semibold text-ink-3">
                    <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
                    {cfg.label}
                  </span>
                ))}
              </div>

              {transactions.map((tx) => {
                const type = TYPE_CONFIG[tx.type] ?? TYPE_CONFIG.arisan;
                const status = STATUS_CONFIG[tx.status] ?? STATUS_CONFIG.pending;
                const StatusIcon = status.icon;

                return (
                  <div
                    key={tx.id}
                    className="overflow-hidden rounded-card bg-surface shadow-card"
                  >
                    <div className="flex items-center gap-3.5 px-4 py-3.5">
                      {/* Type dot */}
                      <div className={`h-9 w-9 shrink-0 rounded-[11px] ${type.dot} grid place-items-center opacity-90`}>
                        <span className="text-[10px] font-extrabold uppercase tracking-wide text-white">
                          {type.label.slice(0, 2)}
                        </span>
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-bold leading-tight text-ink-1 truncate">
                          {tx.groupName}
                        </p>
                        <p className="text-[11px] font-medium text-ink-3 truncate">
                          {tx.description}
                        </p>
                      </div>
                      {/* Amount + status */}
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <p className="text-[14px] font-extrabold tracking-[-0.02em] text-ink-1">
                          {fmt(tx.amount)}
                        </p>
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${status.bg} ${status.text}`}>
                          <StatusIcon size={9} strokeWidth={2.5} />
                          {status.label}
                        </span>
                      </div>
                    </div>
                    {/* Date footer */}
                    <div className="border-t border-line-soft px-4 py-2">
                      <p className="text-[10px] font-semibold text-ink-3">{tx.date}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
