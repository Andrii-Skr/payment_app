"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type ChoiceDialogProps = {
  open: boolean;
  title: string;
  description?: string;
  choices: {
    label: string;
    onSelect: () => void;
  }[];
  onCancel: () => void;
  cancelLabel?: string;
};

export const ChoiceDialog: React.FC<ChoiceDialogProps> = ({
  open,
  title,
  description,
  choices,
  onCancel,
  cancelLabel = "Отмена",
}) => (
  <Dialog open={open} onOpenChange={onCancel}>
    <DialogContent className="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        {description && <DialogDescription>{description}</DialogDescription>}
      </DialogHeader>

      <DialogFooter className="flex flex-col items-stretch gap-2">
        {choices.map((choice, i) => (
          <Button key={i} onClick={choice.onSelect}>
            {choice.label}
          </Button>
        ))}
        <Button variant="ghost" onClick={onCancel}>
          {cancelLabel}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
