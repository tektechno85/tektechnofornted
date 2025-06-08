import { useEffect, useState } from "react";
import { Search, Download, ChevronDown, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardLayout from "@/components/DashboardLayout";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllPayoutTransactions } from "@/store/thunks/payoutThunks";
import dayjs from "dayjs";

interface PayoutData {
  status: string;
  beneficiaryId: string;
  orderId: string;
  cyrusOrderId: string;
  cyrusId: string;
  rrnNumber: string;
  openingBalance: string;
  lockedAmount: string;
  chargedAmount: string;
  createdAt: string;
  updatedAt: string;
}

interface RootState {
  payout: {
    allPayoutTransactions: {
      content: PayoutData[] | null;
      loading: boolean;
    };
  };
}

const Payout = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [payoutType, setPayoutType] = useState("all");
  const [payouts, setPayouts] = useState<PayoutData[]>([]);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  // const { content: payouts, loading } = useSelector(
  //   (state: RootState) => state.payout.allPayoutTransactions
  // );

  const filteredPayouts =
    payouts?.filter((payout) => {
      const matchesSearch = payout.orderId
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesFilterType =
        filterType === "all" || filterType === payout.status.toLowerCase();
      const matchesPayoutType =
        payoutType === "all" || payoutType === payout.status.toLowerCase();
      return matchesSearch && matchesFilterType && matchesPayoutType;
    }) || [];

  const FetchAllPayouts = async () => {
    setLoading(true);
    const response = await dispatch(
      fetchAllPayoutTransactions({ pageNumber: 0, pageSize: 10 }) as any
    );
    console.log({ response });
    if (response.payload) {
      setPayouts(response.payload);
    }
    setLoading(false);
  };

  useEffect(() => {
    FetchAllPayouts();
  }, []);

  return (
    <DashboardLayout>
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
        <div className="flex h-16 items-center justify-between py-4 px-6">
          <h1 className="text-xl font-semibold">Payouts</h1>
          <Button
            variant="outline"
            onClick={FetchAllPayouts}
            disabled={loading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            {loading ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Payout History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by Payout ID"
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="payout">Payout</SelectItem>
                      <SelectItem value="settlement">Settlement</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={payoutType} onValueChange={setPayoutType}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Payout Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="payout">Payout</SelectItem>
                      <SelectItem value="settlement">Settlement</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="icon">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">
                        <input type="checkbox" className="h-4 w-4" />
                      </TableHead>
                      <TableHead>ORDER ID</TableHead>
                      <TableHead>OPENING BALANCE</TableHead>
                      <TableHead>LOCKED AMOUNT</TableHead>
                      <TableHead>CHARGED AMOUNT</TableHead>
                      <TableHead>STATUS</TableHead>
                      <TableHead>DATE</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      Array.from({ length: 5 }).map((_, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Skeleton className="h-4 w-4" />
                          </TableCell>
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
                          <TableCell>
                            <Skeleton className="h-8 w-8 rounded-full" />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : filteredPayouts.length > 0 ? (
                      filteredPayouts.map((payout) => (
                        <TableRow key={payout.orderId}>
                          <TableCell>
                            <input type="checkbox" className="h-4 w-4" />
                          </TableCell>
                          <TableCell className="font-medium">
                            {payout.orderId}
                          </TableCell>
                          <TableCell className="text-right">
                            ₹{" "}
                            {parseFloat(payout.openingBalance || "0").toFixed(
                              2
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            ₹{" "}
                            {parseFloat(payout.lockedAmount || "0").toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right">
                            ₹{" "}
                            {parseFloat(payout.chargedAmount || "0").toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                payout.status === "SUCCESS"
                                  ? "bg-green-50 text-green-700"
                                  : payout.status === "FAILED"
                                  ? "bg-red-50 text-red-700"
                                  : "bg-yellow-50 text-yellow-700"
                              }`}
                            >
                              {payout.status}
                            </span>
                          </TableCell>
                          <TableCell>
                            {dayjs(payout.createdAt).format("DD-MM-YYYY HH:mm")}
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon">
                              <ChevronDown className="h-4 w-4" />
                            </Button>
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
            </div>
          </CardContent>
        </Card>
      </main>
    </DashboardLayout>
  );
};

export default Payout;
