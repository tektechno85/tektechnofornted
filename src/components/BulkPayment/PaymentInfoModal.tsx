import { PaymentInfoDetailsType } from "@/pages/BulkPayment";
import React from "react";
import {
  DialogDescription,
  DialogContent,
  DialogTitle,
  DialogHeader,
  Dialog,
} from "../ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { UserPlus, Users } from "lucide-react";

const PaymentInfoModal = ({
  isOpen,
  onClose,
  paymentInfoDetails = [],
}: {
  isOpen: boolean;
  onClose: () => void;
  paymentInfoDetails?: PaymentInfoDetailsType[];
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={"sm:max-w-[70%] max-h-[80%]  overflow-y-auto"}>
        <DialogHeader className="pb-0">
          <DialogTitle>Payment Info</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>TRANSACTION ID</TableHead>
                <TableHead>BENEFICIARY NAME</TableHead>
                <TableHead>CYRUS ID</TableHead>
                <TableHead>TRANSACTION TYPE</TableHead>
                <TableHead>STATUS</TableHead>
                <TableHead>AMOUNT</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paymentInfoDetails.length > 0 ? (
                paymentInfoDetails.map((paymentInfo) => (
                  <TableRow key={paymentInfo.beneficiaryId}>
                    <TableCell className="font-medium">
                      {paymentInfo.transactionId}
                      <div className="text-sm text-muted-foreground">
                        ID: {paymentInfo.beneficiaryId}
                      </div>
                    </TableCell>
                    <TableCell>
                      {paymentInfo.beneficiaryName}
                      <div className="text-sm text-muted-foreground">
                        {paymentInfo.beneficiaryMobileNumber}
                      </div>
                    </TableCell>
                    <TableCell>{paymentInfo.beneficiaryCyrusId}</TableCell>
                    <TableCell>{paymentInfo.transactionType}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          paymentInfo.status
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {paymentInfo.status ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    <TableCell>
                      {new Date(paymentInfo.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-[400px] text-center">
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
                        No Payment Info Found
                      </h3>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentInfoModal;
