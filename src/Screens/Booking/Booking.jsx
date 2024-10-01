import React, { useState, useEffect } from 'react';
import Navbar from '../../Components/NavBar';
import { useAuth } from '../../authContext'; // Assuming you have an Auth Context to get currentUser
import { db } from '../../firebaseConfig'; // Firestore configuration
import { collection, query, where, getDocs } from 'firebase/firestore';
import Loading from '../../Components/Loading'; // Assuming you have a loading component

const Booking = () => {
  const { currentUser } = useAuth(); // Get the logged-in user
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!currentUser) return;

      try {
        const q = query(
          collection(db, 'bookings'),
          where('clientId', '==', currentUser.uid) // Match bookings where clientId equals the logged-in user's id
        );

        const querySnapshot = await getDocs(q);
        const bookingsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setBookings(bookingsData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        setLoading(false);
      }
    };

    fetchBookings();
  }, [currentUser]);

  if (loading) {
    return <Loading />; // Show loading component while fetching
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar tab={"bookings"} />
      <div className="max-w-4xl mx-auto p-6 bg-white shadow rounded-md mt-6">
        <h2 className="text-2xl font-semibold mb-4">Your Bookings</h2>

        {bookings.length > 0 ? (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="p-4 bg-gray-200 rounded-md shadow-md">
                <h3 className="text-xl font-semibold mb-2">Booking ID: {booking.id}</h3>
                <p className="text-sm">Service: {booking.selectedProfession}</p>
                <p className="text-sm">Date: {booking.date}</p>
                <p className="text-sm">Time: {booking.time}</p>
                <p className="text-sm">Price: ${booking.rate}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-700">No bookings found.</p>
        )}
      </div>
    </div>
  );
};

export default Booking;