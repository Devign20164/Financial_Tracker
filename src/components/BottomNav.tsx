import { Home, ArrowLeftRight, Wallet, CreditCard, User } from "lucide-react";
import { NavLink } from "./NavLink";
import { cn } from "@/lib/utils";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export const BottomNav = () => {
  const location = useLocation();
  const { user, loading } = useAuth();

  // Hide nav when unauthenticated or loading
  if (loading || !user || location.pathname === "/auth") {
    return null;
  }

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: ArrowLeftRight, label: "Transactions", path: "/transactions" },
    { icon: Wallet, label: "Accounts", path: "/accounts" },
    { icon: CreditCard, label: "Cards", path: "/cards" },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border z-50">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className="relative flex flex-col items-center justify-center gap-1 flex-1 py-2 px-3 rounded-xl text-muted-foreground transition-all duration-300 hover:text-foreground active:scale-95"
          >
            {({ isActive }) => (
              <>
                {/* Pill background for active state */}
                {isActive && (
                  <div className="absolute inset-0 bg-primary/10 rounded-xl transition-all duration-300" />
                )}

                {/* Icon with smooth fill transition */}
                <item.icon
                  className={cn(
                    "h-5 w-5 relative z-10 transition-all duration-300",
                    isActive ? "text-primary scale-110" : "scale-100"
                  )}
                  strokeWidth={isActive ? 2.5 : 2}
                />

                {/* Label */}
                <span
                  className={cn(
                    "text-xs font-medium relative z-10 transition-all duration-300",
                    isActive && "text-primary font-semibold"
                  )}
                >
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
