import MarketplaceListings from '@/components/marketplace/ListingMarket';
const Marketplace = () => {

  return (
    <div className="min-h-screen bg-background p-6">
      <MarketplaceListings />
    </div>
  );
};

// const Marketplace = () => {
//   return (
//     <div className="min-h-screen bg-background">
//       <main className="container mx-auto px-4 py-6">
//         <MarketplaceListings />
//       </main>
//     </div>
//   );
// };

export default Marketplace;