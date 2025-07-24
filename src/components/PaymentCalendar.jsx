import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import parseISO from 'date-fns/parseISO';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useEffect, useState } from 'react';
import { getPaymentDates } from '../APIs/ProductAPIs';
import { toast } from 'react-toastify';

// Configure date-fns localizer for react-big-calendar
const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const PaymentCalendar = () => {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    async function getPayments() {
      try {
        const res = await getPaymentDates();
        if (!res || !Array.isArray(res)) {
          setPayments([]);
          return;
        }
        const formattedPayments = res.map(payment => {
          const start = parseISO(payment.start);
          const end = parseISO(payment.end);
          return {
            ...payment,
            start,
            end,
          };
        });
        setPayments(formattedPayments);
      } catch (error) {
        toast.error('Error fetching payments:', error);
        setPayments([]);
      }
    }
    getPayments();
  }, []);

  // Handle event click to show payment details
  const handleSelectEvent = (event) => {
    alert(`${event.title}\n${event.details}`);
  };

  // Style events based on type
  const eventStyleGetter = (event) => {
    let backgroundColor;
    switch (event.type) {
      case 'invoice':
        backgroundColor = '#3b82f6'; // Tailwind blue-500
        break;
      case 'inventory':
        backgroundColor = '#ef4444'; // Tailwind red-500
        break;
      case 'purchase_order':
        backgroundColor = '#22c55e'; // Tailwind green-500
        break;
      default:
        backgroundColor = '#9ca3af'; // Tailwind gray-400
    }
    return {
      style: {
        backgroundColor,
        borderRadius: '5px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block',
        fontSize: '14px', // Added for readability
        padding: '2px 5px', // Added for spacing
      },
    };
  };

  // Custom toolbar component
  // eslint-disable-next-line react/prop-types
  const CustomToolbar = ({ label, onNavigate }) => (
    <div className="flex justify-between items-center p-3 bg-gray-100 border-b border-gray-200">
      <button
        className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        onClick={() => onNavigate('PREV')}
      >
        Previous
      </button>
      <h2 className="text-base font-semibold text-gray-800">{label}</h2>
      <div className="space-x-2">
        <button
          className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          onClick={() => onNavigate('NEXT')}
        >
          Next
        </button>
        <button
          className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          onClick={() => onNavigate('TODAY')}
        >
          Today
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
        Events Calendar
      </h1>

      {/* Calendar */}
      <div className="bg-white rounded-lg shadow-sm">
        <Calendar
          localizer={localizer}
          events={payments}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 500 }} // Kept original inline style
          onSelectEvent={handleSelectEvent}
          views={['month', 'week', 'day']}
          defaultView="month"
          eventPropGetter={eventStyleGetter}
          components={{
            toolbar: CustomToolbar, // Added custom toolbar
          }}
        />
      </div>
    </div>
  );
};

export default PaymentCalendar;