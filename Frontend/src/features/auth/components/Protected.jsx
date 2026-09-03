import { Navigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import React from "react";
import Loading from "../../../components/Loading/Loading";

const Protected = ({ children }) => {
  const { loading, user } = useAuth();

  if (loading) {
    return <Loading message="Loading..." />;
  }

  if (!user) {
    return <Navigate to={"/login"} />;
  }

  return children;
};

export default Protected;
