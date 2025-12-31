import { useState } from "react";

export default function useDialog(initialOpen = false) {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [activeIndex, setActiveIndex] = useState(0);
  const [data, setData] = useState([]); // always an array
  const [loading, setLoading] = useState(false);

  const open = async (payload = [], index = 0) => {
    setIsOpen(true);
    setActiveIndex(index);

    if (typeof payload === "function") {
      setLoading(true);
      try {
        const result = await payload();
        setData([result]); // wrap single item in array
        setActiveIndex(0);
      } catch (err) {
        console.error("Dialog fetch error:", err);
        setData([]);
      } finally {
        setLoading(false);
      }
    } else if (Array.isArray(payload)) {
      setData(payload);
    } else {
      console.error("Dialog open: payload must be array or function");
      setData([]);
    }
  };

  const close = () => {
    setIsOpen(false);
    setData([]);
    setActiveIndex(0);
  };

  const prev = () => setActiveIndex((i) => Math.max(i - 1, 0));
  const next = () =>
    setActiveIndex((i) => Math.min(i + 1, data.length - 1));

  return {
    isOpen,
    data,
    activeIndex,
    loading,
    open,
    close,
    prev,
    next,
    setActiveIndex,
  };
}
