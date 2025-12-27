import React from "react";
import { useState } from "react";
import {
  useWasteLog,
  useAddWasteLog,
  useUpdateWasteLog,
  useDeleteWasteLog,
} from "@/hooks/useWasteLog";

import WasteLogTable from "@/components/HomePage/WasteLog/WasteLogTable";
import WasteLogModal from "@/components/HomePage/WasteLog/WasteLogModal";
import WasteLogPagination from "@/components/HomePage/WasteLog/WasteLogPagination";

import { PacmanLoader } from "react-spinners";

const WasteLog = () => {
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // filters state
  const [filters, setFilters] = useState({
    name: "",
    ordering: "",
  });

  const { data, isLoading } = useWasteLog({
    page,
    filters,
  });

  const addMutation = useAddWasteLog();
  const updateMutation = useUpdateWasteLog();
  const deleteMutation = useDeleteWasteLog();

  const handleSubmit = (formData) => {
    if (editingItem) {
      updateMutation.mutate(
        { id: editingItem.id, data: formData },
        { onSuccess: closeModal }
      );
    } else {
      addMutation.mutate(formData, { onSuccess: closeModal });
    }
  };

  const openAdd = () => {
    setEditingItem(null);
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingItem(null);
  };

  if (isLoading) return <PacmanLoader />;

  return (
    <div className=" m-4 mt-4 capitalize">
      <WasteLogTable
        data={data.results}
        filters={filters}
        setFilters={setFilters}
        onAdd={openAdd}
        onEdit={openEdit}
        onDelete={(id) => deleteMutation.mutate(id)}
      />

      <WasteLogPagination page={page} setPage={setPage} count={data.count} />

      <WasteLogModal
        key={editingItem?.id || "new"}
        isOpen={modalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        initialData={editingItem}
        isLoading={addMutation.isLoading || updateMutation.isLoading}
      />
    </div>
  );
};

export default WasteLog;
