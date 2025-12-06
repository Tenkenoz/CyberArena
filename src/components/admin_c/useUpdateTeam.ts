import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Equipo } from "../admin_c/Equipo";

export function useUpdateTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (team: Equipo) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    },
    onMutate: (updatedTeam: Equipo) => {
      queryClient.setQueryData(["teams"], (prev: any) =>
        prev.map((t: Equipo) =>
          t.id === updatedTeam.id ? updatedTeam : t
        )
      );
    },
  });
}
