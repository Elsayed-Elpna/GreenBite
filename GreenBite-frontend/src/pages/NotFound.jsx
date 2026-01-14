import React from "react";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-green-600">404</h1>

        <h2 className="mt-8 text-3xl font-semibold text-gray-900">
          Page Not Found
        </h2>

        <p className="mt-4 text-gray-600">
          Sorry, we couldn't find the page you're looking for.
        </p>

        <div className="mt-8">
          <button
            onClick={() => (window.location.href = "/")}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
