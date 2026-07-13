import { Container } from "react-bootstrap";

export default function AboutPage() {
  return (
    <Container className="px-5">
      <h1 className="moto">About ClubSync</h1>
      <p className="lead-text spacing-after-moto">
        ClubSync replaces the Google Form and spreadsheet routine clubs use to
        track dues and events. Members join a group, submit dues, and see which
        events they qualify for; treasurers review dues in one place; and admins
        run events knowing exactly who's cleared to attend.
      </p>
    </Container>
  );
}
