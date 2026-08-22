import { axiosInstance } from "@/lib/axios";
import { ApiResponse } from "@/lib/types/responses";

import { ListTestimonialsResponse } from "../types";

export const listTestimonials = async (
  tenant: string,
  params?: { page?: number; limit?: number },
): Promise<ApiResponse<ListTestimonialsResponse>> => {
  const { data } = await axiosInstance.get<ApiResponse<ListTestimonialsResponse>>(
    `/hotels/slug/${tenant}/testimonials`,
    {
      params: {
        page: params?.page ?? 1,
        limit: params?.limit ?? 20,
      },
    },
  );
  return data;
};
