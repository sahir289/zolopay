import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Role } from "@/constants";

const LoginRoute = ({ children }: { children: React.ReactNode }) => {
  const { token } = useAuth();
  const data = localStorage.getItem('userData');
  type RoleType = keyof typeof Role;
  let role: RoleType | null = null;
  if (data) {
    const parsedData = JSON.parse(data);
    role = parsedData.role;
  }
 // Example role data
  if (Role.ADMIN === role || Role.MERCHANT === role) {
    if (token) {
      return <Navigate to="/auth/dashboard/merchant" />;
    } 
  }
  else {
    if (token) {
      return <Navigate to="/auth/dashboard/vendor" />;
    } 
  }

  // If user is already logged in, redirect to dashboard or other page
  // if (token) {
  //   return <Navigate to="/auth/dashboard" />;
  // }
  // Otherwise, render the login page
  return <>{children}</>;
};

export default LoginRoute;
