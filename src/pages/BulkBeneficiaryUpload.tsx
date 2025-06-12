import React, { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Upload,
  FileSpreadsheet,
  Download,
  AlertCircle,
  Eye,
  FileUp,
} from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { bulkUploadBeneficiaries } from "@/store/thunks/payoutThunks";
import { AppDispatch, RootState } from "@/store/store";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BulkBeneficiaryUploadProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
}

interface ExcelRowData {
  "Transaction Amount": string;
  "Beneficiary Code": string;
  "Transaction Type": string;
  "Remitter LEI Information": string;
  "Beneficiary LEI Information": string;
  "Beneficiary A/c No.": string;
  "IFSC Code": string;
  "Beneficiary Email ID": string;
  "Payment Details 1": string;
  "Value Date": string;
  "Beneficiary Name": string;
  "Beneficiary Mobile No": string;
  "Debit Account": string;
  "Source Narration": string;
  "Target Narration": string;
  "Customer Ref No": string;
}

interface BeneficiaryFormData {
  id?: string | number;
  beneficiaryMobileNumber: string;
  beneficiaryEmail: string;
  beneficiaryPanNumber: string;
  beneficiaryAadhaarNumber: string;
  beneficiaryAddress: string;
  beneficiaryBankName: string;
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

interface FormErrors {
  beneficiaryName?: string;
  beneficiaryMobileNumber?: string;
  beneficiaryEmail?: string;
  beneficiaryPanNumber?: string;
  beneficiaryAadhaarNumber?: string;
  beneficiaryBankName?: string;
  beneficiaryAccountNumber?: string;
  beneficiaryIfscCode?: string;
  address?: {
    line?: string;
    area?: string;
    city?: string;
    district?: string;
    state?: string;
    pincode?: string;
  };
}

const initialFormData: BeneficiaryFormData = {
  beneficiaryMobileNumber: "",
  beneficiaryEmail: "",
  beneficiaryPanNumber: "",
  beneficiaryAadhaarNumber: "",
  beneficiaryAddress: "",
  beneficiaryBankName: "",
  beneType: "CUSTOMER",
  latitude: 0,
  longitude: 0,
  address: {
    line: "",
    area: "",
    city: "",
    district: "",
    state: "",
    pincode: "",
  },
};

const beneficiaryTypes = [
  { ID: 1, PAY_TYPE: "CUSTOMER" },
  { ID: 2, PAY_TYPE: "VENDOR" },
  { ID: 3, PAY_TYPE: "EMPLOYEE" },
];

const BulkBeneficiaryUpload: React.FC<BulkBeneficiaryUploadProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector(
    (state: RootState) => state.payout || { loading: false }
  );

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<ExcelRowData[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [viewLastFive, setViewLastFive] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [formData, setFormData] =
    useState<BeneficiaryFormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name.startsWith("address.")) {
      const addressField = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        address: { ...prev.address, [addressField]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const requiredColumns = [
    "Transaction Type",
    "Beneficiary A/c No.",
    "IFSC Code",
    "Beneficiary Name",
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (
        file.type !==
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" &&
        file.type !== "application/vnd.ms-excel"
      ) {
        toast.error("Please select a valid Excel file (.xlsx or .xls)");
        return;
      }
      setSelectedFile(file);
      previewExcelFile(file);
    }
  };

  const previewExcelFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as ExcelRowData[];

        setTotalRows(jsonData.length);
        setPreviewData(jsonData);
        setShowPreview(true);
        setViewLastFive(false);
      } catch (error) {
        toast.error("Error reading Excel file");
        console.error("Excel parsing error:", error);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const validateExcelData = (
    data: ExcelRowData[]
  ): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (data.length === 0) {
      errors.push("Excel file is empty");
      return { isValid: false, errors };
    }

    const firstRow = data[0];
    console.log(firstRow, "firstRow");
    const missingColumns = requiredColumns.filter((col) => !(col in firstRow));
    console.log(missingColumns, "missingColumns");
    if (missingColumns.length > 0) {
      errors.push(`Missing required columns: ${missingColumns.join(", ")}`);
    }

    // Additional validation
    data.forEach((row, index) => {
      console.log("data loop");
      if (!row["Beneficiary Name"] || row["Beneficiary Name"].trim() === "") {
        errors.push(`Row ${index + 1}: Beneficiary Name is required`);
      }

      if (!row["Beneficiary A/c No."]) {
        errors.push(`Row ${index + 1}: Beneficiary Account Number is required`);
      }

      if (!row["IFSC Code"] || row["IFSC Code"].trim() === "") {
        errors.push(`Row ${index + 1}: IFSC Code is required`);
      }
    });

    return { isValid: errors.length === 0, errors };
  };

  const handleUpload = async () => {
    console.log("handle upload");
    if (!selectedFile) {
      toast.error("Please select a file first");
      return;
    }

    // Validate form fields first
    if (!validateForm()) {
      toast.error("Please fill all required form fields correctly");
      return;
    }

    console.log("validation start");

    const validation = validateExcelData(previewData);
    console.log(validation, "validation");
    if (!validation.isValid) {
      toast.error(`Validation failed: ${validation.errors[0]}`);
      return;
    }

    console.log("all validation checked succesfull");

    try {
      console.log("checking");

      const result = await dispatch(
        bulkUploadBeneficiaries({
          file: selectedFile,
          beneficiaryData: formData,
          onSuccess: () => {
            toast.success("Beneficiaries uploaded successfully");
            onUploadSuccess();
            handleClose();
          },
          onError: (error) => {
            toast.error(error);
          },
        })
      ).unwrap();

      console.log({ result }, "result");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(typeof error === "string" ? error : "Failed to upload file");
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreviewData([]);
    setShowPreview(false);
    setViewLastFive(false);
    setTotalRows(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onClose();
  };
  const validateForm = () => {
    const newErrors: FormErrors = {};

    // Mobile validation
    // const mobileRegex = /^[0-9]{10}$/;
    // if (!mobileRegex.test(formData.beneficiaryMobileNumber)) {
    //   newErrors.beneficiaryMobileNumber = "Mobile number should be 10 digits";
    // }

    // Email validation if provided
    // if (formData.beneficiaryEmail) {
    //   const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    //   if (!emailRegex.test(formData.beneficiaryEmail)) {
    //     newErrors.beneficiaryEmail = "Invalid email format";
    //   }
    // }

    // PAN validation
    // const panRegex = /[A-Z]{5}[0-9]{4}[A-Z]{1}/;
    // if (!panRegex.test(formData.beneficiaryPanNumber)) {
    //   newErrors.beneficiaryPanNumber =
    //     "Invalid PAN format. Should be like ABCDE1234F";
    // }

    // Aadhaar validation
    if (formData.beneficiaryAadhaarNumber.length !== 12) {
      newErrors.beneficiaryAadhaarNumber = "Aadhaar number must be 12 digits";
    }

    // Bank details validation
    if (!formData.beneficiaryBankName.trim()) {
      newErrors.beneficiaryBankName = "Bank name is required";
    }
    
    // Address validation with specific error messages
    if (!formData.address.line.trim()) {
      newErrors.address = {
        ...newErrors.address,
        line: "Address line is required",
      };
    }
    if (!formData.address.area.trim()) {
      newErrors.address = { ...newErrors.address, area: "Area is required" };
    }
    if (!formData.address.city.trim()) {
      newErrors.address = { ...newErrors.address, city: "City is required" };
    }
    if (!formData.address.district.trim()) {
      newErrors.address = {
        ...newErrors.address,
        district: "District is required",
      };
    }
    if (!formData.address.state.trim()) {
      newErrors.address = { ...newErrors.address, state: "State is required" };
    }
    if (!formData.address.pincode.match(/^[0-9]{6}$/)) {
      newErrors.address = {
        ...newErrors.address,
        pincode: "Invalid pincode format",
      };
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const downloadTemplate = () => {
    const templateData: ExcelRowData[] = [
      {
        "Transaction Amount": "18900",
        "Beneficiary Code": "222026",
        "Transaction Type": "IMPS",
        "Remitter LEI Information": "",
        "Beneficiary LEI Information": "",
        "Beneficiary A/c No.": "110052871682",
        "IFSC Code": "CNRB0013015",
        "Beneficiary Email ID": "sai@example.com",
        "Payment Details 1": "",
        "Value Date": "",
        "Beneficiary Name": "sai kumar",
        "Beneficiary Mobile No": "9876543210",
        "Debit Account": "2.59178886877E11",
        "Source Narration": "",
        "Target Narration": "",
        "Customer Ref No": "28759",
      },
      {
        "Transaction Amount": "25000",
        "Beneficiary Code": "222027",
        "Transaction Type": "NEFT",
        "Remitter LEI Information": "",
        "Beneficiary LEI Information": "",
        "Beneficiary A/c No.": "110052871683",
        "IFSC Code": "SBIN0001234",
        "Beneficiary Email ID": "john@example.com",
        "Payment Details 1": "",
        "Value Date": "",
        "Beneficiary Name": "John Doe",
        "Beneficiary Mobile No": "9876543211",
        "Debit Account": "2.59178886878E11",
        "Source Narration": "",
        "Target Narration": "",
        "Customer Ref No": "28760",
      },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Beneficiaries");
    XLSX.writeFile(wb, "beneficiary_bulk_upload_template.xlsx");
  };

  const getDisplayData = () => {
    if (!showPreview || previewData.length === 0) return [];

    if (viewLastFive) {
      return previewData.slice(-5);
    } else {
      return previewData.slice(0, 5);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      if (
        file.type !==
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" &&
        file.type !== "application/vnd.ms-excel"
      ) {
        toast.error("Please select a valid Excel file (.xlsx or .xls)");
        return;
      }
      setSelectedFile(file);
      previewExcelFile(file);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
            Bulk Upload Beneficiaries
          </DialogTitle>
          <DialogDescription>
            Upload multiple beneficiaries at once using an Excel file
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Template Download Card */}
          <div className="p-6 border rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <h4 className="font-semibold text-blue-900">Excel Template</h4>
                <p className="text-sm text-blue-700 max-w-md">
                  Download our standardized Excel template with the required
                  format and sample data to ensure successful bulk upload.
                </p>
              </div>
              <Button
                variant="outline"
                size="lg"
                onClick={downloadTemplate}
                className="border-blue-200 text-blue-700 hover:bg-blue-100 shadow-sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Template
              </Button>
            </div>
          </div>

          {/* File Upload Zone */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Upload Excel File</Label>
            <div
              className={cn(
                "border-2 border-dashed rounded-xl p-8 transition-colors",
                "hover:border-indigo-500/50 hover:bg-indigo-100/50",
                isDragging && "border-indigo-500 bg-indigo-100",
                selectedFile && "border-indigo-500/50 bg-indigo-100/50"
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center justify-center gap-4">
                <div
                  className={cn(
                    "p-4 rounded-full",
                    selectedFile ? "bg-indigo-100" : "bg-indigo-100"
                  )}
                >
                  {selectedFile ? (
                    <FileSpreadsheet className="h-8 w-8 text-indigo-600" />
                  ) : (
                    <FileUp className="h-8 w-8 text-primary" />
                  )}
                </div>

                <div className="text-center">
                  {selectedFile ? (
                    <>
                      <p className="font-medium text-green-600">
                        {selectedFile.name}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {totalRows} rows detected
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="font-medium">
                        Drag & drop your Excel file here
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        or click to browse
                      </p>
                    </>
                  )}
                </div>

                <Input
                  id="excel-file"
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileSelect}
                  ref={fileInputRef}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Browse Files
                </Button>
              </div>
            </div>
          </div>

          {/* Required Fields Alert */}
          <Alert className="bg-amber-50 border-amber-200">
            <AlertCircle className="h-4 w-4 text-indigo-600" />
            <AlertDescription className="text-indigo-800">
              <strong>Required columns:</strong> {requiredColumns.join(", ")}
            </AlertDescription>
          </Alert>
        </div>
        <form className="space-y-6 py-4">
          {/* Beneficiary Form */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Personal Information */}
            {/* <div className="space-y-2">
              <Label htmlFor="beneficiaryMobileNumber">Mobile Number *</Label>
              <Input
                id="beneficiaryMobileNumber"
                name="beneficiaryMobileNumber"
                value={formData.beneficiaryMobileNumber}
                onChange={handleInputChange}
                required
                maxLength={10}
                minLength={10}
                pattern="[0-9]{10}"
                placeholder="e.g. 9876543210"
                className={
                  errors.beneficiaryMobileNumber ? "border-red-500" : ""
                }
              />
              {errors.beneficiaryMobileNumber && (
                <p className="text-sm text-red-500">
                  {errors.beneficiaryMobileNumber}
                </p>
              )}
            </div> */}
            {/* <div className="space-y-2">
              <Label htmlFor="beneficiaryEmail">Email</Label>
              <Input
                id="beneficiaryEmail"
                name="beneficiaryEmail"
                type="email"
                placeholder="e.g. beneficiary@gmail.com"
                value={formData.beneficiaryEmail}
                onChange={handleInputChange}
                pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
                className={errors.beneficiaryEmail ? "border-red-500" : ""}
              />
              {errors.beneficiaryEmail && (
                <p className="text-sm text-red-500">
                  {errors.beneficiaryEmail}
                </p>
              )}
            </div> */}
            {/* <div className="space-y-2">
              <Label htmlFor="beneficiaryPanNumber">PAN Number *</Label>
              <Input
                id="beneficiaryPanNumber"
                name="beneficiaryPanNumber"
                value={formData.beneficiaryPanNumber}
                onChange={handleInputChange}
                placeholder="e.g. HDGFJ1234H"
                className={`capitalize ${
                  errors.beneficiaryPanNumber ? "border-red-500" : ""
                }`}
                required
              />
              {errors.beneficiaryPanNumber && (
                <p className="text-sm text-red-500">
                  {errors.beneficiaryPanNumber}
                </p>
              )}
            </div> */}
            <div className="space-y-2">
              <Label htmlFor="beneficiaryAadhaarNumber">Aadhaar Number *</Label>
              <Input
                id="beneficiaryAadhaarNumber"
                name="beneficiaryAadhaarNumber"
                value={formData.beneficiaryAadhaarNumber}
                onChange={handleInputChange}
                required
                type="number"
                maxLength={12}
                minLength={12}
                pattern="[0-9]{12}"
                placeholder="e.g. 123456789012"
                className={
                  errors.beneficiaryAadhaarNumber ? "border-red-500" : ""
                }
              />
              {errors.beneficiaryAadhaarNumber && (
                <p className="text-sm text-red-500">
                  {errors.beneficiaryAadhaarNumber}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="beneType">Beneficiary Type *</Label>
              <Select
                value={formData.beneType}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, beneType: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {beneficiaryTypes.map((type) => (
                    <SelectItem key={type.ID} value={type.PAY_TYPE}>
                      {type.PAY_TYPE}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Bank Details */}
            <div className="space-y-2">
              <Label htmlFor="beneficiaryBankName">Bank Name *</Label>
              <Input
                id="beneficiaryBankName"
                name="beneficiaryBankName"
                value={formData.beneficiaryBankName}
                onChange={handleInputChange}
                required
                className={errors.beneficiaryBankName ? "border-red-500" : ""}
              />
              {errors.beneficiaryBankName && (
                <p className="text-sm text-red-500">
                  {errors.beneficiaryBankName}
                </p>
              )}
            </div>
            {/* Address Details */}
            <div className="col-span-full">
              <h3 className="text-lg font-medium mb-4">Address Details</h3>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address.line">Address Line *</Label>
              <Input
                id="address.line"
                name="address.line"
                value={formData.address.line}
                onChange={handleInputChange}
                required
                placeholder="e.g. 123, Main Street"
                className={errors.address?.line ? "border-red-500" : ""}
              />
              {errors.address?.line && (
                <p className="text-sm text-red-500">{errors.address.line}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="address.area">Area *</Label>
              <Input
                id="address.area"
                name="address.area"
                value={formData.address.area}
                onChange={handleInputChange}
                required
                placeholder="e.g. New York"
                className={errors.address?.area ? "border-red-500" : ""}
              />
              {errors.address?.area && (
                <p className="text-sm text-red-500">{errors.address.area}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="address.city">City *</Label>
              <Input
                id="address.city"
                name="address.city"
                value={formData.address.city}
                onChange={handleInputChange}
                required
                placeholder="e.g. New York"
                className={errors.address?.city ? "border-red-500" : ""}
              />
              {errors.address?.city && (
                <p className="text-sm text-red-500">{errors.address.city}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="address.district">District *</Label>
              <Input
                id="address.district"
                name="address.district"
                value={formData.address.district}
                onChange={handleInputChange}
                required
                placeholder="e.g. New York"
                className={errors.address?.district ? "border-red-500" : ""}
              />
              {errors.address?.district && (
                <p className="text-sm text-red-500">
                  {errors.address.district}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="address.state">State *</Label>
              <Input
                id="address.state"
                name="address.state"
                value={formData.address.state}
                onChange={handleInputChange}
                required
                placeholder="e.g. New York"
                className={errors.address?.state ? "border-red-500" : ""}
              />
              {errors.address?.state && (
                <p className="text-sm text-red-500">{errors.address.state}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="address.pincode">Pincode *</Label>
              <Input
                id="address.pincode"
                name="address.pincode"
                value={formData.address.pincode}
                onChange={handleInputChange}
                required
                maxLength={6}
                minLength={6}
                pattern="[0-9]{6}"
                placeholder="e.g. 123456"
                className={errors.address?.pincode ? "border-red-500" : ""}
              />
              {errors.address?.pincode && (
                <p className="text-sm text-red-500">{errors.address.pincode}</p>
              )}
            </div>
          </div>
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || loading}
            className="min-w-[120px]"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BulkBeneficiaryUpload;
