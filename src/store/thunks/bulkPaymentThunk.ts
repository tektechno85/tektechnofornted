import { getAPI, postAPI } from "@/config/ApiService";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const fetchBulkPaymentIds: any = createAsyncThunk(
  "bulkPayment/fetchBulkPaymentIds",
  async (
    {
      pageNumber,
      pageSize,
      onSuccess,
      onError,
      setIsLoading,
    }: {
      pageNumber: number;
      pageSize: number;
      onSuccess: (data: any) => void;
      onError: (error: any) => void;
      setIsLoading: (isLoading: boolean) => void;
    },
    { rejectWithValue }
  ) => {
    try {
      const res: {
        response: boolean;
        message: string;
        data: {
          totalPages: number;
          transactionHistory: {
            memberId: string;
            transactionId: string;
            status: string;
            createdAt: string;
            updatedAt: string;
          }[];
          currentPage: number;
          totalElements: number;
        };
        status: string;
        timestamp: string;
      } = await getAPI(
        `/payout/bulk-upload-transaction-ids?pageNo=${pageNumber}&pageSize=${pageSize}`
      );

      if (res.response) {
        onSuccess(res.data);
        setIsLoading(false);
      } else {
        onError(res.message);
        setIsLoading(false);
      }
    } catch (error) {
      setIsLoading(false);
      return rejectWithValue(error);
    }
  }
);

export const fetchBulkPaymentAmountDetails: any = createAsyncThunk(
  "bulkPayment/fetchBulkPaymentAmountDetails",
  async (
    {
      transactionId,
      onSuccess,
      onError,
      setIsLoading,
    }: {
      transactionId: string;
      onSuccess: (data: any) => void;
      onError: (error: any) => void;
      setIsLoading: (isLoading: boolean) => void;
    },
    { rejectWithValue }
  ) => {
    try {
      const res: {
        response: boolean;
        message: string;
        data: {
          memberId: string;
          transactionId: string;
          beneficiaryId: string;
          transactionType: string;
          beneficiaryCyrusId: string;
          beneficiaryName: string;
          beneficiaryMobileNumber: string;
          status: string;
          comment: string;
          remarks: string;
          amount: number;
          createdAt: string;
          updatedAt: string;
        }[];
        status: string;
        timestamp: string;
      } = await getAPI(
        `/payout/bulk-upload-amount-details-by-transaction-id?transactionId=${transactionId}`
      );

      if (res.response) {
        onSuccess(res.data);
        setIsLoading(false);
      } else {
        onError(res.message);
        setIsLoading(false);
      }
    } catch (error) {
      setIsLoading(false);
      return rejectWithValue(error);
    }
  }
);

export const bulkUploadPaymentAcceptOrDenied: any = createAsyncThunk(
  "bulkPayment/bulkUploadPaymentAcceptOrDenied",
  async (
    {
      transactionId,
      status = false,
      onSuccess,
      onError,
      setIsLoading,
    }: {
      transactionId: string;
      status: boolean;
      onSuccess: (data: any) => void;
      onError: (error: any) => void;
      setIsLoading: (isLoading: boolean) => void;
    },
    { rejectWithValue }
  ) => {
    try {
      const res: {
        response: boolean;
        message: string;
        data: any;
        status: boolean;
      } = await postAPI(
        `payout/bulk-upload-payment-accept-or-denied?transactionId=${transactionId}&status=${
          status ? `true` : `false`
        }`
      );

      if (res.response) {
        onSuccess(res.data);
        setIsLoading(false);
      } else {
        onError(res.message);
        setIsLoading(false);
      }
    } catch (error) {
      setIsLoading(false);
      return rejectWithValue(error);
    }
  }
);
