import React, { useState } from "react";
import { motion } from "framer-motion";
import { GroupSearchBar } from "../../components/app/GroupSearchBar";
import { GroupListCard } from "../../components/app/GroupListCard";
import { CreateJoinButtons } from "../../components/app/CreateJoinButtons";
import { BottomNav } from "../../components/app/BottomNav";
import { useGroups } from "../../hooks/useGroups";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, delay },
});

function SkeletonCard() {
  return <div className="h-44 animate-pulse rounded-2xl bg-gray-200" />;
}

export function GrupPage() {
  const [query, setQuery] = useState("");
  const { groups, loading, error } = useGroups();

  const filtered = groups.filter((g) =>
    g.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="flex min-h-svh flex-col bg-gray-50">
      <header className="sticky top-0 z-40 bg-white px-5 pt-12 pb-4 shadow-sm">
        <div className="mx-auto max-w-lg">
          <h1 className="text-lg font-bold text-gray-900">Grup Arisan</h1>
          <p className="text-xs text-gray-400">Kelola semua grup arisanmu</p>
        </div>
      </header>

      <main className="mx-auto w-full max-w-lg flex-1 space-y-5 px-5 pb-28 pt-5">
        <motion.div {...fadeUp(0)}>
          <CreateJoinButtons />
        </motion.div>

        <motion.div {...fadeUp(0.05)}>
          <GroupSearchBar value={query} onChange={setQuery} />
        </motion.div>

        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
        )}

        {loading ? (
          <div className="space-y-3">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : filtered.length > 0 ? (
          <div className="space-y-3">
            {filtered.map((group, i) => (
              <motion.div key={group.id} {...fadeUp(0.1 + i * 0.05)}>
                <GroupListCard group={group} />
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div {...fadeUp(0.1)} className="py-16 text-center">
            <p className="text-sm text-gray-400">
              {query ? "Tidak ada grup ditemukan." : "Kamu belum bergabung di grup manapun."}
            </p>
          </motion.div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}

export default GrupPage;
