import { Container } from "react-bootstrap";
import { useUser } from "../../../context/UserContext.jsx";

export default function MemberDashboard() {
  const { user } = useUser();
  return (
    <Container className="px-5">
      <h1 className="moto">Welcome {user.name}</h1>
      <p className="lead-text">
        You are a member and can view your clubs events, dues status and RSVP to
        events!
      </p>
    </Container>
  );
}
