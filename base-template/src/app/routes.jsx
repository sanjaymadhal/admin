import { lazy } from "react";
import { Navigate } from "react-router-dom";
import ParcLayout from "./components/ParcLayout/ParcLayout";
import { AdminProvider } from "./contexts/AdminContext";

// Lazy load views
const DefaultDashboard = lazy(() => import("./views/dashboard/DefaultDashboard"));
const Tenants = lazy(() => import("./views/tenants/Tenants"));
const Billing = lazy(() => import("./views/billing/Billing"));
const Sandboxes = lazy(() => import("./views/sandboxes/Sandboxes"));
const Pipelines = lazy(() => import("./views/pipelines/Pipelines"));
const Marketplace = lazy(() => import("./views/marketplace/Marketplace"));
const Compliance = lazy(() => import("./views/compliance/Compliance"));
const ClientHealth = lazy(() => import("./views/client-health/ClientHealth"));
const Deployments = lazy(() => import("./views/deployments/Deployments"));
const AuditLogs = lazy(() => import("./views/audit-logs/AuditLogs")); // Added

const AdminWrapper = ({ children }) => (
  <AdminProvider>{children}</AdminProvider>
);

const routes = [
  { path: "/", element: <Navigate to="admin/dashboard" /> },
  {
    element: <ParcLayout />,
    children: [
      { path: "/admin/dashboard", element: <AdminWrapper><DefaultDashboard /></AdminWrapper> },
      { path: "/dashboard/default", element: <AdminWrapper><DefaultDashboard /></AdminWrapper> },
      { path: "/admin/tenants", element: <AdminWrapper><Tenants /></AdminWrapper> },
      { path: "/admin/client-health", element: <AdminWrapper><ClientHealth /></AdminWrapper> },
      { path: "/admin/compliance", element: <AdminWrapper><Compliance /></AdminWrapper> },
      { path: "/admin/billing", element: <AdminWrapper><Billing /></AdminWrapper> },
      { path: "/admin/sandboxes", element: <AdminWrapper><Sandboxes /></AdminWrapper> },
      { path: "/admin/pipelines", element: <AdminWrapper><Pipelines /></AdminWrapper> },
      { path: "/admin/deployments", element: <AdminWrapper><Deployments /></AdminWrapper> },
      { path: "/admin/marketplace", element: <AdminWrapper><Marketplace /></AdminWrapper> },
      { path: "/admin/audit-logs", element: <AdminWrapper><AuditLogs /></AdminWrapper> } // Added
    ]
  }
];

export default routes;