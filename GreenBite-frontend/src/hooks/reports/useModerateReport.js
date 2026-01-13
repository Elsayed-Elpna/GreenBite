import { useMutation, useQueryClient } from "@tanstack/react-query";
import { moderateReport } from "@/api/reports.api";

export const useModerateReport = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: moderateReport,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reports"] });
      qc.invalidateQueries({ queryKey: ["report"] });
    },
  });
};