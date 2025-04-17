import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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

import Report from './Admin/Report';
function App() {
	const AuthorizedAdminLogin = withAuthorization(AdminLogin, [Role.ALL]);
	const AuthorizedStoreManagement = withAuthorization(StoreManagement, [Role.ADMIN]);
	const AuthorizedProductManagement = withAuthorization(ProductManagement, [Role.ADMIN, Role.MANAGER]);
	const AuthorizedStaffManagement = withAuthorization(StaffManagement, [Role.ADMIN]);
	const AuthorizedCategoryManagement = withAuthorization(CategoryManagement, [Role.ADMIN]);
	const AuthorizedCustomerManagement = withAuthorization(CustomerManagement, [Role.ADMIN]);
	const AuthorizedOrderManagement = withAuthorization(OrderManagement, [Role.ADMIN, Role.MANAGER]);
	const AuthorizedProductDetail = withAuthorization(ProductDetail, [Role.ADMIN, Role.MANAGER]);
	const AuthorizedStoreDetail = withAuthorization(StoreDetail, [Role.ADMIN, Role.MANAGER]);
	const AuthorizedInventoryHistoryPage = withAuthorization(InventoryHistoryPage, [Role.ADMIN, Role.MANAGER]);

	return (
		<BrowserRouter basename="/AIScannerStore_build">
			<Routes>
				<Route path="/" element={<AdminLogin />} />
				<Route path="/store-management" element={<AuthorizedStoreManagement />} />
				<Route path="/product-management" element={<AuthorizedProductManagement />} />
				<Route path="/staff-management" element={<AuthorizedStaffManagement />} />
				<Route path="/category-management" element={<AuthorizedCategoryManagement />} />
				<Route path="/order-management" element={<AuthorizedOrderManagement />} />
				<Route path="/customer-management" element={<AuthorizedCustomerManagement />} />
				<Route path="/product-detail/:id" element={<AuthorizedProductDetail />} />
				<Route path="/store-detail/:storeId" element={<AuthorizedStoreDetail />} />
				<Route path="/inventory-history/:id" element={<AuthorizedInventoryHistoryPage />} />
				<Route path="/report" element={<Report />} />
				<Route path="/unauthorized" element={<Unauthorized />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;