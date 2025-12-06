import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDeleteTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    },
    onMutate: (id: string) => {
      queryClient.setQueryData(["teams"], (prev: any) =>
        prev.filter((t: any) => t.id !== id)
      );
    },
  });
}
