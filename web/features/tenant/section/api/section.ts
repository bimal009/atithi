import { axiosInstance } from "@/lib/axios";
import { ApiResponse } from "@/lib/types/responses";

import {
  CreateSectionInput,
  ListSectionsResponse,
  Section,
  UpdateSectionInput,
} from "../types";

export const listSections = async (
  tenant: string,
  params?: { search?: string; page?: number; limit?: number },
): Promise<ApiResponse<ListSectionsResponse>> => {
  const { data } = await axiosInstance.get<ApiResponse<ListSectionsResponse>>(
    `/hotels/slug/${tenant}/sections`,
    {
      params: {
        search: params?.search || undefined,
        page: params?.page ?? 1,
        limit: params?.limit ?? 10,
      },
    },
  );
  return data;
};

export const createSection = async (
  tenant: string,
  input: CreateSectionInput,
): Promise<ApiResponse<Section>> => {
  const { data } = await axiosInstance.post<ApiResponse<Section>>(
    `/hotels/slug/${tenant}/sections`,
    input,
  );
  return data;
};

export const updateSection = async (
  tenant: string,
  sectionId: string,
  input: UpdateSectionInput,
): Promise<ApiResponse<Section>> => {
  const { data } = await axiosInstance.patch<ApiResponse<Section>>(
    `/hotels/slug/${tenant}/sections/${sectionId}`,
    input,
  );
  return data;
};

export const removeSection = async (
  tenant: string,
  sectionId: string,
): Promise<ApiResponse<null>> => {
  const { data } = await axiosInstance.delete<ApiResponse<null>>(
    `/hotels/slug/${tenant}/sections/${sectionId}`,
  );
  return data;
};
