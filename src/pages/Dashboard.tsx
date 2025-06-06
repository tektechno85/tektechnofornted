import { LogOut, User, Mail, Calendar, Settings, BarChart3 } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/DashboardLayout";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
  };

  if (!user) return null;

  return (
    <DashboardLayout>
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
        <div className="flex h-16 items-center justify-between py-4 px-6">
          <h1 className="text-xl font-semibold">Dashboard</h1>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6 space-y-8">
        {/* Welcome Section */}
        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="col-span-full">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6 items-center">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="space-y-2 text-center md:text-left">
                  <h2 className="text-2xl font-bold">Welcome back, {user.name}!</h2>
                  <p className="text-muted-foreground">
                    Here's what's happening with your account today
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* User Profile and Stats */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Your account details and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium leading-none">Name</p>
                  <p className="text-sm text-muted-foreground">{user.name}</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-4">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium leading-none">Email</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-4">
                <Settings className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium leading-none">Role</p>
                  <p className="text-sm text-muted-foreground">{user.role}</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-4">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium leading-none">Joined</p>
                  <p className="text-sm text-muted-foreground">{user.joinedDate}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Activity Stats</CardTitle>
              <CardDescription>Your recent activities and metrics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium leading-none text-muted-foreground">Projects</p>
                  <p className="text-2xl font-bold">12</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium leading-none text-muted-foreground">Tasks</p>
                  <p className="text-2xl font-bold">42</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium leading-none text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold">28</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium leading-none text-muted-foreground">Hours</p>
                  <p className="text-2xl font-bold">187</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest account activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { action: "Logged in", time: "Today at 8:30 AM" },
                  { action: "Updated profile", time: "Yesterday at 6:12 PM" },
                  { action: "Completed task #1337", time: "Apr 22, 2023 at 11:30 AM" },
                  { action: "Created new project", time: "Apr 21, 2023 at 9:45 AM" }
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      <span>{item.action}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{item.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Quick Stats</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              { title: "Total Revenue", value: "$12,548", icon: BarChart3, change: "+15%" },
              { title: "Active Projects", value: "7", icon: BarChart3, change: "+3%" },
              { title: "Pending Tasks", value: "14", icon: BarChart3, change: "-2%" },
              { title: "Team Members", value: "9", icon: BarChart3, change: "+1%" }
            ].map((stat, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                      <p className="text-2xl font-bold mt-2">{stat.value}</p>
                    </div>
                    <div className="bg-primary/10 p-2 rounded-full">
                      <stat.icon className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className={`text-xs font-medium ${stat.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                      {stat.change} from last month
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </DashboardLayout>
  );
};

export default Dashboard;