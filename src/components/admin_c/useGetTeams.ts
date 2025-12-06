import { useQuery } from "@tanstack/react-query";
import { fakeTeams } from "../admin_c/Fake_teams";
import { Equipo } from "../admin_c/Equipo";

export function useGetTeams() {
  return useQuery<Equipo[]>({
    queryKey: ["teams"],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return fakeTeams;
    },
    refetchOnWindowFocus: false,
  });
}
