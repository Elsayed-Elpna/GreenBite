import { useMutation, useQueryClient } from "@tanstack/react-query";
import FoodLogForm from "@/components/HomePage/FoodLog/FoodLogForm";
import api from "@/api/axios";

export default function AddLeftoversDialog({ open, onClose, meal, onSaved }) {
  const queryClient = useQueryClient();

  const mutation = useMutation(
    (payload) => api.post(`/api/meals/${meal.id}/save-leftovers/`, payload),
    {
      onSuccess: (response) => {
        // Invalidate meals list
        queryClient.invalidateQueries({ queryKey: ["meals"], exact: false });

        // Notify parent dialog for instant update
        onSaved?.(response.data.leftovers);

        onClose();
      },
    }
  );

  if (!open) return null;

  const initialData = meal.leftovers?.length
    ? meal.leftovers
    : [
        {
          name: meal.recipe,
          quantity: 1,
          unit: "portion",
          category: "other",
          storage_type: "fridge",
          expiry_date: new Date().toISOString().split("T")[0],
        },
      ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold">Save Leftovers</h2>
        </div>
        <div className="p-6">
          <FoodLogForm
            initialData={initialData}
            onSubmit={(data) => {
              const leftoversArray = Array.isArray(data) ? data : [data];
              mutation.mutate({ leftovers: leftoversArray });
            }}
            loading={mutation.isLoading}
          />
        </div>
      </div>
    </div>
  );
}
