import { Users, Utensils, ShoppingBag } from 'lucide-react';
import Button  from '@/components/ui/Button';

const JoinCommunity = () => {
  return (
    <section className="py-4">
      <div className="
      rounded-2xl p-8 md:p-12
      bg-gradient-to-r from-emerald-50/60 via-green-50/50 to-orange-50/50
      border border-emerald-100/70
      shadow-sm
    ">
  <div className="flex flex-col lg:flex-row items-center gap-8 ">
    {/* Left content */}
    <div className="flex-1 text-center lg:text-left">
      <div className="flex justify-center lg:justify-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-full bg-green-100/40 flex items-center justify-center">
          <Users className="w-6 h-6 text-green-700" />
        </div>
        <div className="w-12 h-12 rounded-full bg-green-100/40 flex items-center justify-center">
          <Utensils className="w-6 h-6 text-green-700" />
        </div>
        <div className="w-12 h-12 rounded-full bg-green-100/40 flex items-center justify-center">
          <ShoppingBag className="w-6 h-6 text-green-700" />
        </div>
      </div>
      <h2 className="text-2xl md:text-3xl font-extrabold text-foreground mb-3">Join Our Community</h2>
      <p className="text-muted-foreground/95 mb-6 max-w-xl">
        Connect with food lovers, share your recipes, and discover new culinary adventures.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
        <Button size="lg" className="bg-green-700 text-white hover:bg-green-800">Get Started Free</Button>
        <Button size="lg" variant="outline" className="border-green-700 text-green-700 hover:bg-green-50">Learn More</Button>
      </div>
    </div>

    {/* Right stats */}
    <div className="flex gap-8 text-center">
      <div>
        <p className="text-3xl md:text-4xl font-bold text-green-700">10K+</p>
        <p className="text-sm text-muted-foreground/80">Active Users</p>
      </div>
      <div>
        <p className="text-3xl md:text-4xl font-bold text-green-700">50K+</p>
        <p className="text-sm text-muted-foreground/80">Recipes Shared</p>
      </div>
      <div>
        <p className="text-3xl md:text-4xl font-bold text-green-700">2M+</p>
        <p className="text-sm text-muted-foreground/80">Meals Saved</p>
      </div>
    </div>
  </div>
</div>
    </section>
  );
};

export default JoinCommunity;
