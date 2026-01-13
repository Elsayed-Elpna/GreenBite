import { useQuery } from "@tanstack/react-query";
import { getReportDetails } from "@/api/reports.api";

export const useReportDetails = (reportId, enabled = true) =>
  useQuery({
    queryKey: ["report", reportId],
    queryFn: () => getReportDetails(reportId).then((res) => res.data),
    enabled: !!reportId && enabled,
  });