import { StrictMode } from "react";
import ReactModal from "react-modal";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./components/users/AuthProvider.jsx";

ReactModal.setAppElement("#root");
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>
);
