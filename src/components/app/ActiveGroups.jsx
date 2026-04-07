import React from "react";
import { motion } from "framer-motion";
import { GroupCard } from "./GroupCard";

export function ActiveGroups({ groups }) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-bold text-gray-900">Grup Arisan Aktif</h2>
        <button className="text-xs font-semibold text-[#10b981] focus-visible:outline-none">
          Lihat semua
        </button>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
        {groups.map((group, i) => (
          <motion.div
            key={group.id}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + i * 0.06 }}
          >
            <GroupCard group={group} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export default ActiveGroups;
