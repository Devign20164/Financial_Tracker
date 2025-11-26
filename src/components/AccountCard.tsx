import { Card } from "@/components/ui/card";
import { Account } from "@/lib/supabase";
import { Building2, Wallet, CreditCard, Smartphone, TrendingUp, TrendingDown } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

interface AccountCardProps {
  account: Account;
  onClick?: () => void;
  onAccountUpdated?: () => void;
}

const iconMap = {
  Building2,
  Wallet,
  CreditCard,
  Smartphone,
};

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Trash, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { AccountDialog } from "./AddAccountDialog";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const AccountCard = ({ account, onClick, onAccountUpdated }: AccountCardProps) => {
  const { toast } = useToast();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const Icon = iconMap[account.icon as keyof typeof iconMap] || Wallet;
  const isCredit = account.type === "credit";
  const percentage = isCredit && account.credit_limit ? (account.balance / account.credit_limit) * 100 : 0;
  const isNearLimit = percentage > 80;

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from("accounts")
        .delete()
        .eq("id", account.id);

      if (error) throw error;

      toast({
        title: "Account Deleted",
        description: "Account has been removed successfully",
      });
      setDeleteConfirmOpen(false);
      onAccountUpdated?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete account",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Card
        className={cn(
          "p-4 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg relative group",
          onClick && "active:scale-[0.98]"
        )}
        onClick={onClick}
      >
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setEditOpen(true); }}>
                <Edit2 className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDeleteConfirmOpen(true);
                }}
                className="text-destructive focus:text-destructive"
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{account.name}</p>
              <p className="text-2xl font-bold mt-1">
                {formatCurrency(account.balance)}
              </p>
            </div>
          </div>
          {isCredit && (
            <div className="flex items-center gap-1 mr-8">
              {isNearLimit ? (
                <TrendingUp className="h-4 w-4 text-warning" />
              ) : (
                <TrendingDown className="h-4 w-4 text-success" />
              )}
            </div>
          )}
        </div>

        {isCredit && account.credit_limit && (
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Used</span>
              <span>
                {formatCurrency(account.balance)} / {formatCurrency(account.credit_limit ?? 0)}
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full transition-all rounded-full",
                  isNearLimit ? "bg-warning" : "bg-primary"
                )}
                style={{ width: `${percentage}%` }}
              />
            </div>
            {isNearLimit && (
              <p className="text-xs text-warning mt-1">⚠️ Approaching credit limit</p>
            )}
          </div>
        )}
      </Card>

      <AccountDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        accountToEdit={account}
        onSuccess={onAccountUpdated}
      />
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete account?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the account and its balance. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
