// components/ui/LoadingMessage.tsx
export const LoadingMessage = ({ text = "Загрузка…" }: { text?: string }) => {
  return <p className="text-muted-foreground italic">{text}</p>;
};
