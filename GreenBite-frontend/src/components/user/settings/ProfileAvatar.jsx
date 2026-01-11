import React, { useState } from "react";
import { useProfile } from "@/hooks/settings/useProfile";

const ProfileAvatar = () => {
  const { updateProfile, data, isLoading } = useProfile();
  const [avatarFile, setAvatarFile] = useState(null);

  if (isLoading) return <div className="skeleton h-32 w-full" />;

  const first_name = data?.first_name;
  const last_name = data?.last_name;
  const avatarUrl = data?.avatar_url; 

  const handleSubmit = () => {
    const formData = new FormData();
    if (avatarFile) formData.append("avatar", avatarFile);

    updateProfile.mutate(formData, {
      // if your hook doesn't auto-refetch, at least update UI from response
      onSuccess: () => {
        setAvatarFile(null);
      },
    });
  };

  return (
    <div className="card bg-base-100 shadow">
      <div className="card-body space-y-4">
        <h2 className="card-title">Profile Picture</h2>

        <div className="flex items-center gap-4">
          <div className="avatar">
            <div className="w-16 rounded-full">
              <img
                src={avatarUrl || "/images/default-avatar.png"}
                alt="avatar"
              />
            </div>
          </div>
          <span className="font-medium">
            {first_name} {last_name}
          </span>
        </div>

        <input
          type="file"
          className="file-input file-input-bordered w-full"
          accept="image/*"
          onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
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
