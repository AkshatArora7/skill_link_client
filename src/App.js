import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./authContext";
import SignIn from "./screens/Authentication/SignIn";
import SignUp from "./screens/Authentication/SignUp";
import Dashboard from "./screens/Dashboard/Dashboard";
import ProtectedRoute from "./ProtectedRoute";
import ErrorPage from "./components/ErrorPage"
import Ledger from "./screens/Ledger/Ledger";
import Booking from "./screens/Booking/Booking";
import Profile from "./screens/Profile/Profile";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          <Route path="/signup" element={<SignUp/>} />
          <Route path="/login" element={<SignIn/>} />


          <Route path="/" element={<ProtectedRoute />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/bookings" element={<Booking />} />
            <Route path="/ledger" element={<Ledger />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          <Route path="*" element={<ErrorPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
