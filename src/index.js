import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider } from './Authen/AuthContext';
import { Helmet } from 'react-helmet';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
	<AuthProvider value={null}>
	  <Helmet>
        <title>AIScannerStore</title>
      </Helmet>
	  <App />
	</AuthProvider>
  </React.StrictMode>
  
);

