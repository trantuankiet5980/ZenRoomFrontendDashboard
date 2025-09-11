import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const routes = [
  { path: "/login", element: <Login /> },
  {
    path: "/",
    element: <ProtectedRoute />,
    children: [{ index: true, element: <Dashboard /> }],
  },
  { path: "*", element: <NotFound /> },
];

export default routes;
