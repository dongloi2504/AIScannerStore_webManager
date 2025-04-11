import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Role } from "../const/Role.js"
import { useAuth } from '../Authen/AuthContext.js';
import "../Styles/Sidebar.css";

export const CanAccess = ({ roles, children }) => {
  const { user } = useAuth();
  if (!user) return null;

  return roles.includes(user.role) ? children : null;
};
