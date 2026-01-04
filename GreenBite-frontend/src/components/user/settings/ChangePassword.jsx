import React, { useState } from "react";
import * as yup from "yup";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useChangePassword } from "@/hooks/settings/useChangePassword";
import FloatingInput from "@/components/ui/FloatingInput";

const schema = yup.object({
  current_password: yup.string().required("Current password is required"),
  new_password: yup
    .string()
    .required("New password is required")
    .min(8, "Password must be at least 8 characters")
    .matches(/[a-z]/, "Must include a lowercase letter")
    .matches(/[A-Z]/, "Must include an uppercase letter")
    .matches(/\d/, "Must include a number"),
  confirm_password: yup
    .string()
    .oneOf([yup.ref("new_password")], "Passwords do not match")
    .required("Please confirm your password"),
});

const ChangePassword = () => {
  const mutation = useChangePassword();

  const [values, setValues] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [errors, setErrors] = useState({});

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    try {
      await schema.validate(values, { abortEarly: false });

      mutation.mutate({
        current_password: values.current_password,
        new_password: values.new_password,
      });
    } catch (err) {
      if (err.inner) {
        const formErrors = {};
        err.inner.forEach((error) => {
          formErrors[error.path] = error.message;
        });
        setErrors(formErrors);
      }
    }
  };

  return (
    <div className="card bg-base-100 shadow">
      <form onSubmit={handleSubmit} className="card-body space-y-6">
        <h2 className="card-title">Change Password</h2>

        {/* Current */}
        <div className="relative">
          <FloatingInput
            id="current_password"
            name="current_password"
            label="Current Password"
            type={showCurrent ? "text" : "password"}
            value={values.current_password}
            error={errors.current_password}
            onChange={handleChange}
          />
          <button
            type="button"
            onClick={() => setShowCurrent(!showCurrent)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600"
          >
            {showCurrent ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        {/* New */}
        <div className="relative">
          <FloatingInput
            id="new_password"
            name="new_password"
            label="New Password"
            type={showNew ? "text" : "password"}
            value={values.new_password}
            error={errors.new_password}
            onChange={handleChange}
          />
          <button
            type="button"
            onClick={() => setShowNew(!showNew)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600"
          >
            {showNew ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        {/* Confirm */}
        <div className="relative">
          <FloatingInput
            id="confirm_password"
            name="confirm_password"
            label="Re-type New Password"
            type={showConfirm ? "text" : "password"}
            value={values.confirm_password}
            error={errors.confirm_password}
            onChange={handleChange}
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600"
          >
            {showConfirm ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        {mutation.isError && (
          <p className="text-red-500 text-sm">
            {mutation.error?.response?.data?.detail ||
              "Failed to change password"}
          </p>
        )}

        {mutation.isSuccess && (
          <p className="text-green-500 text-sm">
            Password changed successfully
          </p>
        )}

        <button
          type="submit"
          className="btn bg-[#057A55] text-[white] w-fit"
          disabled={mutation.isLoading}
        >
          Change Password
        </button>
      </form>
    </div>
  );
};

export default ChangePassword;
