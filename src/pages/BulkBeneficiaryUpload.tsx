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
  "Pan No": string;
}

interface BeneficiaryFormData {
  id?: string | number;
  beneficiaryAadhaarNumber: string;
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
  beneficiaryAadhaarNumber?: string;
  beneficiaryBankName?: string;
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
  beneficiaryAadhaarNumber: "",
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

const requiredColumns = [
  "Transaction Type",
  "Beneficiary A/c No.",
  "IFSC Code",
  "Beneficiary Name",
  "Pan No",
  "Beneficiary Mobile No",
  "Beneficiary Email ID"
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
  const [isDragging, setIsDragging] = useState(false);
  const [formData, setFormData] = useState<BeneficiaryFormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (
        file.type !== "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" &&
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

  const validateExcelData = (data: ExcelRowData[]): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (data.length === 0) {
      errors.push("Excel file is empty");
      return { isValid: false, errors };
    }

    const firstRow = data[0];
    const missingColumns = requiredColumns.filter((col) => !(col in firstRow));
    
    if (missingColumns.length > 0) {
      errors.push(`Missing required columns: ${missingColumns.join(", ")}`);
    }

    // Additional validation for each row
    data.forEach((row, index) => {
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

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Aadhaar validation
    if (!formData.beneficiaryAadhaarNumber || formData.beneficiaryAadhaarNumber.length !== 12) {
      newErrors.beneficiaryAadhaarNumber = "Aadhaar number must be 12 digits";
    }

    // Bank details validation
    if (!formData.beneficiaryBankName.trim()) {
      newErrors.beneficiaryBankName = "Bank name is required";
    }

    // Address validation
    const addressErrors: FormErrors['address'] = {};
    
    if (!formData.address.line.trim()) {
      addressErrors.line = "Address line is required";
    }
    if (!formData.address.area.trim()) {
      addressErrors.area = "Area is required";
    }
    if (!formData.address.city.trim()) {
      addressErrors.city = "City is required";
    }
    if (!formData.address.district.trim()) {
      addressErrors.district = "District is required";
    }
    if (!formData.address.state.trim()) {
      addressErrors.state = "State is required";
    }
    if (!formData.address.pincode.match(/^[0-9]{6}$/)) {
      addressErrors.pincode = "Pincode must be 6 digits";
    }

    if (Object.keys(addressErrors).length > 0) {
      newErrors.address = addressErrors;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file first");
      return;
    }

    // Validate form fields first
    if (!validateForm()) {
      toast.error("Please fill all required form fields correctly");
      return;
    }

    const validation = validateExcelData(previewData);
    if (!validation.isValid) {
      toast.error(`Validation failed: ${validation.errors[0]}`);
      return;
    }

    try {
      await dispatch(
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
    setFormData(initialFormData);
    setErrors({});
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onClose();
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
        "Pan No": "SFFPD4041B"
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
        "Pan No": "SFFPD4041C"
      },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Beneficiaries");
    XLSX.writeFile(wb, "beneficiary_bulk_upload_template.xlsx");
  };

  const getDisplayData = () => {
    if (!showPreview || previewData.length === 0) return [];
    return viewLastFive ? previewData.slice(-5) : previewData.slice(0, 5);
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
        file.type !== "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" &&
        file.type !== "application/vnd.ms-excel"
      ) {
        toast.error("Please select a valid Excel file (.xlsx or .xls)");
        return;
      }
      setSelectedFile(file);
      previewExcelFile(file);
    }
  };

  const displayData = getDisplayData();

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
                <div className="p-4 rounded-full bg-indigo-100">
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

          {/* Data Preview */}
          {showPreview && displayData.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Data Preview</Label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewLastFive(false)}
                    className={!viewLastFive ? "bg-blue-50" : ""}
                  >
                    First 5
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewLastFive(true)}
                    className={viewLastFive ? "bg-blue-50" : ""}
                  >
                    Last 5
                  </Button>
                </div>
              </div>
              
              <div className="border rounded-lg overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left">Beneficiary Name</th>
                      <th className="px-4 py-2 text-left">Account No.</th>
                      <th className="px-4 py-2 text-left">IFSC Code</th>
                      <th className="px-4 py-2 text-left">Mobile No.</th>
                      <th className="px-4 py-2 text-left">Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayData.map((row, index) => (
                      <tr key={index} className="border-t">
                        <td className="px-4 py-2">{row["Beneficiary Name"]}</td>
                        <td className="px-4 py-2">{row["Beneficiary A/c No."]}</td>
                        <td className="px-4 py-2">{row["IFSC Code"]}</td>
                        <td className="px-4 py-2">{row["Beneficiary Mobile No"]}</td>
                        <td className="px-4 py-2">{row["Beneficiary Email ID"]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Required Fields Alert */}
          <Alert className="bg-amber-50 border-amber-200">
            <AlertCircle className="h-4 w-4 text-indigo-600" />
            <AlertDescription className="text-indigo-800">
              <strong>Required columns:</strong> {requiredColumns.join(", ")}
            </AlertDescription>
          </Alert>

          {/* Beneficiary Form */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Beneficiary Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  placeholder="e.g. 123456789012"
                  className={errors.beneficiaryAadhaarNumber ? "border-red-500" : ""}
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

              <div className="space-y-2 col-span-full">
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
                <h4 className="text-base font-medium mb-4">Address Details</h4>
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
                  placeholder="e.g. Downtown"
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
                  placeholder="e.g. Mumbai"
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
                  placeholder="e.g. Mumbai"
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
                  placeholder="e.g. Maharashtra"
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
                  pattern="[0-9]{6}"
                  placeholder="e.g. 400001"
                  className={errors.address?.pincode ? "border-red-500" : ""}
                />
                {errors.address?.pincode && (
                  <p className="text-sm text-red-500">{errors.address.pincode}</p>
                )}
              </div>
            </div>
          </div>
        </div>

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