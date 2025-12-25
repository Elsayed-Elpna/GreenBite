import { Link } from "react-router-dom";
import { Button } from "flowbite-react";

export default function ResetSuccess() {
  return (
    <div className="text-center space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">
        Password reset successful 🎉
      </h2>
      <p className="text-gray-500">
        You can now log in using your new password.
      </p>

      <Link to="/login">
        <Button className="bg-green-600 hover:bg-green-700">
          Go to login
        </Button>
      </Link>
    </div>
  );
}
