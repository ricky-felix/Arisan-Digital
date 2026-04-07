import React, { useState } from "react";
import { motion } from "framer-motion";
import { GroupSearchBar } from "../../components/app/GroupSearchBar";
import { GroupListCard } from "../../components/app/GroupListCard";
import { CreateJoinButtons } from "../../components/app/CreateJoinButtons";
import { BottomNav } from "../../components/app/BottomNav";
import { GROUPS } from "../../data/appMockData";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, delay },
});

export function GrupPage() {
  const [query, setQuery] = useState("");

  const filtered = GROUPS.filter((g) =>
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

        <div className="space-y-3">
          {filtered.length > 0 ? (
            filtered.map((group, i) => (
              <motion.div key={group.id} {...fadeUp(0.1 + i * 0.05)}>
                <GroupListCard group={group} />
              </motion.div>
            ))
          ) : (
            <motion.div {...fadeUp(0.1)} className="py-12 text-center">
              <p className="text-sm text-gray-400">Tidak ada grup ditemukan.</p>
            </motion.div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

export default GrupPage;
