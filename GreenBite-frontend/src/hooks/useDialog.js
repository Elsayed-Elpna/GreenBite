import { useState } from "react";

export default function useDialog(initialOpen = false) {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [activeIndex, setActiveIndex] = useState(0);
  const [data, setData] = useState([]); // array of IDs or data

  // Open dialog with meal ID(s)
  const open = (payload = [], index = 0) => {
    setIsOpen(true);
    setActiveIndex(index);

    if (Array.isArray(payload)) {
      setData(payload);
    } else {
      // Single ID or value
      setData([payload]);
    }
  };

  const close = () => {
    setIsOpen(false);
    setData([]);
    setActiveIndex(0);
  };

  const prev = () => setActiveIndex((i) => Math.max(i - 1, 0));
  const next = () => setActiveIndex((i) => Math.min(i + 1, data.length - 1));

  return {
    isOpen,
    data,
    activeIndex,
    open,
    close,
    prev,
    next,
    setActiveIndex,
  };
}