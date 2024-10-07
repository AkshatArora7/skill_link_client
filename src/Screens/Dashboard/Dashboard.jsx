import React from 'react';
import { auth } from '../../firebaseConfig'; 
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/NavBar';

const Dashboard = () => {

  return (
    <div>
      <Navbar tab={'home'} />
      
      <div className="p-6">
        <h1 className="text-3xl font-semibold">Dashboard</h1>
        
      </div>
    </div>
  );
};

export default Dashboard;