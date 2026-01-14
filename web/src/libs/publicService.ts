import { ApiResponse, fetcher } from "@/src/hooks/use-fetcher";

export const publicService = {
  getExecutiveCommittee: async <T>(): Promise<ApiResponse<T>> =>
    await fetcher("/alm/executive-commite", {
      method: "GET",
      useToken: false,
    }),
};
