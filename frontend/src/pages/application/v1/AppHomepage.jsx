import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import AppLayout from "../../../components/application/AppLayout";
import SummaryCard from "../../../components/application/v1/SummaryCard";
import ActiveGroups from "../../../components/application/v1/ActiveGroups";
import UpcomingSchedule from "../../../components/application/v1/UpcomingSchedule";
import Icon from "../../../components/application/Icon";
import { getDashboard } from "./mockData";
import { formatRupiah } from "../../../utils/formatRupiah";

const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];

export function AppHomepage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    getDashboard()
      .then((d) => alive && setData(d))
      .catch(() => alive && setData(null))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, []);

  const groups = data?.groups ?? [];
  const myBills = data?.myBills ?? [];
  const nextBill = myBills[0];

  return (
    <AppLayout title="Dashboard">
      <div className="app-scroll" style={{ padding: "16px 16px 24px" }}>
        {/* Desktop greeting */}
        <div className="hidden md:flex justify-between items-end mb-6">
          <div>
            <div style={{ fontSize: 13, color: "var(--ink-2)" }}>
              {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </div>
            <h1 style={{ margin: "4px 0 0", fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em" }}>Dashboard 👋</h1>
            <p style={{ color: "var(--ink-2)", fontSize: 14, marginTop: 6 }}>
              {groups.length} grup aktif{myBills.length ? ` · ${myBills.length} tagihan menunggu` : ""}
            </p>
          </div>
          <button className="app-btn btn-primary btn-lg" onClick={() => navigate("/app/arisan/buat")}>+ Buat Arisan</button>
        </div>

        {loading ? (
          <div className="app-card" style={{ padding: 40, textAlign: "center", color: "var(--ink-2)" }}>Memuat…</div>
        ) : (
          <>
            <SummaryCard
              totalGroups={groups.length}
              nextBill={nextBill ? { amount: nextBill.amount, due: nextBill.due, group: nextBill.group } : { amount: 0, due: new Date(), group: "—" }}
              totalSaved={data?.owedToMe ?? 0}
            />

            {/* Arisan module row */}
            <div className="module-row arisan mt-4">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-[10px] grid place-items-center bg-[var(--emerald)] text-white"><Icon name="users" size={16}/></div>
                <div>
                  <h3 className="text-sm font-bold m-0">Arisan</h3>
                  <span className="text-[11px] text-[var(--ink-2)]">Tabungan bergilir</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-[11px] text-[var(--ink-2)]">Grup Aktif</div>
                  <div className="text-[17px] font-bold tracking-tight mt-0.5">{groups.length}</div>
                </div>
                <div>
                  <div className="text-[11px] text-[var(--ink-2)]">Iuran Arisan Berikutnya</div>
                  <div className="text-[17px] font-bold tracking-tight mt-0.5">{nextBill ? formatRupiah(nextBill.amount) : "—"}</div>
                  {nextBill && <div className="text-[11px] text-[var(--ink-3)]">Jatuh tempo {nextBill.due.getDate()} {MONTHS_SHORT[nextBill.due.getMonth()]}</div>}
                </div>
              </div>
            </div>

            {/* Patungan module row */}
            <div className="module-row patungan mt-3">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-[10px] grid place-items-center" style={{ background: "var(--lavender-dark)", color: "white" }}><Icon name="split" size={16}/></div>
                <div>
                  <h3 className="text-sm font-bold m-0">Patungan</h3>
                  <span className="text-[11px] text-[var(--ink-2)]">Bagi pengeluaran</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-[11px] text-[var(--ink-2)]">Tagihan Open</div>
                  <div className="text-[17px] font-bold tracking-tight mt-0.5">{data?.openBillCount ?? 0}</div>
                </div>
                <div>
                  <div className="text-[11px] text-[var(--ink-2)]">Belum Dibayar ke Saya</div>
                  <div className="text-[17px] font-bold tracking-tight mt-0.5">{formatRupiah(data?.owedToMe ?? 0)}</div>
                </div>
              </div>
            </div>

            {/* Quick actions */}
            <div className="flex gap-2 mt-4">
              <button className="app-pill flex-1" onClick={() => navigate("/app/arisan/buat")}>
                <span className="ico"><Icon name="plus" size={14}/></span><span>Buat Arisan</span>
              </button>
              <button className="app-pill flex-1" onClick={() => navigate("/app/patungan/buat")}>
                <span className="ico violet"><Icon name="plus" size={14}/></span><span>Buat Tagihan</span>
              </button>
            </div>

            {groups.length === 0 && myBills.length === 0 ? (
              <div className="app-card app-empty mt-6" style={{ textAlign: "center", padding: 32 }}>
                <div className="illus"><Icon name="sparkles" size={36} /></div>
                <h3>Selamat datang 👋</h3>
                <p>Mulai dengan membuat arisan atau tagihan patungan pertama Anda.</p>
                <button className="app-btn btn-primary mt-2" onClick={() => navigate("/app/arisan/buat")}>
                  <Icon name="plus" size={16}/> Buat Arisan
                </button>
              </div>
            ) : (
              <>
                <div className="hidden md:block mt-6">
                  <ActiveGroups groups={groups} onGroupClick={(g) => navigate(`/app/arisan/${g.id}`)} onViewAll={() => navigate("/app/arisan")} />
                </div>
                <div className="md:hidden">
                  <ActiveGroups groups={groups} onGroupClick={(g) => navigate(`/app/arisan/${g.id}`)} onViewAll={() => navigate("/app/arisan")} limit={3} />
                  {myBills.length > 0 && (
                    <div style={{ marginTop: 4 }}>
                      <UpcomingSchedule bills={myBills} />
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}

export default AppHomepage;
