import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, RefreshCcw, Users2 } from "lucide-react";
import { cn } from "@/lib/utils";

const navigationItems = [
  {
    section: "MAIN",
    items: [{ name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" }],
  },
  {
    section: "PAYMENTS",
    items: [
      { name: "Payouts", icon: RefreshCcw, href: "/payouts" },
      { name: "Beneficiaries", icon: Users2, href: "/beneficiaries" },
      { name: "Bulk Payment", icon: RefreshCcw, href: "/bulk-payment" },
    ],
  },
];

const Sidebar = () => {
  const location = useLocation();

  return (
    <aside className="w-64 border-r bg-background h-screen fixed left-0 top-0 overflow-y-auto">
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-6">Demo Dashboard</h2>
        <nav className="space-y-6">
          {navigationItems.map((section, index) => (
            <div key={index}>
              <h3 className="text-xs font-semibold text-muted-foreground mb-2">
                {section.section}
              </h3>
              <ul className="space-y-1">
                {section.items.map((item, itemIndex) => (
                  <li key={itemIndex}>
                    <Link
                      to={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                        location.pathname === item.href
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
