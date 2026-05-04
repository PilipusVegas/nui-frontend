import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { routes } from "./routes.config";
import PrivateRoute from "./PrivateRoute";
import { getUserFromToken } from "../utils/jwtHelper";
import RouteLayout from "./../layouts/RouteLayout";

const AppRoutes = () => {
  return (
    <Routes>
      {routes.map(
        ({ path, element, roles, layout = "none", mobileTitle = "" }) => {
          const LayoutWrapper = (
            <RouteLayout layout={layout} mobileTitle={mobileTitle} />
          );

          const PageElement = roles ? (
            <PrivateRoute allowedRoles={roles}>{element}</PrivateRoute>
          ) : (
            element
          );

          return (
            <Route key={path} element={LayoutWrapper}>
              <Route path={path} element={PageElement} />
            </Route>
          );
        },
      )}

      <Route
        path="*"
        element={
          getUserFromToken() ? (
            <Navigate to="/home" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
};

export default AppRoutes;
