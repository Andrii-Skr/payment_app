import { Container, PaymentForm } from "@/components/shared";

const Form = () => {
  return (
    <Container>
      <div
        className={
          "w-[90dvw] h-[80dvh] mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        }
      >
        <PaymentForm />
      </div>
    </Container>
  );
};

export default Form;
