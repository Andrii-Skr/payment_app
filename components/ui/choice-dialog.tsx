"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ChoiceDialogProps = {
  open: boolean;
  title: string;
  description?: string;
  choices: {
    label: string;
    onSelect: () => void;
    variant?: React.ComponentProps<typeof Button>["variant"];
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
        {choices.map((choice) => (
          <Button key={choice.label} onClick={choice.onSelect} variant={choice.variant}>
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
