import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./layouts/AdminLayout";

import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Properties from "./pages/Properties";
import Bookings from "./pages/Bookings";
import Contracts from "./pages/Contracts";
import Payments from "./pages/Payments";
import Invoices from "./pages/Invoices";
import DiscountCodes from "./pages/DiscountCodes";
import Reviews from "./pages/Reviews";
import Reports from "./pages/Reports";
import Moderations from "./pages/Moderations";

import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import NotFound from "./pages/NotFound";

const routes = [
  { path: "/login", element: <Login /> },
  { path: "/forgot-password", element: <ForgotPassword /> },

  {
    path: "/",
    element: <ProtectedRoute />, 
    children: [
      {
        element: <AdminLayout />, 
        children: [
          { index: true, element: <Dashboard /> },
          { path: "users", element: <Users /> },
          { path: "properties", element: <Properties /> },
          { path: "bookings", element: <Bookings /> },
          { path: "contracts", element: <Contracts /> },
          { path: "payments", element: <Payments /> },
          { path: "invoices", element: <Invoices /> },
          { path: "discount-codes", element: <DiscountCodes /> },
          { path: "reviews", element: <Reviews /> },
          { path: "reports", element: <Reports /> },
          { path: "moderations", element: <Moderations /> },
        ],
      },
    ],
  },

  { path: "*", element: <NotFound /> },
];

export default routes;
