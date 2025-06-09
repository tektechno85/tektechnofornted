import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
import { Upload, FileSpreadsheet, Download, AlertCircle, Eye } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from 'xlsx';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { bulkUploadBeneficiaries } from '@/store/thunks/payoutThunks';
import { AppDispatch, RootState } from '@/store/store';

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
  const { loading } = useSelector((state: RootState) => state.payout || { loading: false });
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<ExcelRowData[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [viewLastFive, setViewLastFive] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const requiredColumns = [
    'Transaction Type',
    'Beneficiary A/c No.',
    'IFSC Code',
    'Beneficiary Name',
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' && 
          file.type !== 'application/vnd.ms-excel') {
        toast.error('Please select a valid Excel file (.xlsx or .xls)');
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
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as ExcelRowData[];
        
        setTotalRows(jsonData.length);
        setPreviewData(jsonData);
        setShowPreview(true);
        setViewLastFive(false);
      } catch (error) {
        toast.error('Error reading Excel file');
        console.error('Excel parsing error:', error);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const validateExcelData = (data: ExcelRowData[]): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (data.length === 0) {
      errors.push('Excel file is empty');
      return { isValid: false, errors };
    }

    const firstRow = data[0];
    console.log(firstRow, "firstRow")
    const missingColumns = requiredColumns.filter(col => !(col in firstRow));
    console.log(missingColumns, "missingColumns")
    if (missingColumns.length > 0) {
      errors.push(`Missing required columns: ${missingColumns.join(', ')}`);
    }

    // Additional validation
    data.forEach((row, index) => {
        console.log("data loop")
      if (!row["Beneficiary Name"] || row["Beneficiary Name"].trim() === '') {
        errors.push(`Row ${index + 1}: Beneficiary Name is required`);
      }
      
      if (!row["Beneficiary A/c No."]) {
        errors.push(`Row ${index + 1}: Beneficiary Account Number is required`);
      }
      
      if (!row["IFSC Code"] || row["IFSC Code"].trim() === '') {
        errors.push(`Row ${index + 1}: IFSC Code is required`);
      }
    });

    return { isValid: errors.length === 0, errors };
  };

  const handleUpload = async () => {
    console.log("handle upload")
    if (!selectedFile) {
      toast.error('Please select a file first');
      return;
    }

    console.log("validation start")

    const validation = validateExcelData(previewData);
    console.log(validation, "validation")
    if (!validation.isValid) {
      toast.error(`Validation failed: ${validation.errors[0]}`);
      return;
    }

    console.log("all validation checked succesfull")

    try {

        console.log("checking")

      const result = await dispatch(bulkUploadBeneficiaries(selectedFile)).unwrap();
      
      if (result.successful > 0) {
        toast.success(`Successfully uploaded ${result.successful} beneficiaries`);
        if (result.failed > 0) {
          toast.warning(`${result.failed} records failed to upload`);
        }
        onUploadSuccess();
        handleClose();
      } else {
        toast.error('No beneficiaries were uploaded successfully');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(typeof error === 'string' ? error : 'Failed to upload file');
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreviewData([]);
    setShowPreview(false);
    setViewLastFive(false);
    setTotalRows(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
        "Customer Ref No": "28759"
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
        "Customer Ref No": "28760"
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Beneficiaries');
    XLSX.writeFile(wb, 'beneficiary_bulk_upload_template.xlsx');
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
          {/* Download Template Section */}
          <div className="p-4 border rounded-lg bg-blue-50">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-blue-900">Download Template</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Download the Excel template with required format and sample data
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={downloadTemplate}
                className="border-blue-200 text-blue-700 hover:bg-blue-100"
              >
                <Download className="h-4 w-4 mr-2" />
                Template
              </Button>
            </div>
          </div>

          {/* File Upload Section */}
          <div className="space-y-2">
            <Label htmlFor="excel-file">Select Excel File</Label>
            <div className="flex items-center gap-2">
              <Input
                id="excel-file"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                ref={fileInputRef}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              />
              {selectedFile && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <FileSpreadsheet className="h-4 w-4" />
                  <span>{selectedFile.name}</span>
                  <span className="text-gray-500">({totalRows} rows)</span>
                </div>
              )}
            </div>
          </div>

          {/* Required Fields Info */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Required columns:</strong> {requiredColumns.join(', ')}
            </AlertDescription>
          </Alert>

          {/* Preview Section */}
          {showPreview && previewData.length > 0 && (
            <div className="space-y-3">
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
              
              <div className="border rounded-lg overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">Beneficiary Name</th>
                      <th className="px-3 py-2 text-left font-medium">Account No.</th>
                      <th className="px-3 py-2 text-left font-medium">IFSC Code</th>
                      <th className="px-3 py-2 text-left font-medium">Amount</th>
                      <th className="px-3 py-2 text-left font-medium">Mobile No</th>
                      <th className="px-3 py-2 text-left font-medium">Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayData.map((row, index) => (
                      <tr key={index} className="border-t">
                        <td className="px-3 py-2">
                          {row["Beneficiary Name"] || 'N/A'}
                        </td>
                        <td className="px-3 py-2 font-mono text-xs">
                          {row["Beneficiary A/c No."] || 'N/A'}
                        </td>
                        <td className="px-3 py-2 font-mono">
                          {row["IFSC Code"] || 'N/A'}
                        </td>
                        <td className="px-3 py-2 text-right">
                          ₹{row["Transaction Amount"] || '0'}
                        </td>
                        <td className="px-3 py-2">
                          {row["Beneficiary Mobile No"] || 'N/A'}
                        </td>
                        <td className="px-3 py-2">
                          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                            {row["Transaction Type"] || 'N/A'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {totalRows > 5 && (
                <p className="text-sm text-gray-500 text-center">
                  Showing {viewLastFive ? 'last' : 'first'} 5 of {totalRows} rows
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