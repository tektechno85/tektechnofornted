import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import DashboardLayout from "@/components/DashboardLayout";
import { useEffect, useState } from "react";
import { Search, Download, ArrowLeft, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useNavigate, useParams } from "react-router-dom";
import {
  checkPayoutStatus,
  fetchTransactionDetails,
} from "@/store/thunks/payoutThunks";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { AppDispatch } from "@/store/store";

interface Transaction {
  status: string;
  beneficiaryId: string;
  orderId: string;
  cyrusOrderId: string;
  cyrusId: string;
  rrnNumber: string;
  openingBalance: string;
  lockedAmount: string;
  chargedAmount: string;
  createdAt: string;
  updatedAt: string;
}

interface StatusResponse {
  statuscode: string;
  status: string;
  data: {
    orderId: string;
    cyrusOrderId: string;
    cyrus_id: string;
    opening_bal: string;
    locked_amt: string;
    charged_amt: string;
    rrn: string;
  };
}

interface ApiResponse<T> {
  payload: T;
  error?: string;
}

const Transactions = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { beneficiaryId } = useParams();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkingStatus, setCheckingStatus] = useState<string | null>(null);
  const [statusResponse, setStatusResponse] = useState<StatusResponse | null>(
    null
  );
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  const fetchTransactions = async () => {
    if (!beneficiaryId) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = (await dispatch(
        fetchTransactionDetails({
          beneficiaryId,
          pageNumber: 0,
          pageSize: 10,
        }) as any
      )) as unknown as ApiResponse<Transaction[]>;
      if (!response.payload) {
        throw new Error(response.error || "Failed to fetch transactions");
      }
      setTransactions(response.payload || []);
    } catch (error: any) {
      const errorMessage =
        error?.message || "Something went wrong while fetching transactions";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [beneficiaryId]);

  const handleCheckStatus = async (orderId: string) => {
    setCheckingStatus(orderId);
    try {
      const response = (await dispatch(
        checkPayoutStatus(orderId) as any
      )) as unknown as ApiResponse<StatusResponse>;
      if (!response.payload) {
        throw new Error(response.error || "Failed to check status");
      }
      setStatusResponse(response.payload);
      setIsStatusModalOpen(true);
      toast.success("Status check completed");
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to check status";
      toast.error(errorMessage);
    } finally {
      setCheckingStatus(null);
    }
  };

  const handleRetry = () => {
    fetchTransactions();
  };

  if (!beneficiaryId) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] p-4">
          <p className="text-muted-foreground mb-4">Invalid beneficiary ID</p>
          <Button onClick={() => navigate("/beneficiaries")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Beneficiaries
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const filteredTransactions = transactions.filter((transaction) =>
    transaction.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      {/* Status Check Modal */}
      <Dialog open={isStatusModalOpen} onOpenChange={setIsStatusModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transaction Status Details</DialogTitle>
          </DialogHeader>
          {statusResponse && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Order ID</p>
                  <p className="font-medium">{statusResponse.data.orderId}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Cyrus Order ID
                  </p>
                  <p className="font-medium">
                    {statusResponse.data.cyrusOrderId}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      statusResponse.status.toLowerCase() === "completed"
                        ? "bg-green-100 text-green-800"
                        : statusResponse.status.toLowerCase() === "failed"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {statusResponse.status}
                  </span>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">RRN</p>
                  <p className="font-medium">
                    {statusResponse.data.rrn || "N/A"}
                  </p>
                </div>
              </div>
              <div className="space-y-4 pt-4 border-t">
                <h4 className="font-medium">Amount Details</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Opening Balance
                    </p>
                    <p className="font-medium text-green-600">
                      ₹{parseFloat(statusResponse.data.opening_bal).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Locked Amount
                    </p>
                    <p className="font-medium text-yellow-600">
                      ₹{parseFloat(statusResponse.data.locked_amt).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Charged Amount
                    </p>
                    <p className="font-medium text-blue-600">
                      ₹{parseFloat(statusResponse.data.charged_amt).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
        <div className="flex h-16 items-center justify-between py-4 px-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/beneficiaries")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-xl font-semibold">Transactions</h1>
          </div>
          <Button variant="outline" onClick={handleRetry} disabled={isLoading}>
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            {isLoading ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>
              View all transactions for this beneficiary
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="flex flex-col items-center justify-center py-8">
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={handleRetry} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Search and Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by status..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button variant="outline" size="icon">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>

                {/* Table */}
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, index) => (
                      <div key={index} className="flex items-center space-x-4">
                        <Skeleton className="h-12 w-[150px]" />
                        <Skeleton className="h-12 w-[100px]" />
                        <Skeleton className="h-12 w-[100px]" />
                        <Skeleton className="h-12 w-[200px]" />
                        <Skeleton className="h-12 w-[150px]" />
                      </div>
                    ))}
                  </div>
                ) : filteredTransactions.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ORDER ID</TableHead>
                        <TableHead>OPENING BALANCE</TableHead>
                        <TableHead>LOCKED AMOUNT</TableHead>
                        <TableHead>CHARGED AMOUNT</TableHead>
                        <TableHead>STATUS</TableHead>
                        <TableHead>RRN</TableHead>
                        <TableHead>ACTIONS</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTransactions.map((transaction) => (
                        <TableRow key={transaction.orderId}>
                          <TableCell className="font-medium">
                            {transaction.orderId}
                            <div className="text-xs text-muted-foreground">
                              {transaction.cyrusOrderId}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium text-green-600">
                            ₹{parseFloat(transaction.openingBalance).toFixed(2)}
                          </TableCell>
                          <TableCell className="font-medium text-yellow-600">
                            ₹{parseFloat(transaction.lockedAmount).toFixed(2)}
                          </TableCell>
                          <TableCell className="font-medium text-blue-600">
                            ₹{parseFloat(transaction.chargedAmount).toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                transaction.status.toLowerCase() === "completed"
                                  ? "bg-green-100 text-green-800"
                                  : transaction.status.toLowerCase() ===
                                    "failed"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {transaction.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {transaction.rrnNumber}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleCheckStatus(transaction.orderId)
                              }
                              disabled={checkingStatus === transaction.orderId}
                            >
                              {checkingStatus === transaction.orderId ? (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                              ) : (
                                "Check Status"
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      No transactions found for this beneficiary.
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Transactions;
