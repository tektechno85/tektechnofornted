import { createAsyncThunk } from "@reduxjs/toolkit";
import { getApiUrl } from "../../config/api";
import { getAPI, postAPI } from "@/config/ApiService";

interface BeneficiaryAddress {
  line: string;
  area: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
}

export interface Beneficiary {
  beneficiaryId: string;
  beneType: string;
  beneficiaryBankAccountNumber: string;
  beneficiaryBankIfscCode: string;
  beneficiaryName: string;
  beneficiaryBankName: string;
  beneficiaryEmail: string;
  beneficiaryMobileNumber: string;
  beneficiaryPan: string;
  beneficiaryAadhaar: string;
  beneficiaryAddress: string;
  latitude: number;
  longitude: number;
  status: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AddBeneficiaryData {
  beneficiaryName: string;
  beneficiaryMobileNumber: string;
  beneficiaryEmail: string;
  beneficiaryPanNumber: string;
  beneficiaryAadhaarNumber: string;
  beneficiaryAddress: string;
  beneficiaryBankName: string;
  beneficiaryAccountNumber: string;
  beneficiaryIfscCode: string;
  beneType: string;
  latitude: number;
  longitude: number;
  address: BeneficiaryAddress;
}

interface UpdateBeneficiaryParams {
  beneficiaryId: string;
  beneficiaryIfscCode: string;
}

interface SendMoneyData {
  beneficiaryId: string;
  beneficiaryName: string;
  beneficiaryMobileNumber: string;
  comment: string;
  remarks: string;
  amount: number;
  transferType: "IMPS" | "NEFT" | "RTGS";
}

interface TransactionDetailsParams {
  beneficiaryId: string;
  pageNumber: number;
  pageSize: number;
}

interface PaginationParams {
  pageNumber: number;
  pageSize: number;
}

interface PayoutTransaction {
  id: string;
  orderId: string;
  beneficiaryId: string;
  beneficiaryName: string;
  beneficiaryMobileNumber: string;
  amount: number;
  transferType: string;
  status: string;
  comment: string;
  remarks: string;
  createdAt: string;
  updatedAt: string;
}

interface PayoutTransactionResponse {
  transactions: PayoutTransaction[];
  totalElements: number;
  totalPages: number;
}

interface BulkUploadResponse {
  successful: number;
  failed: number;
  errors: Array<{
    row: number;
    error: string;
  }>;
}

// Add the bulk upload thunk
// export const bulkUploadBeneficiaries = createAsyncThunk(
//   "payout/bulkUploadBeneficiaries",
//   async (
//     {
//       file,
//       beneficiaryData,
//     }: {
//       file: File;
//       beneficiaryData: {
//         beneficiaryName: string;
//         beneficiaryMobileNumber: string;
//         beneficiaryEmail: string;
//         beneficiaryPanNumber: string;
//         beneficiaryAadhaarNumber: string;
//         beneficiaryAddress: string;
//         beneficiaryBankName: string;
//         beneficiaryAccountNumber: string;
//         beneficiaryIfscCode: string;
//         beneType: string;
//         latitude: number;
//         longitude: number;
//         address: {
//           line: string;
//           area: string;
//           city: string;
//           district: string;
//           state: string;
//           pincode: string;
//         };
//       };
//     },
//     { rejectWithValue }
//   ) => {
//     try {
//       const formData = new FormData();
//       formData.append("file", file);
//       formData.append("beneficiaryData", JSON.stringify(beneficiaryData));

//       const response = await fetch(
//         getApiUrl("/payout/beneficiaries/bulk-upload"),
//         {
//           method: "POST",
//           body: formData,
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//         }
//       );

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => null);
//         throw new Error(errorData?.message || "Failed to upload beneficiaries");
//       }

//       const data = await response.json();
//       return data as BulkUploadResponse;
//     } catch (error) {
//       return rejectWithValue((error as Error).message);
//     }
//   }
// );
export const bulkUploadBeneficiaries = createAsyncThunk(
  "payout/bulkUploadBeneficiaries",
  async (
    {
      file,
      beneficiaryData,
      onSuccess,
      onError,
    }: {
      file: File;
      beneficiaryData: any;
      onSuccess: () => void;
      onError: (error: string) => void;
    },
    { rejectWithValue }
  ) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append(
        "data",
        new Blob([JSON.stringify(beneficiaryData)], {
          type: "application/json",
        })
      );

      const res: Response = await fetch(
        getApiUrl("/payout/beneficiaries/bulk-upload"),
        {
          method: "POST",
          body: formData,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            // DO NOT set Content-Type manually; let browser handle it for multipart
          },
        }
      );

      if (!res.ok) {
        onError(res.statusText || "Failed to upload beneficiaries");
        throw new Error(res.statusText || "Failed to upload beneficiaries");
      }

      onSuccess();

      return res.json();
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const fetchBeneficiaryTypes = createAsyncThunk(
  "payout/fetchBeneficiaryTypes",
  async (_, { rejectWithValue }) => {
    try {
      const res = await getAPI<{
        response: boolean;
        message: string;
        data: {
          ID: number;
          PAY_TYPE: string;
        }[];
        status: string;
        timestamp: string;
      }>("/payout/beneficiary-type");

      if (!res.response) {
        throw new Error(res.message || "Failed to fetch beneficiary types");
      }

      return res.data;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const fetchPayoutReasons = createAsyncThunk(
  "payout/fetchPayoutReasons",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(getApiUrl("/payout/pay-reason"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Failed to fetch payout reasons");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const addBeneficiary = createAsyncThunk(
  "payout/addBeneficiary",
  async (beneficiaryData: AddBeneficiaryData, { rejectWithValue }) => {
    try {
      const res = await postAPI<{
        response: boolean;
        message: string;
        data: Beneficiary;
        status: string;
        timestamp: string;
      }>("/payout/add/beneficiary", beneficiaryData);

      if (!res.response) {
        throw new Error(res.message || "Failed to add beneficiary");
      }

      return res.data;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const fetchBeneficiaryDetails = createAsyncThunk(
  "payout/fetchBeneficiaryDetails",
  async (mobileNumber: string, { rejectWithValue }) => {
    try {
      const response = await fetch(
        getApiUrl(
          `/payout/beneficiary-details?beneficiaryMobileNumber=${mobileNumber}`
        ),
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message || "Failed to fetch beneficiary details"
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const updateBeneficiary = createAsyncThunk(
  "payout/updateBeneficiary",
  async (params: UpdateBeneficiaryParams, { rejectWithValue }) => {
    try {
      console.log({ params });

      const res = await postAPI<{
        response: boolean;
        message: string;
        data: Beneficiary;
        status: string;
        timestamp: string;
      }>(
        "/payout/update/beneficiary",
        {},
        {
          beneficiaryIfscCode: params.beneficiaryIfscCode,
          beneficiaryId: params.beneficiaryId,
        }
      );

      if (!res.response) {
        throw new Error(res.message || "Failed to update beneficiary");
      }

      return res.data;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const sendMoney = createAsyncThunk(
  "payout/sendMoney",
  async (paymentData: SendMoneyData, { rejectWithValue }) => {
    try {
      const res = await postAPI<{
        response: boolean;
        message: string;
        data: any;
        status: string;
        timestamp: string;
      }>("/payout/send-money", paymentData);

      if (!res.response) {
        throw new Error(res.message || "Failed to send money");
      }

      return res.data;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const checkPayoutStatus = createAsyncThunk(
  "payout/checkStatus",
  async (orderId: string, { rejectWithValue }) => {
    try {
      const res = await getAPI<{
        response: boolean;
        message: string;
        data: any;
        status: string;
        timestamp: string;
      }>(`/payout/check-status?orderId=${orderId}`);

      if (!res.response) {
        throw new Error(res.message || "Failed to check payout status");
      }

      return res.data;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const fetchTransactionDetails = createAsyncThunk(
  "payout/fetchTransactionDetails",
  async (params: TransactionDetailsParams, { rejectWithValue }) => {
    try {
      const res = await getAPI<{
        response: boolean;
        message: string;
        data: {
          totalPages: number;
          totalElements: number;
          transactions: {
            beneficiaryId: string;
            chargedAmount: string;
            createdAt: string;
            cyrusId: string;
            cyrusOrderId: string;
            lockedAmount: string;
            openingBalance: string;
            orderId: string;
            rrnNumber: string;
            status: string;
            updatedAt: string;
          }[];
        };
        status: string;
        timestamp: string;
      }>(
        `/payout/transaction-details?beneficiaryId=${params.beneficiaryId}&pageNumber=${params.pageNumber}&pageSize=${params.pageSize}`
      );

      if (!res.response) {
        throw new Error(res.message || "Failed to fetch transaction details");
      }

      return res.data;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const fetchBeneficiaryList = createAsyncThunk(
  "payout/fetchBeneficiaryList",
  async (params: PaginationParams, { rejectWithValue }) => {
    try {
      const res = await getAPI<{
        response: boolean;
        message: string;
        data: {
          beneficiaries: Beneficiary[];
          totalElements: number;
          totalPages: number;
        };
        status: string;
        timestamp: string;
      }>(
        `/payout/beneficiary-list?pageNumber=${params.pageNumber}&pageSize=${params.pageSize}`
      );

      if (!res.response) {
        throw new Error(res.message || "Failed to fetch beneficiary list");
      }

      return {
        beneficiaries: res.data.beneficiaries,
        totalElements: res.data.totalElements,
        totalPages: res.data.totalPages,
      };
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const fetchAllPayoutTransactions = createAsyncThunk(
  "payout/fetchAllPayoutTransactions",
  async (params: PaginationParams, { rejectWithValue }) => {
    try {
      const res = await getAPI<{
        response: boolean;
        message: string;
        data: PayoutTransactionResponse;
        status: string;
        timestamp: string;
      }>(
        `/payout/all-payout-transaction?pageNumber=${params.pageNumber}&pageSize=${params.pageSize}`
      );

      if (!res.response) {
        throw new Error(res.message || "Failed to fetch payout transactions");
      }

      return {
        transactions: res.data.transactions,
        totalElements: res.data.totalElements,
        totalPages: res.data.totalPages,
      };
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);
