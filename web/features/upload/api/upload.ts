import axios from "axios";

import { axiosInstance } from "@/lib/axios";
import { ApiResponse } from "@/lib/types/responses";

import { ImageKitAuth, UploadedImage } from "../types";

const IMAGEKIT_UPLOAD_URL = "https://upload.imagekit.io/api/v1/files/upload";

export const getImageKitAuth = async (): Promise<ImageKitAuth> => {
  const { data } = await axiosInstance.get<ApiResponse<ImageKitAuth>>(
    "/uploads/imagekit-auth",
  );
  return data.data;
};


export const uploadImage = async (
  file: File,
  options?: {
    folder?: string;
    onProgress?: (percent: number) => void;
    signal?: AbortSignal;
  },
): Promise<UploadedImage> => {
  const auth = await getImageKitAuth();

  const form = new FormData();
  form.append("file", file);
  form.append("fileName", file.name);
  form.append("publicKey", auth.publicKey);
  form.append("signature", auth.signature);
  form.append("expire", String(auth.expire));
  form.append("token", auth.token);
  form.append("useUniqueFileName", "true");
  if (options?.folder) form.append("folder", options.folder);

  const { data } = await axios.post<UploadedImage>(IMAGEKIT_UPLOAD_URL, form, {
    signal: options?.signal,
    onUploadProgress: (event) => {
      if (!event.total || !options?.onProgress) return;
      options.onProgress(Math.round((event.loaded / event.total) * 100));
    },
  });

  return data;
};
