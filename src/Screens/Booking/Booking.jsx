import React, { useState, useEffect } from 'react';
import Navbar from '../../components/NavBar';
import { useAuth } from '../../authContext';
import { db } from '../../firebaseConfig';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import Loading from '../../components/Loading';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { FaCalendarAlt, FaClock, FaTag, FaUserTie, FaPlay } from 'react-icons/fa';
import { FaMoneyCheckDollar } from 'react-icons/fa6';

const localizer = momentLocalizer(moment);

const Booking = () => {
  const { currentUser } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [actionType, setActionType] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!currentUser) return;

      try {
        const q = query(
          collection(db, 'bookings'),
          where('clientId', '==', currentUser.uid)
        );

        const querySnapshot = await getDocs(q);
        const bookingsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Check for expired bookings and update their status
        const updatedBookings = await Promise.all(
          bookingsData.map(async (booking) => {
            const bookingDate = new Date(booking.date);
            const bookingTime = moment(booking.time, 'HH:mm'); // Parse time in HH:mm format

            const bookingEndTime = new Date(
              bookingDate.getFullYear(),
              bookingDate.getMonth(),
              bookingDate.getDate(),
              bookingTime.hours(),
              bookingTime.minutes()
            );

            const now = new Date();
            if (now > bookingEndTime && booking.status !== 'expired') {
              // Update the booking status to "expired"
              await updateDoc(doc(db, 'bookings', booking.id), {
                status: 'expired',
              });
              return { ...booking, status: 'expired' };
            }
            return booking;
          })
        );

        setBookings(updatedBookings);
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

  const handleActionClick = (booking, action) => {
    setSelectedBooking(booking);
    setActionType(action);
    setIsConfirmModalOpen(true);
  };

  const handleCloseConfirmModal = () => {
    setIsConfirmModalOpen(false);
    setSelectedBooking(null);
    setActionType(null);
  };

  const handleConfirmAction = async () => {
    if (!selectedBooking || !actionType) return;

    const status = actionType === 'Accept' ? 'active' : 'rejected';

    try {
      const bookingRef = doc(db, 'bookings', selectedBooking.id);
      await updateDoc(bookingRef, { status });
      setBookings((prevBookings) =>
        prevBookings.map((booking) =>
          booking.id === selectedBooking.id ? { ...booking, status } : booking
        )
      );
    } catch (error) {
      console.error('Error updating booking status:', error);
    } finally {
      handleCloseConfirmModal();
    }
  };

  const events = bookings
    .filter((booking) => booking.status === 'active')
    .map((booking) => {
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
    return <Loading />;
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar tab={"bookings"} />
      <div className="relative max-w-4xl mx-auto p-6 bg-white shadow rounded-md mt-6">
        <h2 className="text-2xl font-semibold mb-4">Your Bookings</h2>
        
        <button
          onClick={handleOpenModal}
          className="absolute top-4 right-4 px-4 py-2 text-blue-700 rounded-md hover:shadow transition"
        >
          <FaCalendarAlt />
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
                  <FaMoneyCheckDollar className="mr-1" /> Price: <span className="text-green-500">${booking.rate}</span>
                </p>
                <p className="text-sm">Status: {booking.status || 'Pending'}</p>

                {booking.status === 'active' ? (
                  <FaPlay className="text-green-500 text-2xl mt-4" />
                ) : booking.status === 'expired' ? (
                  <p className="text-red-600 font-semibold mt-4">Expired</p>
                ) : (
                  <div className="mt-4 flex space-x-4">
                    <button
                      onClick={() => handleActionClick(booking, 'Accept')}
                      className="px-4 py-2 bg-green-600 text-white rounded-md shadow hover:bg-green-700 transition"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleActionClick(booking, 'Reject')}
                      className="px-4 py-2 bg-red-600 text-white rounded-md shadow hover:bg-red-700 transition"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-700">No bookings found.</p>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="absolute inset-0 bg-black opacity-50" onClick={handleCloseModal}></div>
            <div className="bg-white rounded-lg shadow-lg z-10 relative w-full h-full">
              <h2 className="text-2xl font-semibold mb-4 p-6">Weekly Calendar</h2>
              
              <button
                onClick={handleCloseModal}
                className="absolute top-3 right-3 text-gray-600 hover:text-red-600 transition"
                aria-label="Close modal"
              >
                &times;
              </button>

              <div className="h-[calc(100vh-80px)] w-full overflow-hidden">
                <Calendar
                  localizer={localizer}
                  events={events}
                  startAccessor="start"
                  endAccessor="end"
                  style={{ height: '100%', width: '100%' }}
                  views={['week']}
                  defaultView="week"
                  step={30}
                  timeslots={2}
                />
              </div>
            </div>
          </div>
        )}

        {isConfirmModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="absolute inset-0 bg-black opacity-50" onClick={handleCloseConfirmModal}></div>
            <div className="bg-white rounded-lg shadow-lg z-10 p-6 relative">
              <h2 className="text-xl font-semibold mb-4">
                Are you sure you want to {actionType?.toLowerCase()} this booking?
              </h2>
              <div className="flex space-x-4">
                <button
                  onClick={handleConfirmAction}
                  className={`px-4 py-2 ${
                    actionType === 'Accept'
                      ? 'bg-green-600 text-white'
                      : 'bg-red-600 text-white'
                  } rounded-md shadow`}
                >
                  {actionType}
                </button>
                <button
                  onClick={handleCloseConfirmModal}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md shadow"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Booking;