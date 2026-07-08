import SideBar from "./sidebar/SideBar.jsx";
import NavBar from "./navbar/NavBar.jsx";
import { useState, useEffect } from "react";
import { UserContext } from "../../context/UserContext.jsx";

export default function BasePage({ children }) {
  const [user, setUser] = useState(null);

  // once the base page loads, fetch the current user if applicable
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/user");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
        setUser(null);
      }
    };

    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <SideBar />

      <div className="app-content-layout">
        <NavBar />

        {children}

        <footer className="mt-5">
          <hr />
          <p className="text-center">ClubSync. All Rights Reserved</p>
        </footer>
      </div>
    </UserContext.Provider>
  );
}
