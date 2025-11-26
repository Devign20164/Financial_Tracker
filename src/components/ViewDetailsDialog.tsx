import { Account } from "@/lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar, FileText, CreditCard } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface ViewDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  creditCard: Account;
}

export const ViewDetailsDialog = ({
  open,
  onOpenChange,
  creditCard,
}: ViewDetailsDialogProps) => {
  const parsedStatementDate = creditCard.statement_date ? new Date(creditCard.statement_date) : null;
  const parsedPaymentDueDate = creditCard.payment_due_date ? new Date(creditCard.payment_due_date) : null;

  const formatDate = (date: Date | null) => {
    if (!date) return "Not provided";
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <CreditCard className="h-5 w-5 text-primary" />
            </div>
            <DialogTitle className="text-xl">Credit Card Details</DialogTitle>
          </div>
        </DialogHeader>
        <div className="space-y-5">
          <div className="p-4 rounded-lg border border-border bg-gradient-to-br from-card to-muted/30">
            <div className="flex items-center gap-2 mb-1">
              <CreditCard className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-lg">{creditCard.name}</h3>
            </div>
            <p className="text-sm text-muted-foreground">•••• {creditCard.id.slice(0, 4)}</p>
          </div>

          <div className="space-y-3 pt-2 border-t">
            <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                <FileText className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium mb-1">Statement Date</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(parsedStatementDate)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="p-2 rounded-lg bg-destructive/10 flex-shrink-0">
                <Calendar className="h-4 w-4 text-destructive" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium mb-1">Payment Due Date</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(parsedPaymentDueDate)}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Current Balance</span>
              <span className="font-semibold">
                {formatCurrency(creditCard.balance)}
              </span>
            </div>
            {creditCard.credit_limit && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Credit Limit</span>
                <span className="font-semibold">
                  {formatCurrency(creditCard.credit_limit)}
                </span>
              </div>
            )}
            {creditCard.credit_limit && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Available Credit</span>
                <span className="font-semibold">
                  {formatCurrency((creditCard.credit_limit || 0) - creditCard.balance)}
                </span>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

