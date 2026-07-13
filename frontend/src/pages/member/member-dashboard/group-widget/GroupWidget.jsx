import { Col } from "react-bootstrap";
import { useState, useEffect } from "react";
import { useUser } from "../../../../context/UserContext.jsx";
import GroupCard from "./GroupCard.jsx";

// Member dashboard widget that shows the club/semester the member currently
// belongs to. Reads the member's groupId from context and loads the group; the
// card is a presentational child.
export default function GroupWidget() {
  const { user } = useUser();
  const [group, setGroup] = useState(null);

  useEffect(() => {
    if (!user?.groupId) return;
    const loadGroup = async () => {
      try {
        const res = await fetch(`/api/groups/${user.groupId}`, {
          credentials: "include",
        });
        if (!res.ok) return;
        setGroup(await res.json());
      } catch (err) {
        console.error("Failed to load group", err);
      }
    };
    loadGroup();
  }, [user?.groupId]);

  return (
    <Col xs={12} md={6} lg={5} className="role-card member-dues-widget">
      <GroupCard group={group} />
    </Col>
  );
}
