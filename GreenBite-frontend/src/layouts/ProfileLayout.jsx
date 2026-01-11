import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "@/components/Profile/Sidebar";
import { AuthContext } from "@/context/AuthContext";
import { useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { getProfile } from "@/hooks/settings/useProfile";
function ProfileLayout() {
  const { user, isSubscribed, isAdmin, loading } = useContext(AuthContext);
  const { data, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
    enabled: !!user,
  });

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  if (!user || !data) return null;

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="flex-shrink-0">
        <Sidebar isSubscribed={isSubscribed} isAdmin={isAdmin} />
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <div className="min-h-full w-full ">
          <Outlet context={data} />
        </div>
      </main>
    </div>
  );
}

export default ProfileLayout;
