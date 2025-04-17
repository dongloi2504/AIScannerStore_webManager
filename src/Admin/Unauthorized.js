import React from 'react';
import { useNavigate } from 'react-router-dom'; // For navigation
const Unauthorized = () => {
  const navigate = useNavigate();

  // Function to handle the back button click
  const handleGoBack = () => {
    navigate(-1); // Go back to the previous page
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Unauthorized Access</h1>
      <p>You do not have permission to view this page.</p>
      <button onClick={handleGoBack} style={{ marginTop: '20px', padding: '10px 20px' }}>
        Go Back
      </button>
    </div>
  );
};

export default Unauthorized;