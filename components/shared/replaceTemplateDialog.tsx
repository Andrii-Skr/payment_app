import React from "react";
import { Button } from "@/components/ui";

interface ReplaceTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  name?: string;
  onConfirm: () => void;
  title?: string;
  description?: string;
}

export const ReplaceTemplateDialog: React.FC<ReplaceTemplateDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  name,
  title = "Подтверждение замены",
  description = `Счет будет заменен данными из шаблона "${name}" Продолжить?`,
}) => {
  if (!open) return null;

  const handleCancel = () => {
    onOpenChange(false);
  };

  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    >
      <div className="bg-white p-6 rounded-md w-[300px]">
        <h2 className="text-lg font-bold mb-4">{title}</h2>
        <p className="mb-4">{description}</p>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={handleCancel}>
            Отменить
          </Button>
          <Button onClick={handleConfirm}>Подтвердить</Button>
        </div>
      </div>
    </div>
  );
};
