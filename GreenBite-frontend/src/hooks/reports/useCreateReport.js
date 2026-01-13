import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createReport } from "@/api/reports.api";

export const useCreateReport = () => {
  const qc = useQueryClient();
  
  return useMutation({
    mutationFn: createReport,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reports"] });
    },
  });
};