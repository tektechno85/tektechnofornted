import { createAsyncThunk } from "@reduxjs/toolkit";
import { getApiUrl } from "../../config/api";

interface BeneficiaryAddress {
  line: string;
  area: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
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
  beneficiaryIfscCode: string;
  beneficiaryId: string;
}

interface SendMoneyData {
  beneficiaryId: string;
  beneficiaryName: string;
  beneficiaryMobileNumber: string;
  comment: string;
  remarks: string;
  amount: number;
  transferType: "IMPS" | "NEFT" | "RTGS"; // Using union type for specific values
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

export const fetchBeneficiaryTypes = createAsyncThunk(
  "payout/fetchBeneficiaryTypes",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(getApiUrl("/payout/beneficiary-type"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}), // Empty body as per the curl command
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message || "Failed to fetch beneficiary types"
        );
      }

      const data = await response.json();
      return data;
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
        body: JSON.stringify({}), // Empty body as per the curl command
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
      const response = await fetch(getApiUrl("/payout/add/beneficiary"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(beneficiaryData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Failed to add beneficiary");
      }

      const data = await response.json();
      return data;
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
      const response = await fetch(
        getApiUrl(
          `/payout/update/beneficiary?beneficiaryIfscCode=${params.beneficiaryIfscCode}&beneficiaryId=${params.beneficiaryId}`
        ),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Failed to update beneficiary");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const sendMoney = createAsyncThunk(
  "payout/sendMoney",
  async (paymentData: SendMoneyData, { rejectWithValue }) => {
    try {
      const response = await fetch(getApiUrl("/payout/send-money"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Failed to send money");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const checkPayoutStatus = createAsyncThunk(
  "payout/checkStatus",
  async (orderId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(
        getApiUrl(`/payout/check-status?orderId=${orderId}`),
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Failed to check payout status");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const fetchTransactionDetails = createAsyncThunk(
  "payout/fetchTransactionDetails",
  async (params: TransactionDetailsParams, { rejectWithValue }) => {
    try {
      const response = await fetch(
        getApiUrl(
          `/payout/transaction-details?beneficiaryId=${params.beneficiaryId}&pageNumber=${params.pageNumber}&pageSize=${params.pageSize}`
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
          errorData?.message || "Failed to fetch transaction details"
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const fetchBeneficiaryList = createAsyncThunk(
  "payout/fetchBeneficiaryList",
  async (params: PaginationParams, { rejectWithValue }) => {
    try {
      const response = await fetch(
        getApiUrl(
          `/payout/beneficiary-list?pageNumber=${params.pageNumber}&pageSize=${params.pageSize}`
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
          errorData?.message || "Failed to fetch beneficiary list"
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);
