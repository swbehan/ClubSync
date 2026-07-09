import { Container, Row } from "react-bootstrap";
import { useUser } from "../../../context/UserContext.jsx";
import "../memberdashboard.css";
import DuesWidget from "./member-dues-widget/DuesWidget.jsx";

export default function MemberDashboard() {
  const { user } = useUser();
  return (
    <Container className="px-5">
      <h1 className="moto">Welcome Back, {user.firstName}</h1>
      <p className="lead-text member-dashboard-subtitle">
        Below is your overview into your clubs necessities; updates on dues status and upcoming events.
      </p>

      <Row className="justify-content-center gy-4">
        <DuesWidget user={user}/>

      </Row>
    </Container>
  );
}
