import React from "react";
import ProfileAvatar from "@/components/user/settings/ProfileAvatar";
import ChangePassword from "@/components/user/settings/ChangePassword";
import DeleteAccount from "@/components/user/settings/DeleteAccount";

const Settings = () => {
  return (
    <div className="min-h-screen bg-base-200">
      <div className="container max-w-3xl mx-auto py-8 px-4 space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl mb-2">Profile Settings</h1>
          <p className="text-base-content/70">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Components */}
        <ProfileAvatar />
        <ChangePassword />
        <DeleteAccount />
      </div>
    </div>
  );
};

export default Settings;
