import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check, RefreshCw, Search, Send, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Download } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import {
  bulkUploadPaymentAcceptOrDenied,
  fetchBulkPaymentAmountDetails,
  fetchBulkPaymentIds,
} from "@/store/thunks/bulkPaymentThunk";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import dayjs from "dayjs";
import PaymentInfoModal from "@/components/BulkPayment/PaymentInfoModal";

interface BulkPaymentDetailsType {
  memberId: string;
  transactionId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}
export interface PaymentInfoDetailsType {
  memberId: string;
  transactionId: string;
  beneficiaryId: number;
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
}
const BulkPayment = () => {
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [pageNumber, setPageNumber] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [checkingStatus, setCheckingStatus] = useState<string | null>(null);
  const [bulkPaymentIds, setBulkPaymentIds] = useState<
    BulkPaymentDetailsType[]
  >([]);

  const [isPaymentInfoModalOpen, setIsPaymentInfoModalOpen] = useState(false);
  const [paymentInfoDetails, setPaymentInfoDetails] = useState<
    PaymentInfoDetailsType[]
  >([]);

  // Confirmation modal states
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] =
    useState<string>("");

  const getBulkPaymentDetails = () => {
    dispatch(
      fetchBulkPaymentIds({
        pageNumber,
        pageSize,
        onSuccess: (data: {
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
        }) => {
          setBulkPaymentIds(data.transactionHistory);
          setTotalPages(data.totalPages);
          setTotalElements(data.totalElements);
          setCurrentPage(data.currentPage);
        },
        onError: () => {},
        setIsLoading,
      })
    );
  };

  useEffect(() => {
    getBulkPaymentDetails();
  }, [pageNumber, pageSize]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  const handleViewPaymentInfo = (bulkPaymentDetail: BulkPaymentDetailsType) => {
    dispatch(
      fetchBulkPaymentAmountDetails({
        transactionId: bulkPaymentDetail.transactionId,
        onSuccess: (data: PaymentInfoDetailsType[]) => {
          setPaymentInfoDetails(data);
          setIsPaymentInfoModalOpen(true);
        },
        onError: () => {},
        setIsLoading,
      })
    );
  };
  const handlePayment = ({
    transactionId,
    status,
  }: {
    transactionId: string;
    status: boolean;
  }) => {
    dispatch(
      bulkUploadPaymentAcceptOrDenied({
        transactionId,
        status: status,
        onSuccess: (data: any) => {
          console.log(data);
          getBulkPaymentDetails();
        },
        onError: (error: any) => {
          console.log(error);
        },
        setIsLoading: (isLoading: boolean) => {
          setIsLoading(isLoading);
        },
      })
    );
  };

  const handleApproveClick = (transactionId: string) => {
    setSelectedTransactionId(transactionId);
    setIsApproveModalOpen(true);
  };

  const handleRejectClick = (transactionId: string) => {
    setSelectedTransactionId(transactionId);
    setIsRejectModalOpen(true);
  };

  const handleConfirmApprove = () => {
    handlePayment({
      transactionId: selectedTransactionId,
      status: true,
    });
    setIsApproveModalOpen(false);
    setSelectedTransactionId("");
  };

  const handleConfirmReject = () => {
    handlePayment({
      transactionId: selectedTransactionId,
      status: false,
    });
    setIsRejectModalOpen(false);
    setSelectedTransactionId("");
  };

  return (
    <DashboardLayout>
      {/* Payment Info Modal  */}
      <PaymentInfoModal
        isOpen={isPaymentInfoModalOpen}
        onClose={() => setIsPaymentInfoModalOpen(false)}
        paymentInfoDetails={paymentInfoDetails}
      />

      {/* Approve Confirmation Modal */}
      <AlertDialog
        open={isApproveModalOpen}
        onOpenChange={setIsApproveModalOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Approval</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve this bulk payment transaction?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmApprove}
              className="bg-green-600 hover:bg-green-700"
            >
              Approve
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Confirmation Modal */}
      <AlertDialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Rejection</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject this bulk payment transaction?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmReject}
              className="bg-red-600 hover:bg-red-700"
            >
              Reject
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
        <div className="flex h-16 items-center justify-between py-4 px-6">
          <h1 className="text-xl font-semibold">Bulk Payment</h1>
          <div className="flex gap-2">
            {/* <Button onClick={() => setIsModalOpen(true)}>
              Add New Beneficiary
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsBulkUploadModalOpen(true)}
            >
              Add Bulk Beneficiary
            </Button> */}
          </div>
        </div>
      </header>

      <div className="p-6">
        <Card>
          <CardHeader>
            {/* <CardTitle>Beneficiary List</CardTitle>
            <CardDescription>
              View and manage all your beneficiaries
            </CardDescription> */}
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, ID or mobile"
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Beneficiary Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="individual">Individual</SelectItem>
                    <SelectItem value="corporate">Corporate</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
              {/* Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>TRANSACTION ID</TableHead>
                      <TableHead>MEMBER ID</TableHead>
                      <TableHead>STATUS</TableHead>
                      <TableHead>DATE</TableHead>
                      <TableHead>ACTIONS</TableHead>
                      <TableHead>PAYMENT ACTIONS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      Array.from({ length: 5 }).map((_, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Skeleton className="h-4 w-[120px]" />
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
                        </TableRow>
                      ))
                    ) : bulkPaymentIds.length > 0 ? (
                      bulkPaymentIds.map((bulkPaymentId) => (
                        <TableRow key={bulkPaymentId.transactionId}>
                          {/* <TableCell>
                            <input type="checkbox" className="h-4 w-4" />
                          </TableCell> */}
                          <TableCell className="font-medium">
                            {bulkPaymentId.transactionId}
                          </TableCell>
                          <TableCell className="">
                            {bulkPaymentId.memberId}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                bulkPaymentId.status === "SUCCESS"
                                  ? "bg-green-50 text-green-700"
                                  : bulkPaymentId.status === "FAILED"
                                  ? "bg-red-50 text-red-700"
                                  : "bg-yellow-50 text-yellow-700"
                              }`}
                            >
                              {bulkPaymentId.status}
                            </span>
                          </TableCell>
                          <TableCell>
                            {dayjs(bulkPaymentId.createdAt).format(
                              "DD-MM-YYYY HH:mm"
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="bg-primary text-white"
                                onClick={() => {
                                  handleViewPaymentInfo(bulkPaymentId);
                                }}
                                disabled={
                                  checkingStatus === bulkPaymentId.transactionId
                                }
                              >
                                {checkingStatus ===
                                bulkPaymentId.transactionId ? (
                                  <RefreshCw className="h-4 w-4 animate-spin" />
                                ) : (
                                  "View Payment Info"
                                )}
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            {bulkPaymentId.status === "PENDING" ? (
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="mr-2 bg-green-50 text-green-700 hover:bg-green-100"
                                  onClick={() =>
                                    handleApproveClick(
                                      bulkPaymentId.transactionId
                                    )
                                  }
                                >
                                  <Check className="h-4 w-4 text-green-500 mr-2 bg-green-50 rounded-full p-1" />
                                  Approve
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="bg-red-50 text-red-700 hover:bg-red-100"
                                  onClick={() =>
                                    handleRejectClick(
                                      bulkPaymentId.transactionId
                                    )
                                  }
                                >
                                  <X className="h-4 w-4 text-red-500 mr-2 bg-red-50 rounded-full p-1" />
                                  Reject
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                {"N/A"}
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          No payouts found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {!isLoading && bulkPaymentIds.length > 0 && (
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
                            onClick={() => currentPage < totalPages - 1}
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
      </div>
    </DashboardLayout>
  );
};

export default BulkPayment;
