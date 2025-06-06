import { AxiosRequestConfig } from "axios";
import mainAxiosInstance, {
  alternateAxiosInstance,
  setInterceptors,
} from "./AxiosInstance";

const withInterceptors = async (
  callback: () => Promise<any>,
  useAlternate: boolean = false
) => {
  const axiosInstance = useAlternate
    ? alternateAxiosInstance
    : mainAxiosInstance;
  await setInterceptors(axiosInstance);
  return callback();
};

// Function to make a GET request with optional params and headers
export const getAPI = async <T>(
  endpoint: string,
  params: any = {},
  headers: AxiosRequestConfig["headers"] = {},
  useAlternate: boolean = false
): Promise<T> => {
  return withInterceptors(async () => {
    try {
      const axiosInstance = useAlternate
        ? alternateAxiosInstance
        : mainAxiosInstance;
      const response = await axiosInstance.get<T>(endpoint, {
        params,
        headers,
      });
      return response.data;
    } catch (error: any) {
      if (error?.response?.data?.status === 401) {
        throw new Error("Please log in again");
      }
      if (error?.response?.status === 500) {
        throw new Error("Something Went Wrong");
      }
      if (
        error?.response?.status === 502 ||
        error?.response?.status === 503 ||
        error?.response?.status === 504 ||
        error?.response?.status === 505
      ) {
        throw new Error("Service unavailable");
      }
      throw new Error(
        typeof (
          error?.response?.data?.data?.details?.[0]?.message ||
          error?.response?.data?.data?.message ||
          error?.response?.data?.message ||
          error?.response?.message ||
          error?.response?.data
        ) === "string"
          ? error?.response?.data?.data?.details?.[0]?.message ||
            error?.response?.data?.data?.message ||
            error?.response?.data?.message ||
            error?.response?.message ||
            error?.response?.data
          : "Please try again after sometime"
      );
    }
  }, useAlternate);
};

// Function to make a POST request with optional data and headers
export const postAPI = async <T>(
  endpoint: string,
  data: any = {},
  params: any = {},
  headers: AxiosRequestConfig["headers"] = {},
  useAlternate: boolean = false
): Promise<T> => {
  return withInterceptors(async () => {
    try {
      const axiosInstance = useAlternate
        ? alternateAxiosInstance
        : mainAxiosInstance;
      const response = await axiosInstance.post<T>(endpoint, data, {
        params,
        headers,
      });
      return response.data;
    } catch (error: any) {
      if (
        error?.response?.status === 502 ||
        error?.response?.status === 503 ||
        error?.response?.status === 504 ||
        error?.response?.status === 505
      ) {
        throw new Error("Service unavailable");
      }
      if (error?.response?.data?.status === 401) {
        throw new Error("Please log in again");
      }
      if (error?.response?.status === 500) {
        throw new Error("Something Went Wrong");
      }
      throw new Error(
        typeof (
          error?.response?.data?.data?.details?.[0]?.message ||
          error?.response?.data?.data?.message ||
          error?.response?.data?.message ||
          error?.response?.message ||
          error?.response?.data
        ) === "string"
          ? error?.response?.data?.data?.details?.[0]?.message ||
            error?.response?.data?.data?.message ||
            error?.response?.data?.message ||
            error?.response?.message ||
            error?.response?.data
          : "Please try again after sometime"
      );
    }
  }, useAlternate);
};

// Function to make a PUT request with optional data and headers
export const putAPI = async <T>(
  endpoint: string,
  data: any = {},
  params: any = {},
  headers: AxiosRequestConfig["headers"] = {},
  useAlternate: boolean = false
): Promise<T> => {
  return withInterceptors(async () => {
    try {
      const axiosInstance = useAlternate
        ? alternateAxiosInstance
        : mainAxiosInstance;
      const response = await axiosInstance.put<T>(endpoint, data, {
        params,
        headers,
      });
      return response.data;
    } catch (error: any) {
      if (
        error?.response?.status === 502 ||
        error?.response?.status === 503 ||
        error?.response?.status === 504 ||
        error?.response?.status === 505
      ) {
        throw new Error("Service unavailable");
      }
      if (error?.response?.data?.status === 401) {
        throw new Error("Please log in again");
      }
      if (error?.response?.status === 500) {
        throw new Error("Something Went Wrong");
      }
      throw new Error(
        typeof (
          error?.response?.data?.data?.details?.[0]?.message ||
          error?.response?.data?.data?.message ||
          error?.response?.data?.message ||
          error?.response?.message ||
          error?.response?.data
        ) === "string"
          ? error?.response?.data?.data?.details?.[0]?.message ||
            error?.response?.data?.data?.message ||
            error?.response?.data?.message ||
            error?.response?.message ||
            error?.response?.data
          : "Please try again after sometime"
      );
    }
  }, useAlternate);
};

// Function to make a DELETE request with optional data and headers
export const deleteAPI = async <T>(
  endpoint: string,
  data: any = {},
  params: any = {},
  headers: AxiosRequestConfig["headers"] = {},
  useAlternate: boolean = false
): Promise<T> => {
  return withInterceptors(async () => {
    try {
      const axiosInstance = useAlternate
        ? alternateAxiosInstance
        : mainAxiosInstance;
      const response = await axiosInstance.delete<T>(endpoint, {
        data,
        params,
        headers,
      });
      return response.data;
    } catch (error: any) {
      if (
        error?.response?.status === 502 ||
        error?.response?.status === 503 ||
        error?.response?.status === 504 ||
        error?.response?.status === 505
      ) {
        throw new Error("Service unavailable");
      }
      if (error?.response?.data?.status === 401) {
        throw new Error("Please log in again");
      }
      if (error?.response?.status === 500) {
        throw new Error("Something Went Wrong");
      }
      throw new Error(
        typeof (
          error?.response?.data?.data?.details?.[0]?.message ||
          error?.response?.data?.data?.message ||
          error?.response?.data?.message ||
          error?.response?.message ||
          error?.response?.data
        ) === "string"
          ? error?.response?.data?.data?.details?.[0]?.message ||
            error?.response?.data?.data?.message ||
            error?.response?.data?.message ||
            error?.response?.message ||
            error?.response?.data
          : "Please try again after sometime"
      );
    }
  }, useAlternate);
};
