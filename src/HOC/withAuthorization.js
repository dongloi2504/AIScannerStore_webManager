// src/hoc/withAuthorization.js
import { Navigate } from 'react-router-dom';
import { useAuth } from '../Authen/AuthContext';
import { Helmet } from 'react-helmet';
import { Role } from '../const/Role';

const withAuthorization = (Component, allowedRoles = []) => {
  return function WrappedComponent(props) {
    const { user, loading } = useAuth();
	if (loading === undefined || loading) return <div>Loading...</div>
    if (!user) return <Navigate to="/" replace />;
    if (!allowedRoles.includes(user.role) && !allowedRoles.includes(Role.ALL)) return <Navigate to="/unauthorized" replace />;

    return (<>
		<Helmet>
			<title>AIScannerStore | Management</title>
		</Helmet>
		<Component {...props} />
		</>
	);
  };
};

export default withAuthorization;