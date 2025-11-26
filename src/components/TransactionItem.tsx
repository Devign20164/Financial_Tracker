import { Transaction } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Briefcase,
  DollarSign,
  TrendingUp,
  ShoppingCart,
  Home,
  Zap,
  Tv,
  Car,
  ShoppingBag,
  UtensilsCrossed,
  Plus,
  Minus,
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

interface TransactionItemProps {
  transaction: Transaction;
  onTransactionUpdated?: () => void;
}

const iconMap = {
  Briefcase,
  DollarSign,
  TrendingUp,
  ShoppingCart,
  Home,
  Zap,
  Tv,
  Car,
  ShoppingBag,
  UtensilsCrossed,
  Plus,
  Minus,
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
import { TransactionDialog } from "./AddTransactionDialog";
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

export const TransactionItem = ({ transaction, onTransactionUpdated }: TransactionItemProps) => {
  const [categoryName, setCategoryName] = useState<string>("");
  const [categoryIcon, setCategoryIcon] = useState<string>("DollarSign");
  const [accountName, setAccountName] = useState<string>("");
  const [editOpen, setEditOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchDetails = async () => {
      // Fetch category
      const { data: category } = await supabase
        .from("categories")
        .select("name, icon")
        .eq("id", transaction.category_id)
        .single();

      if (category) {
        setCategoryName(category.name);
        setCategoryIcon(category.icon);
      }

      // Fetch account
      const { data: account } = await supabase
        .from("accounts")
        .select("name")
        .eq("id", transaction.account_id)
        .single();

      if (account) {
        setAccountName(account.name);
      }
    };

    fetchDetails();
  }, [transaction.category_id, transaction.account_id]);

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", transaction.id);

      if (error) throw error;

      toast({
        title: "Transaction Deleted",
        description: "Transaction has been removed successfully",
      });
      setDeleteConfirmOpen(false);
      onTransactionUpdated?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete transaction",
        variant: "destructive",
      });
    }
  };

  const Icon = iconMap[categoryIcon as keyof typeof iconMap] || DollarSign;
  const isIncome = transaction.type === "income";

  const date = new Date(transaction.date);
  const formattedDate = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <>
      <div className="flex items-center justify-between p-4 rounded-lg hover:bg-muted/50 transition-colors group">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "p-2 rounded-full",
              isIncome ? "bg-success/10" : "bg-destructive/10"
            )}
          >
            <Icon
              className={cn(
                "h-5 w-5",
                isIncome ? "text-success" : "text-destructive"
              )}
            />
          </div>
          <div>
            <p className="font-medium">{categoryName || "Loading..."}</p>
            <p className="text-sm text-muted-foreground">{transaction.description}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {accountName} • {formattedDate}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <p
            className={cn(
              "font-bold text-lg",
              isIncome ? "text-success" : "text-destructive"
            )}
          >
            {isIncome ? "+" : "-"}
            {formatCurrency(transaction.amount)}
          </p>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => { e.preventDefault(); e.stopPropagation(); setEditOpen(true); }}>
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
      </div>

      <TransactionDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        transactionToEdit={transaction}
        onSuccess={onTransactionUpdated}
      />
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete transaction?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the transaction record. This action cannot be undone.
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
