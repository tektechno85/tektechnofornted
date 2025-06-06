import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  fetchBeneficiaryTypes,
  fetchPayoutReasons,
  addBeneficiary,
  fetchBeneficiaryDetails,
  updateBeneficiary,
  sendMoney,
  checkPayoutStatus,
  fetchTransactionDetails,
  fetchBeneficiaryList,
} from "../thunks/payoutThunks";

interface PayoutState {
  beneficiaryTypes: any[] | null;
  payoutReasons: any[] | null;
  addBeneficiaryResponse: any | null;
  beneficiaryDetails: any | null;
  updateBeneficiaryResponse: any | null;
  sendMoneyResponse: any | null;
  payoutStatus: any | null;
  transactionDetails: {
    content: any[] | null;
    totalElements: number;
    totalPages: number;
    pageNumber: number;
    pageSize: number;
  };
  beneficiaryList: {
    content: any[] | null;
    totalElements: number;
    totalPages: number;
    pageNumber: number;
    pageSize: number;
  };
  loading: boolean;
  error: string | null;
}

const initialState: PayoutState = {
  beneficiaryTypes: null,
  payoutReasons: null,
  addBeneficiaryResponse: null,
  beneficiaryDetails: null,
  updateBeneficiaryResponse: null,
  sendMoneyResponse: null,
  payoutStatus: null,
  transactionDetails: {
    content: null,
    totalElements: 0,
    totalPages: 0,
    pageNumber: 0,
    pageSize: 10,
  },
  beneficiaryList: {
    content: null,
    totalElements: 0,
    totalPages: 0,
    pageNumber: 0,
    pageSize: 10,
  },
  loading: false,
  error: null,
};

const payoutSlice = createSlice({
  name: "payout",
  initialState,
  reducers: {
    clearPayoutError: (state) => {
      state.error = null;
    },
    clearBeneficiaryTypes: (state) => {
      state.beneficiaryTypes = null;
    },
    clearPayoutReasons: (state) => {
      state.payoutReasons = null;
    },
    clearAddBeneficiaryResponse: (state) => {
      state.addBeneficiaryResponse = null;
    },
    clearBeneficiaryDetails: (state) => {
      state.beneficiaryDetails = null;
    },
    clearUpdateBeneficiaryResponse: (state) => {
      state.updateBeneficiaryResponse = null;
    },
    clearSendMoneyResponse: (state) => {
      state.sendMoneyResponse = null;
    },
    clearPayoutStatus: (state) => {
      state.payoutStatus = null;
    },
    clearTransactionDetails: (state) => {
      state.transactionDetails = {
        content: null,
        totalElements: 0,
        totalPages: 0,
        pageNumber: 0,
        pageSize: 10,
      };
    },
    clearBeneficiaryList: (state) => {
      state.beneficiaryList = {
        content: null,
        totalElements: 0,
        totalPages: 0,
        pageNumber: 0,
        pageSize: 10,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // Beneficiary Types
      .addCase(fetchBeneficiaryTypes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchBeneficiaryTypes.fulfilled,
        (state, action: PayloadAction<any[]>) => {
          state.loading = false;
          state.beneficiaryTypes = action.payload;
        }
      )
      .addCase(fetchBeneficiaryTypes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Payout Reasons
      .addCase(fetchPayoutReasons.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchPayoutReasons.fulfilled,
        (state, action: PayloadAction<any[]>) => {
          state.loading = false;
          state.payoutReasons = action.payload;
        }
      )
      .addCase(fetchPayoutReasons.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Add Beneficiary
      .addCase(addBeneficiary.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.addBeneficiaryResponse = null;
      })
      .addCase(
        addBeneficiary.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.addBeneficiaryResponse = action.payload;
        }
      )
      .addCase(addBeneficiary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Beneficiary Details
      .addCase(fetchBeneficiaryDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.beneficiaryDetails = null;
      })
      .addCase(
        fetchBeneficiaryDetails.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.beneficiaryDetails = action.payload;
        }
      )
      .addCase(fetchBeneficiaryDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Beneficiary
      .addCase(updateBeneficiary.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.updateBeneficiaryResponse = null;
      })
      .addCase(
        updateBeneficiary.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.updateBeneficiaryResponse = action.payload;
        }
      )
      .addCase(updateBeneficiary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Send Money
      .addCase(sendMoney.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.sendMoneyResponse = null;
      })
      .addCase(sendMoney.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.sendMoneyResponse = action.payload;
      })
      .addCase(sendMoney.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Check Payout Status
      .addCase(checkPayoutStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        checkPayoutStatus.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.payoutStatus = action.payload;
        }
      )
      .addCase(checkPayoutStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Transaction Details
      .addCase(fetchTransactionDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchTransactionDetails.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.transactionDetails = {
            content: action.payload.content || null,
            totalElements: action.payload.totalElements || 0,
            totalPages: action.payload.totalPages || 0,
            pageNumber: action.payload.pageNumber || 0,
            pageSize: action.payload.pageSize || 10,
          };
        }
      )
      .addCase(fetchTransactionDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Beneficiary List
      .addCase(fetchBeneficiaryList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchBeneficiaryList.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.beneficiaryList = {
            content: action.payload.content || null,
            totalElements: action.payload.totalElements || 0,
            totalPages: action.payload.totalPages || 0,
            pageNumber: action.payload.pageNumber || 0,
            pageSize: action.payload.pageSize || 10,
          };
        }
      )
      .addCase(fetchBeneficiaryList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearPayoutError,
  clearBeneficiaryTypes,
  clearPayoutReasons,
  clearAddBeneficiaryResponse,
  clearBeneficiaryDetails,
  clearUpdateBeneficiaryResponse,
  clearSendMoneyResponse,
  clearPayoutStatus,
  clearTransactionDetails,
  clearBeneficiaryList,
} = payoutSlice.actions;
export default payoutSlice.reducer;
