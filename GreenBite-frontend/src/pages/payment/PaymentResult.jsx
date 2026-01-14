import { useEffect, useContext, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { AuthContext } from "@/context/AuthContext";
import * as authService from "@/services/authService";
import {
  CheckCircle,
  Clock,
  XCircle,
  CreditCard,
  Calendar,
  Hash,
  DollarSign,
} from "lucide-react";

const getPaymobInfo = (searchParams) => {
  return {
    transactionId: searchParams.get("id"),
    orderId: searchParams.get("order"),
    amountCents: searchParams.get("amount_cents"),
    currency: searchParams.get("currency"),
    success: searchParams.get("success"),
    message: searchParams.get("data.message"),
    cardType: searchParams.get("source_data.sub_type"),
    cardLast4: searchParams.get("source_data.pan"),
    createdAt: searchParams.get("created_at"),
  };
};

const PaymentDetails = ({ info }) => {
  if (!info.transactionId) return null;

  return (
    <div className="mt-8 bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-2xl p-6 text-left shadow-lg">
      <h3 className="text-xl font-bold mb-5 text-emerald-900 flex items-center gap-2">
        <CreditCard className="w-5 h-5" />
        Payment Details
      </h3>

      <div className="space-y-4">
        <div className="flex items-start gap-3 pb-3 border-b border-emerald-200">
          <Hash className="w-5 h-5 text-emerald-600 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs text-emerald-700 font-semibold mb-1">
              Transaction ID
            </p>
            <p className="text-sm text-gray-900 font-mono">
              {info.transactionId}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 pb-3 border-b border-emerald-200">
          <Hash className="w-5 h-5 text-emerald-600 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs text-emerald-700 font-semibold mb-1">
              Order ID
            </p>
            <p className="text-sm text-gray-900 font-mono">{info.orderId}</p>
          </div>
        </div>

        <div className="flex items-start gap-3 pb-3 border-b border-emerald-200">
          <DollarSign className="w-5 h-5 text-emerald-600 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs text-emerald-700 font-semibold mb-1">
              Amount
            </p>
            <p className="text-sm text-gray-900 font-semibold">
              {info.amountCents ? info.amountCents / 100 : "-"} {info.currency}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 pb-3 border-b border-emerald-200">
          <CreditCard className="w-5 h-5 text-emerald-600 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs text-emerald-700 font-semibold mb-1">
              Payment Method
            </p>
            <p className="text-sm text-gray-900">
              {info.cardType ? `${info.cardType} •••• ${info.cardLast4}` : "-"}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 pb-3 border-b border-emerald-200">
          <Calendar className="w-5 h-5 text-emerald-600 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs text-emerald-700 font-semibold mb-1">Date</p>
            <p className="text-sm text-gray-900">
              {info.createdAt
                ? info.createdAt.replace("T", " ").split(".")[0]
                : "-"}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs text-emerald-700 font-semibold mb-1">
              Status
            </p>
            <p className="text-sm text-gray-900">{info.message || "-"}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const PaymentResult = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser, loading } = useContext(AuthContext);

  const [status, setStatus] = useState("loading");

  // Paymob params
  const paymobInfo = getPaymobInfo(searchParams);
  const paymobSuccess = paymobInfo.success;

  useEffect(() => {
    const syncUser = async () => {
      try {
        const updatedUser = await authService.getCurrentUser();
        setUser(updatedUser);

        if (updatedUser.is_subscribed) {
          setStatus("success");

          setTimeout(() => {
            navigate("/home");
          }, 10000);

          return;
        }

        if (paymobSuccess === "true") {
          setStatus("pending");
          return;
        } else if (paymobSuccess === "false") {
          setStatus("failure");
          return;
        }

        setStatus("failure");
      } catch (error) {
        console.error("Failed to sync user", error);
        setStatus("failure");
      }
    };

    syncUser();
  }, [navigate, paymobSuccess, setUser]);

  useEffect(() => {
    if (status === "loading") return;

    const timer = setTimeout(() => {
      navigate("/home");
    }, 10000);

    return () => clearTimeout(timer);
  }, [status, navigate]);

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-emerald-200 border-t-emerald-600 mb-4"></div>
          <p className="text-lg text-emerald-800">Checking payment status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full py-12">
        {status === "success" && (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full mb-6 shadow-2xl animate-bounce">
              <CheckCircle className="w-14 h-14 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-4">
              Payment Successful!
            </h1>
            <p className="text-xl text-gray-700 mb-2">
              Your subscription is now active.
            </p>
            <p className="text-sm text-emerald-600">
              Redirecting you to home...
            </p>

            <PaymentDetails info={paymobInfo} />
          </div>
        )}

        {status === "pending" && (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full mb-6 shadow-2xl">
              <Clock className="w-14 h-14 text-white animate-pulse" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent mb-4">
              Payment Processing
            </h1>
            <p className="text-xl text-gray-700 mb-2">
              We received your payment and are activating your subscription.
            </p>
            <p className="text-sm text-amber-600">
              This may take a few seconds.
            </p>

            <PaymentDetails info={paymobInfo} />
          </div>
        )}

        {status === "failure" && (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-red-500 to-rose-600 rounded-full mb-6 shadow-2xl">
              <XCircle className="w-14 h-14 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent mb-4">
              Payment Failed
            </h1>
            <p className="text-xl text-gray-700 mb-2">
              {paymobInfo.message || "Payment could not be completed."}
            </p>

            <PaymentDetails info={paymobInfo} />

            <button
              onClick={() => navigate("/pricing")}
              className="mt-8 px-8 py-4 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentResult;
