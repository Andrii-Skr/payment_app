import { Container, PaymentForm } from "@/components/shared";
import AddForm from "@/components/shared/addForm";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
};

const Form: React.FC<Props> = ({ className }) => {
  return (
    <Container>
      <div
        className={cn(
          "w-[90dvw] h-[80dvh] mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          className
        )}
      >
        <AddForm />
      </div>
    </Container>
  );
};

export default Form;
