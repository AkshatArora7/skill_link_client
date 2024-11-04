import React, { useState, useEffect } from "react";
import Navbar from "../../components/NavBar";
import { Bar } from "react-chartjs-2";
import { useAuth } from "../../authContext";
import { db } from "../../firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import moment from "moment";
import "chart.js/auto";

const Ledger = () => {
  const { currentUser } = useAuth();
  const [weeklyData, setWeeklyData] = useState({ dates: [], prices: [] });
  const [weekOffset, setWeekOffset] = useState(0);

  useEffect(() => {
    const fetchCompletedBookings = async () => {
      if (!currentUser) return;

      try {
        const startOfWeek = moment().startOf("week").add(weekOffset, "weeks");
        const endOfWeek = moment().endOf("week").add(weekOffset, "weeks");

        // Generate all dates of the week
        const weekDates = Array.from({ length: 7 }, (_, i) =>
          startOfWeek.clone().add(i, "days").format("YYYY-MM-DD")
        );

        // Initialize prices for each day of the week
        const dayPriceMap = weekDates.reduce((acc, date) => {
          acc[date] = 0;
          return acc;
        }, {});

        const q = query(
          collection(db, "bookings"),
          where("clientId", "==", currentUser.uid),
          where("status", "==", "completed"),
          where("date", ">=", startOfWeek.toDate()),
          where("date", "<=", endOfWeek.toDate())
        );

        const querySnapshot = await getDocs(q);
        const bookingsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Sum up prices for each date
        bookingsData.forEach((booking) => {
          const bookingDate = moment(booking.date.toDate()).format("YYYY-MM-DD");
          if (dayPriceMap[bookingDate] !== undefined) {
            dayPriceMap[bookingDate] += booking.rate;
          }
        });

        const dates = Object.keys(dayPriceMap);
        const prices = Object.values(dayPriceMap).map((price) => Math.min(price, 100)); // Cap price to 100

        setWeeklyData({ dates, prices });
      } catch (error) {
        console.error("Error fetching completed bookings:", error);
      }
    };

    fetchCompletedBookings();
  }, [currentUser, weekOffset]);

  const handlePreviousWeek = () => {
    setWeekOffset((prevOffset) => prevOffset - 1);
  };

  const handleNextWeek = () => {
    setWeekOffset((prevOffset) => prevOffset + 1);
  };

  const chartData = {
    labels: weeklyData.dates.map(date => moment(date).format("ddd, MMM D")), // Format dates as 'Sun, Jan 1'
    datasets: [
      {
        label: "Booking Prices (Completed)",
        data: weeklyData.prices,
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "top",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100, // Cap the y-axis at $100
        title: {
          display: true,
          text: "Price ($)",
        },
      },
      x: {
        title: {
          display: true,
          text: "Date",
        },
        ticks: {
          autoSkip: false, // Ensures all dates are displayed on the x-axis
        },
      },
    },
  };

  return (
    <div>
      <Navbar tab={"ledger"} />
      <div className="max-w-4xl mx-auto p-6 bg-white shadow rounded-md mt-6">
        <h2 className="text-2xl font-semibold mb-4">Weekly Ledger</h2>
        
        {/* Buttons to navigate between weeks */}
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={handlePreviousWeek}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Previous Week
          </button>
          <span className="font-medium text-gray-700">
            {moment().startOf("week").add(weekOffset, "weeks").format("MMM DD")} - {moment().endOf("week").add(weekOffset, "weeks").format("MMM DD")}
          </span>
          <button
            onClick={handleNextWeek}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            disabled={weekOffset >= 0}
          >
            Next Week
          </button>
        </div>

        <Bar data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default Ledger;