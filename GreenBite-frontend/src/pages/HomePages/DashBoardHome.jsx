import React from "react";
import {} from 'lucide-react';
import {} from '@/components/HomePage/SpoilageDitection';
import SpoilageDetection from "@/components/HomePage/SpoilageDitection";
import JoinCommunity from '@/components/HomePage/JoinCommunity';
import MyMealsPage from '@/pages/HomePages/Meals/MyMealsPage';
import ExpirySoonn from '@/components/HomePage/ExpirySoon';
import DashboardSummary from '@/components/HomePage/Dashboard';
const DashBoardHome = () => {
  return (
    <div>
      <main className="max-w-7xl">
        <DashboardSummary />
        <SpoilageDetection />
      <JoinCommunity />
      <ExpirySoonn />

      </main>
      <MyMealsPage />
    </div>

  );
};

export default DashBoardHome;
