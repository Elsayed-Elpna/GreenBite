import { useState } from "react";

export default function useDialog(initialOpen = false) {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [activeIndex, setActiveIndex] = useState(0); // track current recipe
  const [data, setData] = useState([]); // store recipes or any payload

  const open = (payload = [], index = 0) => {
    setData(payload);
    setActiveIndex(index);
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
    setData([]);
    setActiveIndex(0);
  };

  const prev = () => {
    setActiveIndex((prevIndex) => Math.max(prevIndex - 1, 0));
  };

  const next = () => {
    setActiveIndex((prevIndex) =>
      Math.min(prevIndex + 1, data.length - 1)
    );
  };

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
