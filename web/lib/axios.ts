import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export const axiosInstance = axios.create({
  baseURL: `${API_URL}/api/v1`,
  withCredentials: true,
});

export const getErrorMessage = (
  error: unknown,
  fallback = "Something went wrong",
) => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    return data?.message ?? error.message ?? fallback;
  }
  if (error instanceof Error) return error.message;
  return fallback;
};
