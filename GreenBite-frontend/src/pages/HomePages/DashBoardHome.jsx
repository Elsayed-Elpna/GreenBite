import React from "react";
import {} from 'lucide-react';
import {} from '@/components/HomePage/SpoilageDitection';
import SpoilageDetection from "@/components/HomePage/SpoilageDitection";
import JoinCommunity from '@/components/HomePage/JoinCommunity';
import MyMealsPage from '@/pages/HomePages/Meals/MyMealsPage';
import ExpirySoonn from '@/components/HomePage/ExpirySoon';
import DashboardSummary from '@/components/HomePage/Dashboard';
import RecommendedRecipesMobile from "@/components/HomePage/Recipes/RecommendedRecipeMobile";
const DashBoardHome = () => {
  return (
    <div>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-2">
        <DashboardSummary />
        <SpoilageDetection />
      <RecommendedRecipesMobile limit={5} />
      <ExpirySoonn />
      <JoinCommunity />

      </main>
      {/* <MyMealsPage /> */}
    </div>

  );
};

export default DashBoardHome;
