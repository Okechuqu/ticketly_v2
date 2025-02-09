import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AgentAdminRegisterForm from "./components/forms/AgentAdminRegisterForm";
import ClientRegisterForm from "./components/forms/ClientRegisterForm";
import UserProfile from "./components/users/UserProfile";
import TicketForm from "./components/forms/TicketForm";
import Tickets from "./components/tickets/Tickets";
import Login from "./components/forms/LoginForm";
import reactLogo from "/react.svg";
import VerifyEmailPage from "./components/users/VerifyEmailPage";

function App() {
  // Retrieve userId from localStorage
  const userId = localStorage.getItem("userId");

  return (
    <>
      <div className="min-h-screen py-16 items-center justify-center bg-gray-300">
        <BrowserRouter>
          <Routes>
            <Route path="*" element={<Navigate to="/" />} />

            <Route path="/verify-email/:token" element={<VerifyEmailPage />} />

            <Route
              path="/"
              element={
                userId ? <Tickets userId={userId} /> : <Navigate to="/login" />
              }
            />

            <Route
              path="/:id"
              element={
                userId ? <Tickets userId={userId} /> : <Navigate to="/login" />
              }
            />

            <Route path="/register" element={<ClientRegisterForm />} />

            <Route path="/login" element={<Login />} />

            <Route path="/aareg" element={<AgentAdminRegisterForm />} />

            <Route
              path="/profile/:id?"
              element={
                userId ? (
                  <UserProfile userId={userId} />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />

            <Route
              path="/"
              element={userId ? <TicketForm /> : <Navigate to="/login" />}
            />
          </Routes>
        </BrowserRouter>
      </div>
    </>
  );
}

export default App;
