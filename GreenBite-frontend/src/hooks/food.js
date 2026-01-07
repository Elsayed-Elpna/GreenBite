import { useQuery, useMutation } from "@tanstack/react-query";
import { getExpiringSoon, createFoodSafetyScan, getFoodSafetyScanStatus } from "@/api/foodlog.api";

export function ExpirySoon() {
  return useQuery({
    queryKey: ["expirySoon"],
    queryFn: getExpiringSoon,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

const TERMINAL = new Set(["SUCCESS", "FAILURE", "REVOKED"]);

const shouldPoll = (job) => {
  const status = job?.status;
  if (!status) return false;
  return !TERMINAL.has(status);
};

/**
 * 1) Upload image and start celery job
 */
export const useCreateFoodSafetyScan = (options = {}) => {
  return useMutation({
    mutationFn: (file) => createFoodSafetyScan(file),
    ...options,
  });
};

/**
 * 2) Poll celery job status until terminal
 */
export const useFoodSafetyScanStatus = (jobId, options = {}) => {
  return useQuery({
    queryKey: ["foodSafetyScanStatus", jobId],
    queryFn: () => getFoodSafetyScanStatus(jobId),
    enabled: Boolean(jobId),
    // IMPORTANT: refetchInterval callback receives "data" (can be undefined on first run)
    refetchInterval: (data) => (shouldPoll(data) ? 1500 : false),
    refetchOnWindowFocus: false,
    retry: 1,
    ...options,
  });
};

/**
 * Combined flow
 */
export const useFoodSafetyScanFlow = (options = {}) => {
  const create = useCreateFoodSafetyScan(options.create);
  const jobId = create.data?.job_id;

  const statusQuery = useFoodSafetyScanStatus(jobId, options.status);

  const start = (file) => create.mutate(file);

  return {
    start,
    jobId,
    create,
    ...statusQuery,
  };
};