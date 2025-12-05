import { createContext, useContext, useState, useEffect } from "react";

const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  // Initialize with empty arrays to prevent crashes
  const [tenants, setTenants] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [sandboxes, setSandboxes] = useState([]);
  const [pipelines, setPipelines] = useState([]);
  const [deployments, setDeployments] = useState([]);
  const [addOns, setAddOns] = useState([]);
  const [supportTickets, setSupportTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Shared state for "Selected Tenant"
  const [selectedTenant, setSelectedTenant] = useState(null);

  // Helper to safely fetch JSON
  const safeFetch = async (url) => {
    try {
      const res = await fetch(url);
      const contentType = res.headers.get("content-type");
      if (res.ok && contentType && contentType.includes("application/json")) {
        return await res.json();
      }
      return []; 
    } catch (error) {
      console.error(`Error fetching ${url}:`, error);
      return [];
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tenantsData, invoicesData, sandboxesData, pipelinesData, deploymentsData, addOnsData] = await Promise.all([
          safeFetch('/data/tenants.json'),
          safeFetch('/data/invoices.json'),
          safeFetch('/data/sandboxes.json'),
          safeFetch('/data/pipelines.json'),
          safeFetch('/data/deployments.json'),
          safeFetch('/data/addons.json')
        ]);

        setTenants(tenantsData);
        setInvoices(invoicesData);
        setSandboxes(sandboxesData);
        setPipelines(pipelinesData);
        setDeployments(deploymentsData);
        setAddOns(addOnsData);
        setLoading(false);
      } catch (error) {
        console.error("Critical initialization error:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <AdminContext.Provider value={{
      // Data
      tenants, setTenants,
      invoices, setInvoices,
      sandboxes,
      pipelines,
      deployments,
      addOns,
      loading,
      
      // Selection State (FIXED: This was missing previously)
      selectedTenant, 
      setSelectedTenant 
    }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => useContext(AdminContext);
export default AdminContext;