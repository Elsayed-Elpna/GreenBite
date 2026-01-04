import React, { useState, useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useDeleteAccount } from "@/hooks/settings/useDeleteAccount";
import FloatingInput from "@/components/ui/FloatingInput";
import { useNavigate } from "react-router-dom";
const DeleteAccount = () => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  const mutation = useDeleteAccount({
    onSuccess: () => {
      logout();
      navigate("/", { replace: true });
    },
  });

  const handleDelete = () => {
    mutation.mutate(password);
  };

  return (
    <div className="card border border-red-500 bg-base-100 shadow">
      <div className="card-body space-y-6">
        <h2 className="text-xl font-bold text-red-500">Delete Account</h2>

        {/* Password */}
        <div className="relative">
          <FloatingInput
            id="delete_password"
            name="delete_password"
            label="Confirm Password"
            type={showPassword ? "text" : "password"}
            value={password}
            error={
              mutation.isError
                ? mutation.error?.response?.data?.current_password ||
                  "Incorrect password"
                : ""
            }
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600"
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        <button
          className="btn btn-error w-fit"
          onClick={handleDelete}
          disabled={mutation.isLoading || !password}
        >
          Delete Account
        </button>
      </div>
    </div>
  );
};

export default DeleteAccount;
