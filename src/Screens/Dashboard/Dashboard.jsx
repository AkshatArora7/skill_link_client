import React, { useEffect, useState } from 'react';
import { auth } from '../../firebaseConfig';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/NavBar';
import { db } from '../../firebaseConfig'; 
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

const Dashboard = () => {
  const [recentBookings, setRecentBookings] = useState([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [activeRoles, setActiveRoles] = useState([]);
  const [customerSupport, setCustomerSupport] = useState("Support is available 24/7. Contact us at support@example.com");

  useEffect(() => {
    const fetchDashboardData = async () => {
      const bookingsQuery = query(
        collection(db, 'bookings'),
        where('clientId', '==', auth.currentUser.uid),
        orderBy('date', 'desc')
      );

      const querySnapshot = await getDocs(bookingsQuery);
      const recentBookingsData = querySnapshot.docs.map(doc => doc.data()).slice(0, 2);
      setRecentBookings(recentBookingsData);

      // Calculate total earnings
      const earningsQuery = query(
        collection(db, 'bookings'),
        where('clientId', '==', auth.currentUser.uid),
        where('status', '==', 'completed')
      );

      const earningsSnapshot = await getDocs(earningsQuery);
      const earningsData = earningsSnapshot.docs.map(doc => doc.data());
      const total = earningsData.reduce((acc, booking) => acc + booking.rate, 0);
      setTotalEarnings(total);

      // Fetch active roles (Assuming you store roles under user data)
      const rolesQuery = query(collection(db, 'users'), where('uid', '==', auth.currentUser.uid));
      const rolesSnapshot = await getDocs(rolesQuery);
      const rolesData = rolesSnapshot.docs.map(doc => doc.data().roles);
      setActiveRoles(rolesData);
    };

    fetchDashboardData();
  }, []);

  return (
    <div>
      <Navbar tab={'home'} />

      <div className="p-6">
        <h1 className="text-3xl font-semibold mb-6">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recent Bookings */}
          <div className="bg-white p-4 rounded-lg shadow-md flex flex-col">
            <h3 className="text-xl font-semibold mb-4">Recent Bookings</h3>
            <ul>
              {recentBookings.map((booking, index) => (
                <li key={index} className="mb-2">
                  <p className="font-semibold">Service: {booking.selectedProfession}</p>
                  <p>Date: {booking.date}</p>
                  <p>Status: {booking.status}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* Total Money Earned */}
          <div className="bg-white p-4 rounded-lg shadow-md flex flex-col">
            <h3 className="text-xl font-semibold mb-4">Total Money Earned</h3>
            <p className="text-2xl font-bold">${totalEarnings}</p>
          </div>

          {/* Active Roles */}
          <div className="bg-white p-4 rounded-lg shadow-md flex flex-col">
            <h3 className="text-xl font-semibold mb-4">Active Roles</h3>
            <ul>
              {activeRoles.length > 0 ? (
                activeRoles.map((role, index) => (
                  <li key={index} className="mb-2">
                    {role}
                  </li>
                ))
              ) : (
                <p>No active roles.</p>
              )}
            </ul>
          </div>

          {/* Customer Support */}
          <div className="bg-white p-4 rounded-lg shadow-md flex flex-col">
            <h3 className="text-xl font-semibold mb-4">Customer Support</h3>
            <p>{customerSupport}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;