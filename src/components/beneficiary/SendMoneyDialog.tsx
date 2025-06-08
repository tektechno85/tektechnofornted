import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { IndianRupee, Send } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { sendMoney } from "@/store/thunks/payoutThunks";
import { useDispatch } from "react-redux";
import dayjs from "dayjs";

const PAYMENT_MODES = [
  {
    value: "IMPS",
    label: "IMPS - Immediate Payment Service",
    description: "24x7 instant transfer",
    limit: "Up to ₹5,00,000",
    // maxAmount: 500000,
    maxAmount: Infinity,
  },
  {
    value: "NEFT",
    label: "NEFT - National Electronic Funds Transfer",
    description: "Batch processing",
    limit: "No limit",
    maxAmount: Infinity,
  },
  {
    value: "RTGS",
    label: "RTGS - Real Time Gross Settlement",
    description: "High value transfers",
    limit: "Min ₹2,00,000",
    // minAmount: 200000,
    minAmount: 1,
  },
] as const;

const sendMoneySchema = z
  .object({
    amount: z.string().refine((val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 0;
    }, "Amount must be greater than 0"),
    comment: z
      .string()
      .min(1, "Comment is required")
      .max(100, "Comment must be less than 100 characters"),
    remarks: z
      .string()
      .max(200, "Remarks must be less than 200 characters")
      .optional()
      .transform((val) => val || ""), // Transform empty string or undefined to empty string
    paymentMode: z.enum(["IMPS", "NEFT", "RTGS"], {
      required_error: "Please select a payment mode",
    }),
  })
  .refine(
    (data) => {
      const amount = parseFloat(data.amount);
      const mode = PAYMENT_MODES.find((m) => m.value === data.paymentMode);

      if (!mode) return false;

      if (mode.value === "IMPS" && amount > mode.maxAmount) {
        return false;
      }

      if (mode.value === "RTGS" && amount < mode.minAmount) {
        return false;
      }

      return true;
    },
    ({ paymentMode }) => {
      const mode = PAYMENT_MODES.find((m) => m.value === paymentMode);
      if (!mode) return { message: "Invalid payment mode" };

      if (mode.value === "IMPS") {
        return {
          message: `IMPS transactions cannot exceed ₹${mode.maxAmount.toLocaleString()}`,
        };
      }

      if (mode.value === "RTGS") {
        return {
          message: `RTGS transactions must be at least ₹${mode.minAmount.toLocaleString()}`,
        };
      }

      return { message: "Invalid amount for selected payment mode" };
    }
  );

type SendMoneyFormData = z.infer<typeof sendMoneySchema>;

interface SendMoneyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  beneficiaryName: string;
  beneficiaryMobileNumber: string;
  beneficiaryId: string;
}

export function SendMoneyDialog({
  open,
  onOpenChange,
  beneficiaryName,
  beneficiaryMobileNumber,
  beneficiaryId,
}: SendMoneyDialogProps) {
  const [isSending, setIsSending] = useState(false);
  const dispatch = useDispatch();

  const form = useForm<SendMoneyFormData>({
    resolver: zodResolver(sendMoneySchema),
    defaultValues: {
      amount: "",
      comment: `Salary for ${dayjs().format("MMMM")}`,
      remarks: "Vendor Payments",
      paymentMode: undefined,
    },
  });

  const onSubmit = async (data: SendMoneyFormData) => {
    setIsSending(true);
    try {
      const response = await dispatch(
        sendMoney({
          beneficiaryId,
          beneficiaryName,
          beneficiaryMobileNumber,
          comment: data.comment,
          remarks: data.remarks,
          amount: parseFloat(data.amount),
          transferType: data.paymentMode,
        }) as any
      );

      if (response.error) {
        throw new Error(response.error);
      }

      toast.success(response.payload.message);
      onOpenChange(false);
      form.reset();
    } catch (error: any) {
      toast.error(error.message || "Failed to send money");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Send Money</DialogTitle>
          <DialogDescription>Send money to {beneficiaryName}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="paymentMode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Mode</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment mode" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <div className="grid gap-2">
                        {PAYMENT_MODES.map((mode) => (
                          <SelectItem key={mode.value} value={mode.value}>
                            <div className="grid gap-1">
                              <div className="font-medium">{mode.label}</div>
                              {/* <div className="grid grid-cols-2 text-xs text-muted-foreground">
                                <div>{mode.description}</div>
                                <div className="text-right">{mode.limit}</div>
                              </div> */}
                            </div>
                          </SelectItem>
                        ))}
                      </div>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <IndianRupee className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="number"
                        placeholder="0.00"
                        className="pl-8"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comment</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter payment comment" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="remarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Remarks (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter additional remarks" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-4 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  onOpenChange(false);
                  form.reset();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSending}>
                {isSending ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Money
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
