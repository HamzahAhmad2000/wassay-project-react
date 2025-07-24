import { useState, useCallback, useEffect } from "react";
import { toast } from "react-toastify";
import PropTypes from "prop-types";
import { getEventDates } from "../APIs/ProductAPIs";

const DateEventsDisplay = ({ date, className = "" }) => {
  const [dateEvents, setDateEvents] = useState({
    purchase_orders_delivery: 0,
    supplier_invoices_due: 0,
    supplier_invoices_issued: 0,
    supplier_payments_date: 0,
    goods_received_notes_generated: 0,
    goods_received_notes_bills: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  const formatEventKey = (key) => {
    return key
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase())
      .replace("Grn", "GRN")
      .replace("Bills", "Bill")
      .replace("Generated", "GRN");
  };

  const handleFetchEvents = useCallback(
    async (selectedDate) => {
      if (!selectedDate) {
        setDateEvents({
          purchase_orders_delivery: 0,
          supplier_invoices_due: 0,
          supplier_invoices_issued: 0,
          supplier_payments_date: 0,
          goods_received_notes_generated: 0,
          goods_received_notes_bills: 0,
        });
        return;
      }

      setIsLoading(true);
      try {
        const response = await getEventDates(selectedDate);
        if (response.status === "success") {
            console.log("Fetched events for date:", selectedDate, response.data);
          const events = response.data || {};
          setDateEvents({
            purchase_orders_delivery: events.purchase_orders || 0,
            supplier_invoices_due: events.supplier_invoices || 0,
            supplier_invoices_issued: events.supplier_invoices_issued || 0,
            supplier_payments_date: events.supplier_payments || 0,
            goods_received_notes_generated: events.goods_received_notes_grn || 0,
            goods_received_notes_bills: events.goods_received_notes_bills || 0,
          });
          if (events.purchase_orders > 0) {
            toast.info(`${events.purchase_orders} purchase order(s) delivery scheduled on ${selectedDate}.`);
          }
          if (events.supplier_invoices > 0) {
            toast.info(`${events.supplier_invoices} supplier invoice(s) due on ${selectedDate}.`);
          }
          if (events.supplier_invoices_issued > 0) {
            toast.info(`${events.supplier_invoices_issued} supplier invoices(s) issued on ${selectedDate}.`);
          }
          if (events.goods_received_notes_grn > 0) {
            toast.info(`${events.goods_received_notes_grn} GRN(s) receiving on ${selectedDate}.`);
          }
          if (events.goods_received_notes_bill > 0) {
            toast.info(`${events.goods_received_notes_bill} GRN bill(s) scheduled on ${selectedDate}.`);
          }
          if (events.supplier_payments > 0) {
            toast.info(`${events.supplier_payments} supplier payment(s) scheduled on ${selectedDate}.`);
          }
        } else {
          throw new Error(response.error || "Failed to fetch events.");
        }
      } catch (error) {
        console.error("Error fetching date events:", error);
        toast.error(error.message || "Failed to fetch events for this date.");
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Trigger fetch when date prop changes
  useEffect(() => {
    handleFetchEvents(date);
  }, [date, handleFetchEvents]);

  return (
    <div className={`mt-2 space-y-1 ${className}`} aria-live="polite">
      {isLoading ? (
        <div className="text-sm text-gray-500">Loading events...</div>
      ) : (
        dateEvents &&
        Object.keys(dateEvents)
          .filter((key) => dateEvents[key] > 0) // Show only non-zero counts
          .map((key) => (
            <div key={key} className="text-sm text-gray-600">
              {formatEventKey(key)}: {dateEvents[key]} event(s)
            </div>
          ))
      )}
    </div>
  );
};

DateEventsDisplay.propTypes = {
  date: PropTypes.string.isRequired,
  className: PropTypes.string,
};

export default DateEventsDisplay;