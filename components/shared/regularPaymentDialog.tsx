import type React from "react";
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

type RegularPaymentDialogProps = {
  open: boolean;
  paySum: number | string;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

export const RegularPaymentDialog: React.FC<RegularPaymentDialogProps> = ({
  open,
  paySum,
  onOpenChange,
  onConfirm,
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Подтверждение</AlertDialogTitle>
          <AlertDialogDescription>
            Вы действительно хотите сделать платеж на сумму {paySum} регулярным?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Отмена</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Да</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
