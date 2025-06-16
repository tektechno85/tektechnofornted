import { useEffect, useState } from "react";
import { Search, Download, ChevronDown, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import DashboardLayout from "@/components/DashboardLayout";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllPayoutTransactions,
  checkPayoutStatus,
} from "@/store/thunks/payoutThunks";
import { toast } from "sonner";
import dayjs from "dayjs";
import {
  Pagination,
  PaginationPrevious,
  PaginationItem,
  PaginationContent,
  PaginationLink,
  PaginationNext,
} from "@/components/ui/pagination";

interface PayoutData {
  status: string;
  beneficiaryId: string;
  beneficiaryName: string;
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

interface RootState {
  payout: {
    allPayoutTransactions: {
      content: PayoutData[] | null;
      loading: boolean;
    };
  };
}

const Payout = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [payoutType, setPayoutType] = useState("all");
  const [payouts, setPayouts] = useState<PayoutData[]>([]);
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState<string | null>(null);
  const [statusResponse, setStatusResponse] = useState<StatusResponse | null>(
    null
  );
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const dispatch = useDispatch();
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);

  const filteredPayouts =
    payouts?.filter((payout) => {
      const matchesSearch = payout.orderId
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesFilterType =
        filterType === "all" || filterType === payout.status.toLowerCase();
      const matchesPayoutType =
        payoutType === "all" || payoutType === payout.status.toLowerCase();
      return matchesSearch && matchesFilterType && matchesPayoutType;
    }) || [];

  const FetchAllPayouts = async () => {
    setLoading(true);
    try {
      const response = await dispatch(
        fetchAllPayoutTransactions({
          pageNumber: currentPage,
          pageSize: pageSize,
        }) as any
      );
      if (response.payload) {
        setPayouts(response.payload.transactions);
        setTotalPages(response.payload.totalPages);
        setTotalElements(response.payload.totalElements);
      }
    } catch (error) {
      toast.error("Failed to fetch payouts");
    } finally {
      setLoading(false);
    }
  };

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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    FetchAllPayouts();
  }, [currentPage]);

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
          <h1 className="text-xl font-semibold">Payouts</h1>
          <Button
            variant="outline"
            onClick={FetchAllPayouts}
            disabled={loading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            {loading ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Payout History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by Payout ID"
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="payout">Payout</SelectItem>
                      <SelectItem value="settlement">Settlement</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={payoutType} onValueChange={setPayoutType}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Payout Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="payout">Payout</SelectItem>
                      <SelectItem value="settlement">Settlement</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="icon">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Table */}
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">
                        <input type="checkbox" className="h-4 w-4" />
                      </TableHead>
                      <TableHead>ORDER ID</TableHead>
                      <TableHead>BENEFICIARY ID</TableHead>
                      <TableHead>BENEFICIARY NAME</TableHead>
                      <TableHead>OPENING BALANCE</TableHead>
                      <TableHead>LOCKED AMOUNT</TableHead>
                      <TableHead>CHARGED AMOUNT</TableHead>
                      <TableHead>STATUS</TableHead>
                      <TableHead>DATE</TableHead>
                      <TableHead>ACTIONS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      Array.from({ length: 5 }).map((_, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Skeleton className="h-4 w-4" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-[120px]" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-[120px]" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-[150px]" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-[80px]" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-[80px]" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-[80px]" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-[80px]" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-[100px]" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-8 w-[100px]" />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : filteredPayouts.length > 0 ? (
                      filteredPayouts.map((payout) => (
                        <TableRow key={payout.orderId}>
                          <TableCell>
                            <input type="checkbox" className="h-4 w-4" />
                          </TableCell>
                          <TableCell className="font-medium">
                            {payout.orderId}
                            <div className="text-xs text-muted-foreground">
                              {payout.cyrusOrderId}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-mono text-sm">
                              {payout.beneficiaryId}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">
                              {payout.beneficiaryName}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            ₹{" "}
                            {parseFloat(payout.openingBalance || "0").toFixed(
                              2
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            ₹{" "}
                            {parseFloat(payout.lockedAmount || "0").toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right">
                            ₹{" "}
                            {parseFloat(payout.chargedAmount || "0").toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                payout.status === "SUCCESS"
                                  ? "bg-green-50 text-green-700"
                                  : payout.status === "FAILED"
                                  ? "bg-red-50 text-red-700"
                                  : "bg-yellow-50 text-yellow-700"
                              }`}
                            >
                              {payout.status}
                            </span>
                          </TableCell>
                          <TableCell>
                            {dayjs(payout.createdAt).format("DD-MM-YYYY HH:mm")}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleCheckStatus(payout.orderId)
                                }
                                disabled={checkingStatus === payout.orderId}
                              >
                                {checkingStatus === payout.orderId ? (
                                  <RefreshCw className="h-4 w-4 animate-spin" />
                                ) : (
                                  "Check Status"
                                )}
                              </Button>
                              <Button variant="ghost" size="icon">
                                <ChevronDown className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-8">
                          No payouts found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {!loading && filteredPayouts.length > 0 && (
                <div className="flex items-center justify-between py-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {currentPage * pageSize + 1} to{" "}
                    {Math.min((currentPage + 1) * pageSize, totalElements)} of{" "}
                    {totalElements} entries
                  </div>
                  <div>
                    <nav>
                      <ul className="flex items-center gap-1">
                        <li>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              currentPage > 0 &&
                              handlePageChange(currentPage - 1)
                            }
                            disabled={currentPage === 0}
                          >
                            &lt;
                          </Button>
                        </li>
                        {totalPages <= 5
                          ? Array.from({ length: totalPages }, (_, i) => (
                              <li key={i}>
                                <Button
                                  variant={
                                    currentPage === i ? "default" : "ghost"
                                  }
                                  size="icon"
                                  onClick={() => handlePageChange(i)}
                                >
                                  {i + 1}
                                </Button>
                              </li>
                            ))
                          : Array.from({ length: 5 }, (_, i) => {
                              let pageNum;
                              if (currentPage < 2) {
                                pageNum = i;
                              } else if (currentPage >= totalPages - 2) {
                                pageNum = totalPages - 5 + i;
                              } else {
                                pageNum = currentPage - 2 + i;
                              }
                              if (pageNum >= 0 && pageNum < totalPages) {
                                return (
                                  <li key={pageNum}>
                                    <Button
                                      variant={
                                        currentPage === pageNum
                                          ? "default"
                                          : "ghost"
                                      }
                                      size="icon"
                                      onClick={() => handlePageChange(pageNum)}
                                    >
                                      {pageNum + 1}
                                    </Button>
                                  </li>
                                );
                              }
                              return null;
                            })}
                        <li>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              currentPage < totalPages - 1 &&
                              handlePageChange(currentPage + 1)
                            }
                            disabled={currentPage === totalPages - 1}
                          >
                            &gt;
                          </Button>
                        </li>
                      </ul>
                    </nav>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </DashboardLayout>
  );
};

export default Payout;