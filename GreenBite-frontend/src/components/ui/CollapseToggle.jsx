import React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const CollapseToggle = ({ open, onToggle, controlsId, className = "" }) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={
        className ||
        "inline-flex items-center gap-2 rounded-full border border-green-200 bg-white/70 px-4 py-2 text-sm font-medium text-green-800 hover:bg-green-50 transition"
      }
      aria-expanded={open}
      aria-controls={controlsId}
    >
      {open ? (
        <>
          <ChevronUp className="w-4 h-4" />
          Hide details
        </>
      ) : (
        <>
          <ChevronDown className="w-4 h-4" />
          Show details
        </>
      )}
    </button>
  );
};

export default CollapseToggle;
