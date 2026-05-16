import React from "react";

export function Divider() {
  return (
    <div className="flex items-center gap-3 py-1" role="separator" aria-hidden="true">
      <div className="h-px flex-1 bg-gray-200" />
      <span className="text-xs font-medium tracking-wide text-gray-400">atau</span>
      <div className="h-px flex-1 bg-gray-200" />
    </div>
  );
}

export default Divider;
