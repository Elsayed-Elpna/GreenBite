import FoodTableHeader from "./FoodTableHeader";
import FoodTableRow from "./FoodTableRow";

const FoodLogTable = ({ items, sort, setSort, onEdit, setDeleteItem }) => {
  return (
    <div className="">
      <table className="w-full">
        <FoodTableHeader sort={sort} setSort={setSort} />

        {items.map((item) => (
          <FoodTableRow
            key={item.id}
            item={item}
            onEdit={() => onEdit(item)}
            onDelete={() => setDeleteItem(item)}
          />
        ))}
      </table>
    </div>
  );
};

export default FoodLogTable;
