import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function Activate() {
  const { uid, token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("Activating your account...");

  useEffect(() => {
    const activateAccount = async () => {
      try {
        await axios.post("http://localhost:8000/auth/users/activation/", {
          uid,
          token,
        });

        setStatus("Account successfully activated! Redirecting to login...");
        setTimeout(() => navigate("/login"), 3000); // redirect after 3s
      } catch (error) {
        console.error(error);
        setStatus(
          error.response?.data?.detail ||
            "Activation failed. The link may be invalid or expired."
        );
      }
    };

    activateAccount();
  }, [uid, token, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Account Activation</h2>
      <p className="text-center">{status}</p>
    </div>
  );
}
