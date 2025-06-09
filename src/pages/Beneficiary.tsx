import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import DashboardLayout from "@/components/DashboardLayout";
import { useDispatch } from "react-redux";
import {
  addBeneficiary,
  fetchBeneficiaryList,
} from "@/store/thunks/payoutThunks";
import { useEffect, useState } from "react";
import {
  Search,
  Download,
  ChevronDown,
  X,
  Pencil,
  MoreHorizontal,
  ExternalLink,
  Send,
  IndianRupee,
  UserPlus,
  Users,
  Info,
  User,
  Building2,
  Landmark,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  Building,
  CalendarClock,
  BadgeCheck,
  Hash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import AddBeneficiaryModal from "@/components/beneficiary/AddBeneficiaryModal";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { SendMoneyDialog } from "@/components/beneficiary/SendMoneyDialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import BulkBeneficiaryUpload from "./BulkBeneficiaryUpload";

interface Beneficiary {
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

interface BeneficiaryFormData {
  id?: string;
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
  address: {
    line: string;
    area: string;
    city: string;
    district: string;
    state: string;
    pincode: string;
  };
}

const sendMoneySchema = z.object({
  amount: z.string().refine((val) => {
    const num = parseFloat(val);
    return !isNaN(num) && num > 0;
  }, "Amount must be greater than 0"),
  description: z.string().min(1, "Description is required"),
  paymentMode: z.enum(["IMPS", "NEFT", "RTGS"], {
    required_error: "Please select a payment mode",
  }),
});

type SendMoneyFormData = z.infer<typeof sendMoneySchema>;

const Beneficiary = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSendMoneyModalOpen, setIsSendMoneyModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBeneficiary, setSelectedBeneficiary] =
    useState<BeneficiaryFormData | null>(null);
  const [selectedBeneficiaryForPayment, setSelectedBeneficiaryForPayment] =
    useState<Beneficiary | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 10;
  const [selectedBeneficiaryDetails, setSelectedBeneficiaryDetails] =
    useState<Beneficiary | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);

  const sendMoneyForm = useForm<SendMoneyFormData>({
    resolver: zodResolver(sendMoneySchema),
    defaultValues: {
      amount: "",
      description: "",
      paymentMode: undefined,
    },
  });

  const FetchAllBeneficiary = async (page = currentPage) => {
    setIsLoading(true);
    try {
      const res = await dispatch(
        fetchBeneficiaryList({ pageNumber: page, pageSize }) as any
      );
      console.log("API Response:", res.payload); // Debug log
      if (res.payload) {
        setBeneficiaries(res.payload || []);
        setTotalPages(res.payload.totalPages || 0);
        setCurrentPage(res.payload.pageNumber || 0);
      }
    } catch (error) {
      console.error("Error fetching beneficiaries:", error);
      toast.error("Failed to fetch beneficiaries");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    FetchAllBeneficiary(currentPage);
  }, [currentPage]);

  const handleEdit = (beneficiary: Beneficiary) => {
    // Parse the address string if it exists
    let addressObj = {
      line: "",
      area: "",
      city: "",
      district: "",
      state: "",
      pincode: "",
    };

    try {
      if (beneficiary.beneficiaryAddress) {
        addressObj = JSON.parse(beneficiary.beneficiaryAddress);
      }
    } catch (error) {
      console.error("Error parsing address:", error);
    }

    // Convert Beneficiary to BeneficiaryFormData format
    const formData: BeneficiaryFormData = {
      id: beneficiary.beneficiaryId,
      beneficiaryName: beneficiary.beneficiaryName,
      beneficiaryMobileNumber: beneficiary.beneficiaryMobileNumber,
      beneficiaryEmail: beneficiary.beneficiaryEmail,
      beneficiaryPanNumber: beneficiary.beneficiaryPan,
      beneficiaryAadhaarNumber: beneficiary.beneficiaryAadhaar,
      beneficiaryAddress: beneficiary.beneficiaryAddress,
      beneficiaryBankName: beneficiary.beneficiaryBankName,
      beneficiaryAccountNumber: beneficiary.beneficiaryBankAccountNumber,
      beneficiaryIfscCode: beneficiary.beneficiaryBankIfscCode,
      beneType: beneficiary.beneType,
      latitude: beneficiary.latitude,
      longitude: beneficiary.longitude,
      address: addressObj,
    };

    setSelectedBeneficiary(formData);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBeneficiary(null);
  };

  const handleSendMoney = async (beneficiary: Beneficiary) => {
    setSelectedBeneficiaryForPayment(beneficiary);
    setIsSendMoneyModalOpen(true);
  };

  const handlePageChange = (page: number) => {
    if (page !== currentPage) {
      setCurrentPage(page);
    }
  };

  const handleViewDetails = (beneficiary: Beneficiary) => {
    setSelectedBeneficiaryDetails(beneficiary);
    setIsDetailsModalOpen(true);
  };

  const filteredBeneficiaries = beneficiaries.filter((beneficiary) => {
    const matchesSearch =
      beneficiary.beneficiaryName
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      beneficiary.beneficiaryId
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      beneficiary.beneficiaryMobileNumber.includes(searchQuery);
    const matchesType =
      filterType === "all" || filterType === beneficiary.beneType.toLowerCase();
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" ? beneficiary.status : !beneficiary.status);
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <DashboardLayout>
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
        <div className="flex h-16 items-center justify-between py-4 px-6">
          <h1 className="text-xl font-semibold">Beneficiaries</h1>
          <div className="flex gap-2">
            <Button onClick={() => setIsModalOpen(true)}>
              Add New Beneficiary
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsBulkUploadModalOpen(true)}
            >
              Add Bulk Beneficiary
            </Button>
          </div>
        </div>
      </header>

      {/* Add/Edit Beneficiary Modal */}
      <AddBeneficiaryModal
        isModalOpen={isModalOpen}
        setIsModalOpen={handleCloseModal}
        FetchAllBeneficiary={FetchAllBeneficiary}
        beneficiary={selectedBeneficiary}
      />

      {/* Send Money Dialog */}
      <SendMoneyDialog
        open={isSendMoneyModalOpen}
        onOpenChange={setIsSendMoneyModalOpen}
        beneficiaryName={selectedBeneficiaryForPayment?.beneficiaryName || ""}
        beneficiaryId={selectedBeneficiaryForPayment?.beneficiaryId || ""}
        beneficiaryMobileNumber={
          selectedBeneficiaryForPayment?.beneficiaryMobileNumber || ""
        }
      />

      <BulkBeneficiaryUpload
        isOpen={isBulkUploadModalOpen}
        onClose={() => setIsBulkUploadModalOpen(false)}
        onUploadSuccess={() => {
          FetchAllBeneficiary(0); // Refresh the beneficiary list
          setCurrentPage(0); // Reset to first page
        }}
      />

      {/* View Details Dialog */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <User className="h-5 w-5 text-primary" />
              Beneficiary Details
            </DialogTitle>
            <DialogDescription>
              Complete information about the beneficiary
            </DialogDescription>
          </DialogHeader>
          {selectedBeneficiaryDetails && (
            <div className="grid gap-6 py-4">
              {/* Personal and Bank Information in two columns */}
              <div className="grid sm:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="space-y-4 p-4 rounded-lg border bg-card">
                  <h3 className="font-semibold text-lg border-b pb-2 flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Personal Information
                  </h3>
                  <div className="grid gap-3">
                    <div className="space-y-1">
                      <Label className="text-muted-foreground flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Name
                      </Label>
                      <p className="font-medium">
                        {selectedBeneficiaryDetails.beneficiaryName}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-muted-foreground flex items-center gap-2">
                        <Hash className="h-4 w-4" />
                        ID
                      </Label>
                      <p className="font-medium">
                        {selectedBeneficiaryDetails.beneficiaryId}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-muted-foreground flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Mobile
                      </Label>
                      <p className="font-medium">
                        {selectedBeneficiaryDetails.beneficiaryMobileNumber}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-muted-foreground flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email
                      </Label>
                      <p className="font-medium">
                        {selectedBeneficiaryDetails.beneficiaryEmail || "-"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-muted-foreground flex items-center gap-2">
                        <BadgeCheck className="h-4 w-4" />
                        PAN
                      </Label>
                      <p className="font-medium">
                        {selectedBeneficiaryDetails.beneficiaryPan}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-muted-foreground flex items-center gap-2">
                        <BadgeCheck className="h-4 w-4" />
                        Aadhaar
                      </Label>
                      <p className="font-medium">
                        {selectedBeneficiaryDetails.beneficiaryAadhaar}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bank Details */}
                <div className="space-y-4 p-4 rounded-lg border bg-card">
                  <h3 className="font-semibold text-lg border-b pb-2 flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    Bank Details
                  </h3>
                  <div className="grid gap-3">
                    <div className="space-y-1">
                      <Label className="text-muted-foreground flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        Bank Name
                      </Label>
                      <p className="font-medium">
                        {selectedBeneficiaryDetails.beneficiaryBankName}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-muted-foreground flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Account Number
                      </Label>
                      <p className="font-medium">
                        {
                          selectedBeneficiaryDetails.beneficiaryBankAccountNumber
                        }
                      </p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-muted-foreground flex items-center gap-2">
                        <Landmark className="h-4 w-4" />
                        IFSC Code
                      </Label>
                      <p className="font-medium">
                        {selectedBeneficiaryDetails.beneficiaryBankIfscCode}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-muted-foreground flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        Type
                      </Label>
                      <p className="font-medium">
                        {selectedBeneficiaryDetails.beneType}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-muted-foreground flex items-center gap-2">
                        <BadgeCheck className="h-4 w-4" />
                        Status
                      </Label>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${selectedBeneficiaryDetails.status
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                          }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${selectedBeneficiaryDetails.status
                            ? "bg-green-600"
                            : "bg-red-600"
                            }`}
                        />
                        {selectedBeneficiaryDetails.status
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Address Section */}
              <div className="space-y-4 p-4 rounded-lg border bg-card">
                <h3 className="font-semibold text-lg border-b pb-2 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Address Details
                </h3>
                <div className="grid gap-3">
                  {(() => {
                    try {
                      const address = JSON.parse(
                        selectedBeneficiaryDetails.beneficiaryAddress
                      );
                      return (
                        <div className="grid sm:grid-cols-3 gap-4">
                          <div className="space-y-1">
                            <Label className="text-muted-foreground flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              Address Line
                            </Label>
                            <p className="font-medium">{address.line}</p>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-muted-foreground flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              Area
                            </Label>
                            <p className="font-medium">{address.area}</p>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-muted-foreground flex items-center gap-2">
                              <Building className="h-4 w-4" />
                              City
                            </Label>
                            <p className="font-medium">{address.city}</p>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-muted-foreground flex items-center gap-2">
                              <Building2 className="h-4 w-4" />
                              District
                            </Label>
                            <p className="font-medium">{address.district}</p>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-muted-foreground flex items-center gap-2">
                              <Landmark className="h-4 w-4" />
                              State
                            </Label>
                            <p className="font-medium">{address.state}</p>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-muted-foreground flex items-center gap-2">
                              <Hash className="h-4 w-4" />
                              Pincode
                            </Label>
                            <p className="font-medium">{address.pincode}</p>
                          </div>
                        </div>
                      );
                    } catch (e) {
                      return (
                        <p className="text-muted-foreground">
                          Address not available
                        </p>
                      );
                    }
                  })()}
                </div>
              </div>

              {/* Timestamps */}
              <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t">
                <div className="space-y-1">
                  <Label className="text-muted-foreground flex items-center gap-2">
                    <CalendarClock className="h-4 w-4" />
                    Created At
                  </Label>
                  <p className="font-medium">
                    {new Date(
                      selectedBeneficiaryDetails.createdAt
                    ).toLocaleString()}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground flex items-center gap-2">
                    <CalendarClock className="h-4 w-4" />
                    Updated At
                  </Label>
                  <p className="font-medium">
                    {new Date(
                      selectedBeneficiaryDetails.updatedAt
                    ).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDetailsModalOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Main Content */}
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Beneficiary List</CardTitle>
            <CardDescription>
              View and manage all your beneficiaries
            </CardDescription>
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
                      <TableHead className="w-[50px]">
                        <input type="checkbox" className="h-4 w-4" />
                      </TableHead>
                      <TableHead>BENEFICIARY NAME</TableHead>
                      <TableHead>BANK DETAILS</TableHead>
                      <TableHead>CONTACT</TableHead>
                      <TableHead>STATUS</TableHead>
                      <TableHead>CREATED AT</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      Array.from({ length: 5 }).map((_, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Skeleton className="h-4 w-4" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-[140px] mb-2" />
                            <Skeleton className="h-3 w-[100px]" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-[120px] mb-2" />
                            <Skeleton className="h-3 w-[140px]" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-[100px] mb-2" />
                            <Skeleton className="h-3 w-[140px]" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-6 w-16 rounded-full" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-[100px]" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-8 w-8 rounded-full" />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : beneficiaries.length > 0 ? (
                      beneficiaries.map((beneficiary) => (
                        <TableRow key={beneficiary.beneficiaryId}>
                          <TableCell>
                            <input type="checkbox" className="h-4 w-4" />
                          </TableCell>
                          <TableCell className="font-medium">
                            {beneficiary.beneficiaryName}
                            <div className="text-sm text-muted-foreground">
                              ID: {beneficiary.beneficiaryId}
                            </div>
                          </TableCell>
                          <TableCell>
                            {beneficiary.beneficiaryBankName}
                            <div className="text-sm text-muted-foreground">
                              A/C: {beneficiary.beneficiaryBankAccountNumber}
                            </div>
                          </TableCell>
                          <TableCell>
                            {beneficiary.beneficiaryMobileNumber}
                            <div className="text-sm text-muted-foreground">
                              {beneficiary.beneficiaryEmail}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${beneficiary.status
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                                }`}
                            >
                              {beneficiary.status ? "Active" : "Inactive"}
                            </span>
                          </TableCell>
                          <TableCell>
                            {new Date(
                              beneficiary.createdAt
                            ).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleViewDetails(beneficiary)}
                                >
                                  <Info className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleEdit(beneficiary)}
                                >
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleSendMoney(beneficiary)}
                                >
                                  <Send className="mr-2 h-4 w-4" />
                                  Send Money
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    navigate(
                                      `/transactions/${beneficiary.beneficiaryId}`
                                    )
                                  }
                                >
                                  <ExternalLink className="mr-2 h-4 w-4" />
                                  View Transactions
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="h-[400px] text-center"
                        >
                          <div className="flex flex-col items-center justify-center h-full">
                            <div className="relative">
                              <div className="absolute -top-2 -right-2">
                                <div className="rounded-full bg-primary/10 p-2">
                                  <UserPlus className="h-4 w-4 text-primary" />
                                </div>
                              </div>
                              <div className="rounded-full bg-muted p-6">
                                <Users className="h-12 w-12 text-muted-foreground" />
                              </div>
                            </div>
                            <h3 className="mt-4 text-lg font-semibold">
                              No Beneficiaries Found
                            </h3>
                            <p className="mt-2 text-sm text-muted-foreground">
                              {searchQuery
                                ? "No beneficiaries match your search criteria. Try adjusting your filters."
                                : "Get started by adding your first beneficiary to make payments."}
                            </p>
                            <Button
                              onClick={() => setIsModalOpen(true)}
                              className="mt-4"
                            >
                              <UserPlus className="mr-2 h-4 w-4" />
                              Add New Beneficiary
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
            {!isLoading && beneficiaries.length > 0 && (
              <div className="flex items-center justify-center py-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage > 0)
                            handlePageChange(currentPage - 1);
                        }}
                        aria-disabled={currentPage === 0}
                        className={
                          currentPage === 0
                            ? "pointer-events-none opacity-50"
                            : ""
                        }
                      />
                    </PaginationItem>
                    {[...Array(totalPages)].map((_, index) => (
                      <PaginationItem key={index}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(index);
                          }}
                          isActive={currentPage === index}
                        >
                          {index + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage < totalPages - 1)
                            handlePageChange(currentPage + 1);
                        }}
                        aria-disabled={currentPage === totalPages - 1}
                        className={
                          currentPage === totalPages - 1
                            ? "pointer-events-none opacity-50"
                            : ""
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Beneficiary;
