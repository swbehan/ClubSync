import { useNavigate } from "react-router";
import AuthForm from "../AuthForm.jsx";

export default function RegisterPage() {
  const navigate = useNavigate();

  return (
    <AuthForm
      heading="Register"
      endpoint="/api/auth/register"
      submitLabel="Register"
      errorFallback="Registration failed"
      fields={[
        {
          name: "name",
          label: "Name",
          type: "text",
          placeholder: "Enter your name",
        },
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
      onSuccess={() => navigate("/login")}
    >
      <div>
        Do you have an account? <a href="/login">Login Here</a>
      </div>
    </AuthForm>
  );
}
