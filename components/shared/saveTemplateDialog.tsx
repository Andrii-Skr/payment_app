import React from "react";
import { Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle, Input } from "@/components/ui";

type SaveTemplateDialogProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  onSave: (sampleValue: string) => void;
  initialSample?: string;
};

export const SaveTemplateDialog: React.FC<SaveTemplateDialogProps> = ({ open, setOpen, onSave, initialSample }) => {
  const [sample, setSample] = React.useState(initialSample || "");

  React.useEffect(() => {
    if (!initialSample) return;
    setSample(initialSample);
  }, [initialSample]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogTitle>Сохранить шаблон</DialogTitle>
        <DialogDescription>Введите название шаблона</DialogDescription>
        <Input
          value={sample}
          className="w-[350px]"
          onChange={(e) => setSample(e.target.value)}
          placeholder="Введите название шаблона"
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Отмена
          </Button>
          <Button
            onClick={() => {
              onSave(sample);
              setSample("");
              setOpen(false);
            }}
          >
            Сохранить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
