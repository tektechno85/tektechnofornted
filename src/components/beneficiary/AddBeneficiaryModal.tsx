import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import {
  addBeneficiary,
  fetchBeneficiaryTypes,
  updateBeneficiary,
} from "@/store/thunks/payoutThunks";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface BeneficiaryFormData {
  id?: string | number;
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

const initialFormData: BeneficiaryFormData = {
  beneficiaryName: "",
  beneficiaryMobileNumber: "",
  beneficiaryEmail: "",
  beneficiaryPanNumber: "",
  beneficiaryAadhaarNumber: "",
  beneficiaryAddress: "",
  beneficiaryBankName: "",
  beneficiaryAccountNumber: "",
  beneficiaryIfscCode: "",
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

const AddBeneficiaryModal = ({
  isModalOpen,
  setIsModalOpen,
  FetchAllBeneficiary,
  beneficiary = null,
}: {
  isModalOpen: boolean;
  setIsModalOpen: (isOpen: boolean) => void;
  FetchAllBeneficiary: () => void;
  beneficiary?: BeneficiaryFormData | null;
}) => {
  const dispatch = useDispatch();
  const [beneficiaryTypes, setBeneficiaryTypes] = useState<
    {
      ID: number;
      PAY_TYPE: string;
    }[]
  >([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<BeneficiaryFormData>>({});
  const [formData, setFormData] =
    useState<BeneficiaryFormData>(initialFormData);

  useEffect(() => {
    if (beneficiary) {
      setFormData({
        ...beneficiary,
        address: {
          line: beneficiary.address?.line || "",
          area: beneficiary.address?.area || "",
          city: beneficiary.address?.city || "",
          district: beneficiary.address?.district || "",
          state: beneficiary.address?.state || "",
          pincode: beneficiary.address?.pincode || "",
        },
      });
    } else {
      setFormData(initialFormData);
    }
  }, [beneficiary]);

  const validateForm = () => {
    const newErrors: Partial<BeneficiaryFormData> = {};

    if (beneficiary) {
      // Only validate IFSC code when updating
      const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
      if (!ifscRegex.test(formData.beneficiaryIfscCode)) {
        newErrors.beneficiaryIfscCode = "Invalid IFSC code format";
      }
    } else {
      // PAN validation
      const panRegex = /[A-Z]{5}[0-9]{4}[A-Z]{1}/;
      if (!panRegex.test(formData.beneficiaryPanNumber)) {
        newErrors.beneficiaryPanNumber =
          "Invalid PAN format. Should be like ABCDE1234F";
      }

      // Mobile validation
      const mobileRegex = /^[0-9]{10}$/;
      if (!mobileRegex.test(formData.beneficiaryMobileNumber)) {
        newErrors.beneficiaryMobileNumber = "Mobile number should be 10 digits";
      }

      // Email validation if provided
      if (formData.beneficiaryEmail) {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(formData.beneficiaryEmail)) {
          newErrors.beneficiaryEmail = "Invalid email format";
        }
      }

      // Aadhaar validation
      if (formData.beneficiaryAadhaarNumber.length !== 12) {
        newErrors.beneficiaryAadhaarNumber = "Aadhaar number must be 12 digits";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the validation errors before submitting");
      return;
    }

    setIsSubmitting(true);
    try {
      if (beneficiary?.id) {
        // Update only IFSC code
        const res = await dispatch(
          updateBeneficiary({
            beneficiaryId: beneficiary.id.toString(),
            beneficiaryIfscCode: formData.beneficiaryIfscCode,
          }) as any
        );

        if (res.error) {
          throw new Error(res.error.message || "Failed to update IFSC code");
        }

        toast.success("IFSC code updated successfully");
      } else {
        // Add new beneficiary
        const res = await dispatch(addBeneficiary(formData) as any);

        if (res.error) {
          throw new Error(
            res.error.message ||
              `Failed to ${beneficiary ? "update" : "add"} beneficiary`
          );
        }

        toast.success(
          `Beneficiary ${beneficiary ? "updated" : "added"} successfully`
        );
      }
      setIsModalOpen(false);
      setFormData(initialFormData);
      FetchAllBeneficiary();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : `Failed to ${beneficiary ? "update" : "add"} beneficiary`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      if (parent === "address") {
        const updatedFormData = {
          ...formData,
          address: {
            ...formData.address,
            [child]: value,
          },
        };

        // Update beneficiaryAddress whenever address fields change
        const fullAddress = [
          updatedFormData.address.line,
          updatedFormData.address.area,
          updatedFormData.address.city,
          updatedFormData.address.district,
          updatedFormData.address.state,
          updatedFormData.address.pincode,
        ]
          .filter(Boolean)
          .join(", ");

        setFormData({
          ...updatedFormData,
          beneficiaryAddress: fullAddress,
        });
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };
  const FetchBeneficiaryTypes = async () => {
    const res = await dispatch(fetchBeneficiaryTypes() as any);
    console.log({ res });
    setBeneficiaryTypes(res.payload.data);
  };
  useEffect(() => {
    FetchBeneficiaryTypes();
  }, [dispatch]);

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogContent
        className={
          beneficiary
            ? "sm:max-w-[400px]"
            : "sm:max-w-[600px] max-h-[90vh] overflow-y-auto"
        }
      >
        <DialogHeader>
          <DialogTitle>
            {beneficiary ? "Update IFSC Code" : "Add New Beneficiary"}
          </DialogTitle>
          <DialogDescription>
            {beneficiary
              ? "Update the IFSC code for this beneficiary"
              : "Fill in the details to add a beneficiary"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {beneficiary ? (
            // Update IFSC view
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Beneficiary Name</Label>
                <p className="text-sm text-muted-foreground">
                  {formData.beneficiaryName}
                </p>
              </div>
              {/* <div className="space-y-2">
                <Label>Current IFSC Code</Label>
                <p className="text-sm text-muted-foreground">
                  {beneficiary.beneficiaryIfscCode}
                </p>
              </div> */}
              <div className="space-y-2">
                <Label htmlFor="beneficiaryIfscCode">New IFSC Code *</Label>
                <Input
                  id="beneficiaryIfscCode"
                  name="beneficiaryIfscCode"
                  value={formData.beneficiaryIfscCode}
                  onChange={handleInputChange}
                  placeholder="Enter new IFSC code"
                  required
                  className="uppercase"
                />
                {errors.beneficiaryIfscCode && (
                  <p className="text-sm text-red-500">
                    {errors.beneficiaryIfscCode}
                  </p>
                )}
              </div>
            </div>
          ) : (
            // Existing add beneficiary view
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Personal Information */}
              <div className="space-y-2">
                <Label htmlFor="beneficiaryName">Beneficiary Name *</Label>
                <Input
                  id="beneficiaryName"
                  name="beneficiaryName"
                  value={formData.beneficiaryName}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. John Doe"
                  className={errors.beneficiaryName ? "border-red-500" : ""}
                />
                {errors.beneficiaryName && (
                  <p className="text-sm text-red-500">
                    {errors.beneficiaryName}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="beneficiaryMobileNumber">Mobile Number *</Label>
                <Input
                  id="beneficiaryMobileNumber"
                  name="beneficiaryMobileNumber"
                  value={formData.beneficiaryMobileNumber}
                  onChange={handleInputChange}
                  required
                  pattern="[0-9]{10}"
                  placeholder="e.g. 9876543210"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="beneficiaryEmail">Email</Label>
                <Input
                  id="beneficiaryEmail"
                  name="beneficiaryEmail"
                  type="email"
                  placeholder="e.g. beneficiary@gmail.com"
                  value={formData.beneficiaryEmail}
                  onChange={handleInputChange}
                  pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
                />
              </div>
              <div className="space-y-2">
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
                  // pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}"
                />
                {errors.beneficiaryPanNumber && (
                  <p className="text-sm text-red-500">
                    {errors.beneficiaryPanNumber}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="beneficiaryAadhaarNumber">
                  Aadhaar Number *
                </Label>
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
                  className="capitalize"
                />
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
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="beneficiaryAccountNumber">
                  Account Number *
                </Label>
                <Input
                  id="beneficiaryAccountNumber"
                  name="beneficiaryAccountNumber"
                  value={formData.beneficiaryAccountNumber}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. 1234567890"
                  type="number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="beneficiaryIfscCode">IFSC Code *</Label>
                <Input
                  id="beneficiaryIfscCode"
                  name="beneficiaryIfscCode"
                  value={formData.beneficiaryIfscCode}
                  onChange={handleInputChange}
                  placeholder="e.g. HDFC0000001"
                  required
                  pattern="^[A-Z]{4}0[A-Z0-9]{6}$"
                />
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
                />
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
                />
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
                />
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
                />
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
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address.pincode">Pincode *</Label>
                <Input
                  id="address.pincode"
                  name="address.pincode"
                  value={formData.address.pincode}
                  onChange={handleInputChange}
                  required
                  pattern="[0-9]{6}"
                  placeholder="e.g. 123456"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? beneficiary
                  ? "Updating..."
                  : "Adding..."
                : beneficiary
                ? "Update IFSC"
                : "Add Beneficiary"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddBeneficiaryModal;
