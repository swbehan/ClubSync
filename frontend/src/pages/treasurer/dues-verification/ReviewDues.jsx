import { Container } from "react-bootstrap";
import DuesVerificationWidget from "../treasurer-dashboard/dues-verification-widget/DuesVerificationWidget";

export default function ReviewDues() {
  return (
    <Container className="px-5">
      <h1 className="moto">Review Dues Submission</h1>
      <p className="lead-text spacing-after-moto">
        Review all dues submissions from members of your club
      </p>
      
      <DuesVerificationWidget />
    </Container>
  );
}
