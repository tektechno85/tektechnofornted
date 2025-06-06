import { useState } from "react";
import { Search, Download, ChevronDown } from "lucide-react";
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
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import DashboardLayout from "@/components/DashboardLayout";

// Mock data for payouts
const mockPayouts = [
    {
        id: "MOJO0623001MS8761640",
        type: "Payout",
        subtype: "Transferred to Bank Account",
        date: "Jun 24, 2023, 11:25 AM",
        amount: 9,
    },
    {
        id: "MOJO0623001MS0937790",
        type: "Settlement",
        subtype: "Transferred to Bank Account",
        date: "Jun 23, 2023, 07:52 PM",
        amount: 9,
    },
    {
        id: "MOJO0619001M77297095",
        type: "Payout",
        subtype: "Transferred to Bank Account",
        date: "Jun 19, 2023, 11:36 AM",
        amount: 9.90,
    },
    {
        id: "MOJO0917001M99826750",
        type: "Payout",
        subtype: "Transferred to Bank Account",
        date: "Mar 03, 2020, 10:51 AM",
        amount: 9,
    },
];

const Payout = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [filterType, setFilterType] = useState("all");
    const [payoutType, setPayoutType] = useState("all");

    const filteredPayouts = mockPayouts.filter((payout) => {
        const matchesSearch = payout.id.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilterType = filterType === "all" || filterType === payout.type.toLowerCase();
        const matchesPayoutType = payoutType === "all" || payoutType === payout.type.toLowerCase();
        return matchesSearch && matchesFilterType && matchesPayoutType;
    });

    return (
        <DashboardLayout>
            {/* Header */}
            <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
                <div className="flex h-16 items-center justify-between py-4 px-6">
                    <h1 className="text-xl font-semibold">Payouts</h1>
                    <Button>Create New</Button>
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
                                            <TableHead>PAYOUT ID</TableHead>
                                            <TableHead>PAYOUT TYPE</TableHead>
                                            <TableHead>DATE</TableHead>
                                            <TableHead className="text-right">AMOUNT</TableHead>
                                            <TableHead className="w-[50px]"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredPayouts.map((payout) => (
                                            <TableRow key={payout.id}>
                                                <TableCell>
                                                    <input type="checkbox" className="h-4 w-4" />
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {payout.id}
                                                    <div className="text-sm text-muted-foreground">
                                                        {payout.subtype}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{payout.type}</TableCell>
                                                <TableCell>{payout.date}</TableCell>
                                                <TableCell className="text-right">₹ {payout.amount}</TableCell>
                                                <TableCell>
                                                    <Button variant="ghost" size="icon">
                                                        <ChevronDown className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
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