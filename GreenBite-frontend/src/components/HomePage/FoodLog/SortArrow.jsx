const SortArrow = ({ active, order }) => {
  if (!active) return null;
  return order === "asc" ? " ↑" : " ↓";
};

export default SortArrow;
