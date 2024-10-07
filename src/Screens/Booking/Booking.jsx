import React, { useState, useEffect } from 'react';
import Navbar from '../../components/NavBar';
import { useAuth } from '../../authContext';
import { db } from '../../firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import Loading from '../../components/Loading';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { FaCalendarAlt, FaClock, FaTag, FaUserTie, } from 'react-icons/fa'; // Import icons
import { FaMoneyCheckDollar } from 'react-icons/fa6';

// Configure the localizer by providing the moment Object to the correct localizer.
const localizer = momentLocalizer(moment);

const Booking = () => {
  const { currentUser } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility

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

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Prepare events for the calendar
  const events = bookings.map((booking) => {
    const start = new Date(booking.date);
    const end = new Date(start.getTime() + 60 * 60 * 1000);

    return {
      id: booking.id,
      title: booking.selectedProfession,
      start,
      end,
    };
  });

  if (loading) {
    return <Loading />; // Show loading component while fetching
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar tab={"bookings"} />
      <div className="relative max-w-4xl mx-auto p-6 bg-white shadow rounded-md mt-6">
        <h2 className="text-2xl font-semibold mb-4">Your Bookings</h2>
        
        {/* Calendar Button */}
        <button
          onClick={handleOpenModal}
          className="absolute top-4 right-4 px-4 py-2 text-blue-700 rounded-md hover:shadow transition"
        >
          <FaCalendarAlt/>
        </button>

        {bookings.length > 0 ? (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="p-4 bg-gray-200 rounded-md shadow-md hover:shadow-lg transition-shadow duration-200">
                <h3 className="text-xl font-semibold mb-2 flex items-center">
                  <FaTag className="mr-2" /> Booking ID: {booking.id}
                </h3>
                <p className="text-sm flex items-center">
                  <FaUserTie className="mr-1" /> Service: {booking.selectedProfession}
                </p>
                <p className="text-sm flex items-center">
                  <FaCalendarAlt className="mr-1" /> Date: {booking.date}
                </p>
                <p className="text-sm flex items-center">
                  <FaClock className="mr-1" /> Time: {booking.time}
                </p>
                <p className="text-sm font-bold flex items-center">
                  <FaMoneyCheckDollar className="mr-1" /> Price: <span className="text-green-500">${booking.rate}</span></p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-700">No bookings found.</p>
        )}

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="absolute inset-0 bg-black opacity-50" onClick={handleCloseModal}></div>
            <div className="bg-white rounded-lg shadow-lg z-10 relative w-full h-full">
              <h2 className="text-2xl font-semibold mb-4 p-6">Weekly Calendar</h2>
              
              {/* Cross button for closing the modal */}
              <button
                onClick={handleCloseModal}
                className="absolute top-3 right-3 text-gray-600 hover:text-red-600 transition"
                aria-label="Close modal"
              >
                &times; {/* Cross icon */}
              </button>

              {/* Full-screen Calendar Component */}
              <div className="h-[calc(100vh-80px)] w-full overflow-hidden">
                <Calendar
                  localizer={localizer}
                  events={events}
                  startAccessor="start"
                  endAccessor="end"
                  style={{ height: '100%', width: '100%' }} // Ensure the calendar takes the full width and height of its container
                  views={['week']} // Set the calendar to weekly view
                  defaultView="week" // Set the default view to week
                  step={30} // Set step to 30 minutes
                  timeslots={2} // Show two time slots per hour (30-minute intervals)
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Booking;