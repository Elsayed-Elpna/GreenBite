import React from "react";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

const Collapsible = ({ id, open, className = "", maxHeight = "1400px", children }) => {
  return (
    <div
      id={id}
      className={cn(
        "transition-all duration-300 ease-in-out",
        open ? `opacity-100 max-h-[${maxHeight}]` : "opacity-0 max-h-0 overflow-hidden pointer-events-none",
        className
      )}
    >
      {children}
    </div>
  );
};

export default Collapsible;