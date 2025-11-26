import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useAccounts } from "@/hooks/useAccounts";
import { useTransactions } from "@/hooks/useTransactions";
import {
  User,
  Mail,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
  ChevronRight,
  Wallet,
  ArrowLeftRight,
} from "lucide-react";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signOut } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const { accounts } = useAccounts();
  const { transactions } = useTransactions();

  const handleLogout = async () => {
    await signOut();
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully",
    });
    navigate("/auth");
  };

  const menuItems = [
    {
      icon: User,
      label: "Edit Profile",
      description: "Update your personal information",
      action: () => navigate("/profile/edit"),
    },
    {
      icon: Bell,
      label: "Notifications",
      description: "Manage your notification preferences",
      action: () => toast({ title: "Feature coming soon!" }),
    },
    {
      icon: Shield,
      label: "Security",
      description: "Password and security settings",
      action: () => navigate("/profile/security"),
    },
    {
      icon: HelpCircle,
      label: "Help & Support",
      description: "Get help with your account",
      action: () => toast({ title: "Feature coming soon!" }),
    },
  ];

  const totalAccounts = accounts.length;
  const totalTransactions = transactions.length;

  // Get initials from profile
  const getInitials = () => {
    if (!profile) return "U";
    const first = profile.first_name?.[0] || "";
    const last = profile.last_name?.[0] || "";
    return (first + last).toUpperCase() || "U";
  };

  const getFullName = () => {
    if (!profile) return "User";
    return `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "User";
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Simple Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-4">
          <h1 className="text-xl font-bold">Profile</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Profile Card */}
        <Card className="p-6">
          <div className="flex flex-col items-center text-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">{profileLoading ? "Loading..." : getFullName()}</h2>
              <div className="flex items-center justify-center gap-2 text-muted-foreground mt-1">
                <Mail className="h-4 w-4" />
                <p className="text-sm">{profile?.email || "user@example.com"}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Wallet className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalAccounts}</p>
                <p className="text-sm text-muted-foreground">Accounts</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <ArrowLeftRight className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalTransactions}</p>
                <p className="text-sm text-muted-foreground">Transactions</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Menu Items */}
        <Card className="divide-y divide-border">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={item.action}
              className="w-full flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="p-2 rounded-lg bg-primary/10">
                <item.icon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium">{item.label}</p>
                <p className="text-sm text-muted-foreground">
                  {item.description}
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>
          ))}
        </Card>

        {/* Logout Button */}
        <Button
          variant="destructive"
          className="w-full"
          size="lg"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5 mr-2" />
          Logout
        </Button>

        {/* App Info */}
        <div className="text-center text-sm text-muted-foreground">
          <p>Finance Tracker v1.0.0</p>
          <p className="mt-1">© 2025 All rights reserved</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;

