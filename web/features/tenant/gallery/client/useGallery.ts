"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/axios";

import { createGalleryImage, deleteGalleryImage, getGalleryImages } from "../api/gallery";
import type { CreateGalleryImageInput } from "../types";

export const galleryKeys = {
  list: (tenant: string) => ["gallery-images", tenant] as const,
};

export const useGalleryImagesQuery = (tenant: string) =>
  useQuery({
    queryKey: galleryKeys.list(tenant),
    queryFn: async () => (await getGalleryImages(tenant)).data.images,
  });

export const useCreateGalleryImage = (tenant: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateGalleryImageInput) => createGalleryImage(tenant, input),
    onSuccess: (response) => {
      queryClient.setQueryData(galleryKeys.list(tenant), (prev: typeof response.data[] = []) => [
        ...prev,
        response.data,
      ]);
      toast.success(response.message);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Could not add that photo"));
    },
  });
};

export const useDeleteGalleryImage = (tenant: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (imageId: string) => deleteGalleryImage(tenant, imageId),
    onSuccess: (response, imageId) => {
      queryClient.setQueryData(
        galleryKeys.list(tenant),
        (prev: { id: string }[] = []) => prev.filter((img) => img.id !== imageId),
      );
      toast.success(response.message);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Could not remove that photo"));
    },
  });
};
