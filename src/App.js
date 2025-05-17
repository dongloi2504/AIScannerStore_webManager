import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import AdminLogin from './Authen/AdminLogin';
import StoreManagement from './Admin/StoreManagement';
import 'bootstrap/dist/css/bootstrap.min.css';
import ProductDetail from './Admin/ProductDetail';
import StaffManagement from './Admin/StaffManagement';
import CategoryManagement from './Admin/CategoryManagement';
import ProductManagement from './Admin/ProductManagement';
import OrderManagement from './Admin/OrderManagement';
import CustomerManagement from './Admin/CustomerManagement';
import StoreDetail from './Admin/StoreDetail';
import InventoryHistoryPage from './Admin/InventoryHistoryPage';
import withAuthorization from './HOC/withAuthorization';
import Unauthorized from './Admin/Unauthorized';
import { Role } from './const/Role';
import DeviceManagement from './ITHelpdesk/DeviceManagement';
import LiveOrderManagement from './Staff/LiveOrderManagement';
import Report from './Admin/Report';
import ForgetPassword from './Authen/ForgetPassword';
import OrderDetail from './Admin/OrderDetail';
import CustomerDetail from './Admin/CustomerDetail';
import ChangePassword from './Authen/ChangePassword';
import RequestOrder from './Admin/RequestOrder';
function App() {
	const AuthorizedAdminLogin = withAuthorization(AdminLogin, [Role.ALL]);
	const AuthorizedStoreManagement = withAuthorization(StoreManagement, [Role.ADMIN]);
	const AuthorizedProductManagement = withAuthorization(ProductManagement, [Role.ADMIN, Role.MANAGER, Role.STAFF]);
	const AuthorizedStaffManagement = withAuthorization(StaffManagement, [Role.ADMIN]);
	const AuthorizedCategoryManagement = withAuthorization(CategoryManagement, [Role.ADMIN]);
	const AuthorizedCustomerManagement = withAuthorization(CustomerManagement, [Role.ADMIN]);
	const AuthorizedOrderManagement = withAuthorization(OrderManagement, [Role.ADMIN, Role.MANAGER]);
	const AuthorizedProductDetail = withAuthorization(ProductDetail, [Role.ADMIN, Role.MANAGER]);
	const AuthorizedStoreDetail = withAuthorization(StoreDetail, [Role.ADMIN, Role.MANAGER, Role.STAFF]);
	const AuthorizedInventoryHistoryPage = withAuthorization(InventoryHistoryPage, [Role.ADMIN, Role.MANAGER]);
	const AuthorizedDeviceManagementPage = withAuthorization(DeviceManagement, [Role.HELPDESK]);
	const AuthorizedLiveOrderEditing = withAuthorization(LiveOrderManagement, [Role.ALL]);
	const AuthorizedReport = withAuthorization(Report, Role.ADMIN);
	const AuthorizedChangePassword = withAuthorization(ChangePassword, [Role.ALL]);
	const AuthorizedRequestOrder = withAuthorization(RequestOrder, Role.MANAGER);
	const AuthorizedOrderDetail = withAuthorization(OrderDetail, Role.ADMIN, Role.MANAGER);
	const AuthorizedCustomerDetail = withAuthorization(CustomerDetail, Role.ADMIN);
	return (
		<HashRouter>
			<Routes>
				<Route path="/" element={<AdminLogin />} />
				<Route path="/store-management" element={<AuthorizedStoreManagement />} />
				<Route path="/product-management" element={<AuthorizedProductManagement />} />
				<Route path="/staff-management" element={<AuthorizedStaffManagement />} />
				<Route path="/category-management" element={<AuthorizedCategoryManagement />} />
				<Route path="/order-management" element={<AuthorizedOrderManagement />} />
				<Route path="/customer-management" element={<AuthorizedCustomerManagement />} />
				<Route path="/product-detail/:id" element={<AuthorizedProductDetail />} />
				<Route path="/store-detail/:id" element={<AuthorizedStoreDetail />} />
				<Route path="/inventory-history/:id" element={<AuthorizedInventoryHistoryPage />} />
				<Route path="/report" element={< AuthorizedReport />} />
				<Route path="/device-management" element={<AuthorizedDeviceManagementPage />} />
				<Route path="/live-order" element={<AuthorizedLiveOrderEditing />} />
				<Route path="/unauthorized" element={<Unauthorized />} />
				<Route path="/forget-password" element={<ForgetPassword />} />
				<Route path="/order-detail/:id" element={<OrderDetail />} />
				<Route path="/customer-detail/:id" element={<AuthorizedCustomerDetail />} />
				<Route path="/change-password" element={<ChangePassword />} />
				<Route path="/request-order/:storeId" element={<AuthorizedRequestOrder />} />
			</Routes>
		</HashRouter>
	);
}

export default App;