import { Routes, Route, Navigate } from "react-router-dom";
import { routes } from "./routes.config";
import PrivateRoute from "./PrivateRoute";

const AppRoutes = () => {
    return (
        <Routes>
            {routes.map(({ path, element, roles, layout: Layout }) => {
                const Page = Layout ? <Layout>{element}</Layout> : element;

                return (
                    <Route key={path} path={path} element={
                            roles ? (
                                <PrivateRoute allowedRoles={roles}>
                                    {Page}
                                </PrivateRoute>
                            ) : (
                                Page
                            )
                        }
                    />
                );
            })}

            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
};

export default AppRoutes;
