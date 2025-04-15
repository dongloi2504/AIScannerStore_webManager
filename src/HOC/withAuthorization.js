// src/hoc/withAuthorization.js
import { Navigate } from 'react-router-dom';
import { useAuth } from '../Authen/AuthContext';
import { Helmet } from 'react-helmet';

const withAuthorization = (Component, allowedRoles = []) => {
  return function WrappedComponent(props) {
    const { user } = useAuth();

    if (!user) return <Navigate to="/" replace />;
    if (!allowedRoles.includes(user.role)) return <Navigate to="/unauthorized" replace />;

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