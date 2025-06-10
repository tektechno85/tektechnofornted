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
        bulkUploadBeneficiaries(selectedFile)
      ).unwrap();

      if (result.successful > 0) {
        toast.success(
          `Successfully uploaded ${result.successful} beneficiaries`
        );
        if (result.failed > 0) {
          toast.warning(`${result.failed} records failed to upload`);
        }
        onUploadSuccess();
        handleClose();
      } else {
        toast.error("No beneficiaries were uploaded successfully");
      }
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

  const displayData = getDisplayData();

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

          {/* Preview Section */}
          {showPreview && previewData.length > 0 && (
            <div className="space-y-4 bg-white rounded-xl border p-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">
                  Data Preview ({totalRows} total rows)
                </Label>
                {totalRows > 5 && (
                  <div className="flex gap-2">
                    <Button
                      variant={!viewLastFive ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewLastFive(false)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      First 5
                    </Button>
                    <Button
                      variant={viewLastFive ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewLastFive(true)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Last 5
                    </Button>
                  </div>
                )}
              </div>

              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="px-4 py-3 text-left font-medium text-gray-600">
                        Beneficiary Name
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">
                        Account No.
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">
                        IFSC Code
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">
                        Amount
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">
                        Mobile No
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">
                        Type
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayData.map((row, index) => (
                      <tr
                        key={index}
                        className="border-b last:border-0 hover:bg-gray-50"
                      >
                        <td className="px-4 py-3">
                          {row["Beneficiary Name"] || "N/A"}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs">
                          {row["Beneficiary A/c No."] || "N/A"}
                        </td>
                        <td className="px-4 py-3 font-mono">
                          {row["IFSC Code"] || "N/A"}
                        </td>
                        <td className="px-4 py-3 text-right">
                          ₹{row["Transaction Amount"] || "0"}
                        </td>
                        <td className="px-4 py-3">
                          {row["Beneficiary Mobile No"] || "N/A"}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              "px-2 py-1 text-xs rounded-full font-medium",
                              row["Transaction Type"] === "IMPS" &&
                                "bg-purple-100 text-purple-800",
                              row["Transaction Type"] === "NEFT" &&
                                "bg-blue-100 text-blue-800",
                              row["Transaction Type"] === "RTGS" &&
                                "bg-green-100 text-green-800",
                              !row["Transaction Type"] &&
                                "bg-gray-100 text-gray-800"
                            )}
                          >
                            {row["Transaction Type"] || "N/A"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalRows > 5 && (
                <p className="text-sm text-gray-500 text-center">
                  Showing {viewLastFive ? "last" : "first"} 5 of {totalRows}{" "}
                  rows
                </p>
              )}
            </div>
          )}
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
                Upload {totalRows > 0 && `(${totalRows} rows)`}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BulkBeneficiaryUpload;
