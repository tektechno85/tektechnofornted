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

const Beneficiary = () => {
  const dispatch = useDispatch();
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBeneficiary, setSelectedBeneficiary] =
    useState<BeneficiaryFormData | null>(null);

  const FetchAllBeneficiary = async () => {
    const res = await dispatch(
      fetchBeneficiaryList({ pageNumber: 0, pageSize: 10 }) as any
    );
    setBeneficiaries(res.payload || []);
  };

  useEffect(() => {
    FetchAllBeneficiary();
  }, []);

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
          <Button onClick={() => setIsModalOpen(true)}>
            Add New Beneficiary
          </Button>
        </div>
      </header>

      {/* Add/Edit Beneficiary Modal */}
      <AddBeneficiaryModal
        isModalOpen={isModalOpen}
        setIsModalOpen={handleCloseModal}
        FetchAllBeneficiary={FetchAllBeneficiary}
        beneficiary={selectedBeneficiary}
      />

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
              {filteredBeneficiaries.length > 0 ? (
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
                    {filteredBeneficiaries.map((beneficiary) => (
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
                            className={`px-2 py-1 rounded-full text-xs ${
                              beneficiary.status
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {beneficiary.status ? "Active" : "Inactive"}
                          </span>
                        </TableCell>
                        <TableCell>
                          {new Date(beneficiary.createdAt).toLocaleDateString()}
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
                                onClick={() => handleEdit(beneficiary)}
                              >
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              {/* <DropdownMenuItem className="text-red-600">
                                <X className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem> */}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    No beneficiaries found. Add your first beneficiary to get
                    started.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Beneficiary;
