import { useNavigate } from "react-router";
import { useUser } from "../../../context/UserContext.jsx";
import AuthForm from "../AuthForm.jsx";

const ROLE_HOME = {
  member: "/member/member-dashboard",
  // add treasurer/admin homes later
};

export default function LoginPage() {
  const navigate = useNavigate();
  const { setUser } = useUser();

  return (
    <AuthForm
      heading="Log in to ClubSync"
      endpoint="/api/auth/login"
      submitLabel="Login"
      errorFallback="Invalid credentials"
      fields={[
        {
          name: "email",
          label: "Email address",
          type: "email",
          placeholder: "Enter email",
        },
        {
          name: "password",
          label: "Password",
          type: "password",
          placeholder: "Password",
        },
      ]}
      onSuccess={(data) => {
        setUser(data.user);
        navigate(ROLE_HOME[data.user.role] ?? "/");
      }}
    />
  );
}
