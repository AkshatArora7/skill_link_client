import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./authContext";
import SignIn from "./Screens/Authentication/SignIn";
import SignUp from "./Screens/Authentication/SignUp";
import Dashboard from "./Screens/Dashboard/Dashboard";
import ProtectedRoute from "./ProtectedRoute";
import ErrorPage from "./Components/ErrorPage"
import Booking from "./Screens/Booking/Booking";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          <Route path="/signup" element={<SignUp/>} />
          <Route path="/login" element={<SignIn/>} />


          <Route path="/" element={<ProtectedRoute />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/booking" element={<Booking />} />
          </Route>

          <Route path="*" element={<ErrorPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
