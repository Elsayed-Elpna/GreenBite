import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getWasteLog,
  addWasteLog,
  updateWasteLog,
  deleteWasteLog,
} from "@/api/wastelog.api";

export const useWasteLog = ({ page, filters }) => {
  return useQuery({
    queryKey: ["wastelog", page, filters],
    queryFn: async () => {
      const res = await getWasteLog({
        page,
        ...filters,
      });
      return res.data;
    },
    keepPreviousData: true,
  });
};

export const useAddWasteLog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addWasteLog,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["wastelog"],
      });
    },
  });
};

export const useUpdateWasteLog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateWasteLog,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["wastelog"],
      });
    },
  });
};

export const useDeleteWasteLog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteWasteLog,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["wastelog"],
      });
    },
  });
};
