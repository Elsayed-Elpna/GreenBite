import React from "react";
import api from "@/api/axios";
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
} from "@tanstack/react-query";
import { useState } from "react";

import { PacmanLoader } from "react-spinners";

import FoodLogToolbar from "@/components/HomePage/FoodLog/FoodLogToolbar";
import FoodLogTable from "@/components/HomePage/FoodLog/FoodLogTable";
import FoodLogPagination from "@/components/HomePage/FoodLog/FoodLogPagination";
import DeleteConfirmModal from "@/components/HomePage/FoodLog/DeleteConfirmModal";
const FoodLog = () => {
  const [filters, setFilters] = useState({
    name: "",
    category: "",
    storage_type: "",
    is_expired: "",
  });
  const [sort, setSort] = useState({
    sort_by: "",
    sort_order: "",
  });
  const [deleteItem, setDeleteItem] = useState(null);
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  const buildQueryParams = () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== "" && value !== null) {
        params.append(key, value);
      }
    });
    if (sort.sort_by) {
      params.append("sort_by", sort.sort_by);
      params.append("sort_order", sort.sort_order);
    }
    params.append("page", page);
    return params.toString();
  };

  const queryString = buildQueryParams();

  const { data, isLoading, error } = useQuery({
    queryKey: ["foodLog", filters, sort, page],
    queryFn: async () => {
      const res = await api.get(`/api/food-logs/?${queryString}`);
      return res.data;
    },
    keepPreviousData: true,
  });

  // delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/api/food-logs/${id}/`),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["foodLog"],
      });
      setDeleteItem(null);
    },
  });

  const handleDeleteConfirm = () => {
    if (!deleteItem) return;
    deleteMutation.mutate(deleteItem.id);
  };

  if (isLoading) {
    return <PacmanLoader color="#7EB685" size={40} speedMultiplier={1} />;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden m-6 border border-[#00000010]">
      <FoodLogToolbar filters={filters} setFilters={setFilters} />

      <FoodLogTable
        items={data?.results || []}
        sort={sort}
        setSort={setSort}
        setDeleteItem={setDeleteItem}
      />
      <DeleteConfirmModal
        open={!!deleteItem}
        item={deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleDeleteConfirm}
        loading={deleteMutation.isLoading}
      />

      <FoodLogPagination count={data?.count} page={page} setPage={setPage} />
    </div>
  );
};

export default FoodLog;
