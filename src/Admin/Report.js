import React, { useEffect, useState } from "react";
import Sidebar from "../components/SideBar";
import BusinessDashboard from "../components/dashboard/BusinessDashboard";
import { useAuth } from "../Authen/AuthContext";
import "react-datepicker/dist/react-datepicker.css";
import "../Styles/Report.css";
import Select from "react-select";
import { CanAccess } from "../components/CanAccess";
import { Role } from "../const/Role";
import { getStores } from "../ServiceApi/apiAdmin";
const Report = () => {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [stores, setStores] = useState([])
  const [store, setStore] = useState(null)
  const defaultStoreId = 'a1e2f8c4-4c1b-4f2a-bf71-1f3c7a1b1111';
  const fetchStores = async () => {
    try {
      let res = await getStores({
        pageNumber:1,
        pageSize:1000,
        isSuspended: false
      });
      setStores(res.items?.map(x => ({
        label: x.storeName,
        value: x.storeId
      })));
      console.log("DEBUG " + JSON.stringify(store));
      if(!store) {
        setStore(res.items?.filter(x => x.storeId === defaultStoreId)
        ?.map(x => ({
        label: x.storeName,
        value: x.storeId
      }))[0] 
        || stores[0]);
      }
    } catch (err) {
      console.err("Failed to fetch stores", err);
    }
  }
  useEffect(() => {
    if(user?.role === Role.ADMIN)
      fetchStores();
  }, []);
  return (
    <div className={`page-container ${isSidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
      <Sidebar onToggle={setIsSidebarOpen} />
      <div className="content">
        <CanAccess roles={Role.ADMIN}>
        <Select 
          placeholder="Choose store..."
          options={stores}
          value={store}
          onChange={(o) => {
            setStore(o);
          }}
        />
        </CanAccess>
        <BusinessDashboard storeId={store?.value ?? user?.storeId ?? defaultStoreId} />
      </div>
    </div>
  );
};

export default Report;
