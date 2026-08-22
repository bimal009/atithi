import { axiosInstance } from "@/lib/axios";
import { ApiResponse } from "@/lib/types/responses";

import { CreateGalleryImageInput, GalleryImage, ListGalleryImagesResponse } from "../types";

export const getGalleryImages = async (
  tenant: string,
): Promise<ApiResponse<ListGalleryImagesResponse>> => {
  const { data } = await axiosInstance.get<ApiResponse<ListGalleryImagesResponse>>(
    `/hotels/slug/${tenant}/gallery`,
  );
  return data;
};

export const createGalleryImage = async (
  tenant: string,
  input: CreateGalleryImageInput,
): Promise<ApiResponse<GalleryImage>> => {
  const { data } = await axiosInstance.post<ApiResponse<GalleryImage>>(
    `/hotels/slug/${tenant}/gallery`,
    input,
  );
  return data;
};

export const deleteGalleryImage = async (
  tenant: string,
  imageId: string,
): Promise<ApiResponse<null>> => {
  const { data } = await axiosInstance.delete<ApiResponse<null>>(
    `/hotels/slug/${tenant}/gallery/${imageId}`,
  );
  return data;
};
