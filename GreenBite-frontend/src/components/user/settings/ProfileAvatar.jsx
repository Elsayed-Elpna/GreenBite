import React from "react";
import { useState } from "react";
import { useProfile } from "@/hooks/settings/useProfile";
const ProfileAvatar = () => {
  const { updateProfile, data, isLoading } = useProfile();
  const [avatars, setAvatars] = useState(null);
  if (isLoading) return <div className="skeleton h-32 w-full" />;
  const { first_name, last_name, profile: { avatar } = {} } = data || {};
  const handleSubmit = () => {
    const formData = new FormData();
    if (avatars) formData.append("avatar", avatars);
    updateProfile.mutate(formData);
  };
  return (
    <div className="card bg-base-100 shadow">
      <div className="card-body space-y-4">
        <h2 className="card-title">Profile Picture</h2>

        <div className="flex items-center gap-4">
          <div className="avatar">
            <div className="w-16 rounded-full">
              <img src={avatar} alt="avatar" />
            </div>
          </div>
          <span className="font-medium">
            {first_name} {last_name}
          </span>
        </div>

        <input
          type="file"
          className="file-input file-input-bordered w-full"
          onChange={(e) => setAvatars(e.target.files[0])}
        />

        <button
          onClick={handleSubmit}
          className="btn bg-[#057A55] text-[white] w-fit"
          disabled={updateProfile.isLoading}
        >
          Save Changes
        </button>

        {updateProfile.isError && (
          <div className="alert alert-error shadow-lg">
            <div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-current flex-shrink-0 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>
                {updateProfile.error?.response?.data?.avatar ||
                  "Something went wrong"}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileAvatar;
