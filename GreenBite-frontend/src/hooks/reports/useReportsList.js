import { useQuery } from "@tanstack/react-query";
import { getReports } from "@/api/reports.api";

export const useReportsList = ({ page = 1, ...filters }) => {
  const cleanFilters = Object.entries(filters).reduce((acc, [key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      acc[key] = value;
    }
    return acc;
  }, {});

  return useQuery({
    queryKey: ["reports", page, cleanFilters],
    queryFn: () =>
      getReports({ page, ...cleanFilters }).then((res) => res.data),
    placeholderData: (prev) => prev,
    staleTime: 30_000,
  });
};

