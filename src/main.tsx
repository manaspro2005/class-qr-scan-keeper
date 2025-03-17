
import React from "react";
import ReactDOM from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import App from "./App";
import "./index.css";

const PUBLISHABLE_KEY = "pk_test_aW1tZW5zZS1tYWdnb3QtOTIuY2xlcmsuYWNjb3VudHMuZGV2JA";
if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key");
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      clerkJSVersion="5.56.0-snapshot.v20250312225817"
      signInUrl="/student-login"
      signUpUrl="/student-register"
      signInFallbackRedirectUrl="/student-dashboard"
      signUpFallbackRedirectUrl="/student-dashboard"
      afterSignOutUrl="/"
    >
      <App />
    </ClerkProvider>
  </React.StrictMode>
);
