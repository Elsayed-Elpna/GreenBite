import { useState } from "react";
import { useOutletContext, Link } from "react-router-dom";
import {
  User,
  Mail,
  TrendingUp,
  Calendar,
  Award,
  Shield,
  Star,
  Zap,
  Crown,
  CheckCircle2,
  ChevronRight,
  Clock,
  Sparkles,
  BarChart3,
  MessageSquare,
  CreditCard,
  ArrowRight,
} from "lucide-react";

/* ================= Helpers ================= */
function formatDate(dateString) {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function calculateDaysRemaining(endDate) {
  if (!endDate) return null;
  const now = new Date();
  const end = new Date(endDate);
  const diff = end - now;
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return days > 0 ? days : 0;
}

function getPlanDuration(plan) {
  const planMap = {
    "1_Month": { months: 1, label: "1 Month" },
    "6_Months": { months: 6, label: "6 Months" },
    "12_Months": { months: 12, label: "12 Months" },
  };
  return planMap[plan] || { months: 1, label: plan };
}

/* ================= Small Components ================= */
function FloatingParticle({ delay = 0, duration = 3, left = 50, top = 50 }) {
  return (
    <div
      className="absolute w-2 h-2 bg-green-400 rounded-full opacity-20 animate-float"
      style={{
        left: `${left}%`,
        top: `${top}%`,
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
      }}
    />
  );
}

function PulseRing({ size = "large" }) {
  const sizeClasses = {
    small: "w-16 h-16",
    medium: "w-24 h-24",
    large: "w-32 h-32",
  };

  return (
    <div className={`absolute ${sizeClasses[size]} -z-10`}>
      <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-20"></div>
      <div className="absolute inset-0 bg-green-400 rounded-full animate-pulse opacity-10"></div>
    </div>
  );
}

function InfoLine({ label, value, active, icon: Icon }) {
  return (
    <div className="group relative overflow-hidden">
      <div className="text-sm text-gray-500 mb-1 font-medium flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4" />}
        {label}
      </div>
      <div
        className={`text-base font-semibold transition-all ${
          active ? "text-green-600" : "text-gray-900"
        }`}
      >
        {value || "—"}
      </div>
    </div>
  );
}

function StatCard({
  value,
  label,
  icon: Icon,
  gradient = "from-green-50 to-emerald-50",
  iconColor = "text-green-600",
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`bg-gradient-to-br ${gradient} rounded-2xl p-6 border-2 border-green-100 hover:border-green-300 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-xl transform hover:-translate-y-2 relative overflow-hidden`}
    >
      <div className="absolute top-0 right-0 w-20 h-20 bg-white/30 rounded-full -mr-10 -mt-10"></div>
      <div className="relative z-10">
        {Icon && (
          <div
            className={`${iconColor} mb-3 transition-transform duration-300 ${
              isHovered ? "scale-110 rotate-12" : ""
            }`}
          >
            <Icon className="w-8 h-8" />
          </div>
        )}
        <div className="text-3xl font-bold text-green-700 mb-1">
          {value ?? "—"}
        </div>
        <div className="text-sm text-gray-600 font-medium">{label}</div>
      </div>
    </div>
  );
}

/* ================= Pricing Card Component ================= */
function PricingCard() {
  const plans = [
    { duration: "1 Month", price: "300 EGP", popular: false },
    { duration: "6 Months", price: "600 EGP", popular: true },
    { duration: "12 Months", price: "1200 EGP", popular: false },
  ];

  return (
    <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl p-8 shadow-xl text-white relative overflow-hidden group hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
      {/* Animated background elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 group-hover:scale-110 transition-transform duration-700 animate-pulse"></div>
      <div
        className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full -ml-24 -mb-24 group-hover:scale-110 transition-transform duration-700 animate-pulse"
        style={{ animationDelay: "1s" }}
      ></div>
      <div
        className="absolute top-1/2 left-1/2 w-40 h-40 bg-emerald-400/20 rounded-full -ml-20 -mt-20 animate-ping"
        style={{ animationDuration: "3s" }}
      ></div>

      {/* Floating particles */}
      <div
        className="absolute top-10 left-10 w-2 h-2 bg-white/40 rounded-full animate-float"
        style={{ animationDelay: "0s" }}
      ></div>
      <div
        className="absolute top-20 right-20 w-3 h-3 bg-white/30 rounded-full animate-float"
        style={{ animationDelay: "0.5s" }}
      ></div>
      <div
        className="absolute bottom-16 left-16 w-2 h-2 bg-white/40 rounded-full animate-float"
        style={{ animationDelay: "1s" }}
      ></div>

      {/* Shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

      <div className="relative z-10">
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <CreditCard className="w-5 h-5" />
          </div>
          Upgrade to Premium
        </h2>
        <p className="text-white/80 mb-6 text-sm">
          Choose the perfect plan for you
        </p>

        <div className="space-y-3 mb-6">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all duration-300 cursor-pointer transform hover:scale-105 border-2 ${
                plan.popular ? "border-yellow-300" : "border-white/20"
              } relative`}
            >
              {plan.popular && (
                <div className="absolute -top-2 -right-2 bg-yellow-400 text-green-900 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
                  <Star className="w-3 h-3" />
                  POPULAR
                </div>
              )}
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-lg">{plan.duration}</div>
                  <div className="text-white/80 text-sm">Best value</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{plan.price}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => (window.location.href = "/pricing")}
          className="w-full bg-white text-green-600 font-bold py-4 px-6 rounded-xl hover:bg-green-50 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          View All Plans
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

/* ================= Main Component ================= */
function UserInfo() {
  const data = useOutletContext();

  // Generate random positions once on mount
  const [particles] = useState(() =>
    Array.from({ length: 15 }, (_, i) => ({
      key: i,
      delay: i * 0.3,
      duration: 3 + Math.random() * 2,
      left: Math.random() * 100,
      top: Math.random() * 100,
    }))
  );

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-500 border-t-transparent"></div>
      </div>
    );
  }

  const {
    id,
    email,
    first_name,
    last_name,
    is_staff,
    is_subscribed,
    profile,
    community,
    subscription,
  } = data;

  const fullName = `${first_name} ${last_name}`;
  const initials = `${first_name?.[0]}${last_name?.[0]}`.toUpperCase();

  // Capitalize first letter of username
  const capitalizedUsername = profile?.username
    ? profile.username.charAt(0).toUpperCase() + profile.username.slice(1)
    : null;

  const daysRemaining = calculateDaysRemaining(subscription?.ends_at);
  const planInfo = getPlanDuration(subscription?.plan);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 py-12 relative overflow-hidden">
      {/* Floating particles background */}
      {particles.map((particle) => (
        <FloatingParticle
          key={particle.key}
          delay={particle.delay}
          duration={particle.duration}
          left={particle.left}
          top={particle.top}
        />
      ))}

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* ================= Header Card ================= */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8 border-2 border-green-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full -mr-48 -mt-48 opacity-50 group-hover:scale-110 transition-transform duration-700"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-blue-100 to-cyan-100 rounded-full -ml-32 -mb-32 opacity-30 group-hover:scale-110 transition-transform duration-700"></div>

          <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8">
            <div className="relative group/avatar">
              <PulseRing size="large" />
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-600 rounded-full blur-xl opacity-50 group-hover/avatar:opacity-75 transition-opacity duration-500"></div>
              <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white text-4xl shadow-2xl border-4 border-white transform transition-all duration-500 group-hover/avatar:scale-110 group-hover/avatar:rotate-6">
                {profile?.avatar ? (
                  <img
                    src={profile.avatar}
                    alt="avatar"
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <span className="font-bold">{initials}</span>
                )}
              </div>
              {is_subscribed && (
                <div className="absolute -bottom-2 -right-2 bg-yellow-400 rounded-full p-2 shadow-xl border-4 border-white animate-bounce">
                  <Crown className="w-5 h-5 text-white" />
                </div>
              )}
            </div>

            <div className="flex-1 text-center lg:text-left">
              <div className="flex items-center gap-3 justify-center lg:justify-start mb-2">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent animate-gradient capitalize">
                  {fullName}
                </h1>
                {is_staff && (
                  <div className="relative">
                    <Sparkles className="w-6 h-6 text-purple-500 animate-pulse" />
                    <Sparkles className="w-6 h-6 text-purple-300 absolute top-0 left-0 animate-ping" />
                  </div>
                )}
              </div>
              <p className="text-gray-600 mb-4 flex items-center gap-2 justify-center lg:justify-start">
                <Mail className="w-4 h-4 animate-pulse" />
                {email}
              </p>

              <div className="flex gap-3 flex-wrap justify-center lg:justify-start">
                <span
                  className={`px-5 py-2 rounded-full text-sm font-semibold shadow-md transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                    is_staff
                      ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {is_staff ? "⚡ Staff Member" : "👤 Member"}
                </span>
                <span
                  className={`px-5 py-2 rounded-full text-sm font-semibold shadow-md transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                    is_subscribed
                      ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {is_subscribed ? "⭐ Premium" : "Free"}
                </span>
                <span className="px-5 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md transition-all duration-300 hover:scale-105 hover:shadow-xl hover:from-blue-600 hover:to-blue-700">
                  ID: #{id}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ================= Stats Grid ================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            value={community?.total_sales || 0}
            label="Total Sales"
            icon={TrendingUp}
            gradient="from-green-50 to-emerald-50"
          />
          <StatCard
            value={community?.trust_score}
            label="Trust Score"
            icon={Shield}
            gradient="from-blue-50 to-cyan-50"
            iconColor="text-blue-600"
          />
          <StatCard
            value={community?.seller_status || "N/A"}
            label="Seller Status"
            icon={Zap}
            gradient="from-purple-50 to-pink-50"
            iconColor="text-purple-600"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* ================= Profile Details ================= */}
          <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] group overflow-hidden">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center transition-all duration-300">
                <User className="text-green-600 w-5 h-5" />
              </div>
              Profile Information
            </h2>
            <div className="space-y-6">
              <InfoLine
                label="Username"
                value={capitalizedUsername}
                icon={User}
              />
              <InfoLine label="Email Address" value={email} icon={Mail} />
              <InfoLine
                label="Subscription Plan"
                value={community?.subscription_plan}
                icon={CheckCircle2}
              />
              <InfoLine
                label="Member Since"
                value={formatDate(community?.joined_at)}
                icon={Calendar}
              />
            </div>
          </div>

          {/* ================= Subscription OR Pricing ================= */}
          {!is_subscribed && !is_staff ? (
            <PricingCard />
          ) : (
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl p-8 shadow-xl text-white relative overflow-hidden group hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
              {/* Animated background elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 group-hover:scale-110 transition-transform duration-700 animate-pulse"></div>
              <div
                className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full -ml-24 -mb-24 group-hover:scale-110 transition-transform duration-700 animate-pulse"
                style={{ animationDelay: "1s" }}
              ></div>
              <div
                className="absolute top-1/2 left-1/2 w-40 h-40 bg-emerald-400/20 rounded-full -ml-20 -mt-20 animate-ping"
                style={{ animationDuration: "3s" }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-700/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              {/* Floating particles */}
              <div
                className="absolute top-10 left-10 w-2 h-2 bg-white/40 rounded-full animate-float"
                style={{ animationDelay: "0s" }}
              ></div>
              <div
                className="absolute top-20 right-20 w-3 h-3 bg-white/30 rounded-full animate-float"
                style={{ animationDelay: "0.5s" }}
              ></div>
              <div
                className="absolute bottom-16 left-16 w-2 h-2 bg-white/40 rounded-full animate-float"
                style={{ animationDelay: "1s" }}
              ></div>
              <div
                className="absolute bottom-24 right-12 w-3 h-3 bg-white/30 rounded-full animate-float"
                style={{ animationDelay: "1.5s" }}
              ></div>
              <div
                className="absolute top-32 right-32 w-2 h-2 bg-emerald-300/50 rounded-full animate-float"
                style={{ animationDelay: "0.8s" }}
              ></div>

              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

              <div className="relative z-10">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center transition-all duration-300">
                    <Award className="w-5 h-5" />
                  </div>
                  Subscription Status
                </h2>
                <div className="space-y-6 mb-6">
                  <div className="transform hover:scale-105 transition-transform duration-300">
                    <div className="text-sm opacity-80 mb-1">Current Plan</div>
                    <div className="text-3xl font-bold">{planInfo.label}</div>
                  </div>
                  {subscription?.ends_at && (
                    <>
                      <div className="transform hover:scale-105 transition-transform duration-300">
                        <div className="text-sm opacity-80 mb-1">
                          Renewal Date
                        </div>
                        <div className="text-lg font-semibold">
                          {formatDate(subscription.ends_at)}
                        </div>
                      </div>
                      <div className="transform hover:scale-105 transition-transform duration-300">
                        <div className="text-sm opacity-80 mb-1">
                          Days Remaining
                        </div>
                        <div className="text-2xl font-bold flex items-center gap-2">
                          {daysRemaining}
                          <Clock className="w-6 h-6 animate-pulse" />
                        </div>
                      </div>
                    </>
                  )}
                </div>
                {subscription && (
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 flex items-center gap-3 hover:bg-white/30 transition-all duration-300 cursor-pointer transform hover:scale-105">
                    <Shield className="w-6 h-6 animate-pulse" />
                    <span className="font-medium flex-1">
                      Premium Benefits Active
                    </span>
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) translateX(0px);
          }
          50% {
            transform: translateY(-20px) translateX(10px);
          }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        @keyframes gradient {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
}

export default UserInfo;
