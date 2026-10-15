import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { CreditCard, Lock, CheckCircle, ArrowLeft, MapPin, Calendar, Clock } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api'
import SeatLayout from '../../components/seats/SeatLayout'
import { formatDate, formatTime, formatFare } from '../../utils/formatters'

function PaymentModal({ open, fare, onPay, onClose, loading }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden">

        <div className="p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white">
            Secure Payment
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Complete your ride payment securely with Razorpay.
          </p>
        </div>

        <div className="p-6">

          <div className="flex justify-between items-center p-4 rounded-xl bg-slate-800 mb-6">
            <span className="text-slate-300">
              Amount to pay
            </span>

            <span className="text-2xl font-bold text-white">
              {formatFare(fare)}
            </span>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <Lock className="w-5 h-5 text-green-400" />

            <div>
              <p className="text-sm font-semibold text-white">
                Secure Razorpay Payment
              </p>

              <p className="text-xs text-slate-400">
                UPI, Cards & Net Banking supported
              </p>
            </div>
          </div>

          <div className="flex gap-3">

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 rounded-xl border border-slate-600 px-4 py-3 text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={onPay}
              disabled={loading}
              className="flex-1 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Processing..." : "Pay Now"}
            </button>

          </div>

        </div>
      </div>
    </div>
  );
}

export default function SeatSelection() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [ride, setRide] = useState(null)
  const [seats, setSeats] = useState({ totalSeats: 4, bookedSeats: [], vehicleType: 'sedan' })
  const [selectedSeat, setSelectedSeat] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showPayment, setShowPayment] = useState(false)
  const [bookingId, setBookingId] = useState(null)
  const [paying, setPaying] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rideRes, seatRes] = await Promise.all([
          api.get(`/rides/${id}`),
          api.get(`/rides/${id}/seats`),
        ])
        setRide(rideRes.data.data.ride)
        setSeats(seatRes.data.data)
      } catch {
        toast.error('Failed to load ride details')
        navigate('/search')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id, navigate])

  const handleProceed = async () => {
    if (!selectedSeat) { toast.error('Please select a seat first'); return }
    try {
      const res = await api.post('/bookings', { rideId: id, seatIndex: selectedSeat })
      setBookingId(res.data.data.booking._id)
      setShowPayment(true)
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to reserve seat')
    }
  }
const handlePay = async () => {
  setPaying(true);

  try {
    // 1. Load Razorpay Checkout if it is not already loaded
    if (!window.Razorpay) {
      await new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = resolve;
        script.onerror = () =>
          reject(new Error("Failed to load Razorpay Checkout"));
        document.body.appendChild(script);
      });
    }

    // 2. Ask our Render backend to create a Razorpay order
    // IMPORTANT: send bookingId, NOT the amount.
    const response = await api.post("/payments/create-order", {
      bookingId,
    });

    const paymentData = response.data.data;

    if (!paymentData?.orderId) {
      throw new Error("Unable to create payment order");
    }

    // 3. Open Razorpay Checkout
    const options = {
      key: paymentData.keyId,
      amount: paymentData.amount,
      currency: paymentData.currency,
      name: "Ride Back",
      description: "Ride booking payment",
      order_id: paymentData.orderId,

      handler: async function (razorpayResponse) {
        try {
          // 4. Verify payment on our Render backend
          const verifyResponse = await api.post(
            "/payments/verify",
            {
              razorpay_order_id:
                razorpayResponse.razorpay_order_id,

              razorpay_payment_id:
                razorpayResponse.razorpay_payment_id,

              razorpay_signature:
                razorpayResponse.razorpay_signature,
            }
          );

          if (verifyResponse.data.success) {
            toast.success("Payment successful! 🎉");

            navigate(`/booking-success/${bookingId}`);
          } else {
            toast.error("Payment verification failed");
          }
        } catch (error) {
          console.error("Payment verification error:", error);

          toast.error(
            error.response?.data?.message ||
              "Payment verification failed"
          );
        } finally {
          setPaying(false);
          setShowPayment(false);
        }
      },

      modal: {
        ondismiss: function () {
          setPaying(false);
          toast("Payment cancelled");
        },
      },

      theme: {
        color: "#2563eb",
      },
    };

    const razorpay = new window.Razorpay(options);

    razorpay.on("payment.failed", function (response) {
      console.error("Razorpay payment failed:", response.error);

      toast.error(
        response.error?.description ||
          "Payment failed. Please try again."
      );

      setPaying(false);
    });

    razorpay.open();

  } catch (error) {
    console.error("Payment error:", error);

    toast.error(
      error.response?.data?.message ||
        error.message ||
        "Unable to start payment"
    );

    setPaying(false);
  }
};
  


  if (loading) {
    return (
      <div className="min-h-screen pt-28 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading seat map...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-28 pb-20 px-4">
      <div className="max-w-3xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to ride details
        </button>

        <h1 className="text-3xl font-bold text-white mb-2">Select Your Seat</h1>
        <p className="text-slate-400 mb-8">Choose your preferred seat from the available ones below</p>

        {/* Ride Summary Strip */}
        {ride && (
          <div className="glass p-4 mb-8 flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2 text-white font-semibold">
              <MapPin className="w-4 h-4 text-emerald-400" />
              {ride.source}
              <span className="text-slate-500 mx-1">→</span>
              <MapPin className="w-4 h-4 text-rose-400" />
              {ride.destination}
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-400 ml-auto">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> {formatDate(ride.date)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {formatTime(ride.time)}
              </span>
              <span className="text-white font-bold">{formatFare(ride.fare)}/seat</span>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Seat Picker */}
          <div>
            <h2 className="text-white font-semibold mb-4 text-center">
              Tap a green seat to select
            </h2>
            <SeatLayout
              totalSeats={seats.totalSeats}
              bookedSeats={seats.bookedSeats}
              selectedSeat={selectedSeat}
              onSeatSelect={setSelectedSeat}
            />
          </div>

          {/* Summary Panel */}
          <div className="glass p-6 space-y-4">
            <h3 className="text-white font-semibold text-lg">Booking Summary</h3>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Selected Seat</span>
                <span className={`font-semibold ${selectedSeat ? 'text-primary-400' : 'text-slate-500'}`}>
                  {selectedSeat !== null ? `Seat #${selectedSeat}` : 'None selected'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Fare per seat</span>
                <span className="text-white font-medium">{ride ? formatFare(ride.fare) : '—'}</span>
              </div>
              <div className="divider" />
              <div className="flex justify-between">
                <span className="text-white font-semibold">Total Payable</span>
                <span className="text-2xl font-black text-white">{ride ? formatFare(ride.fare) : '—'}</span>
              </div>
            </div>

            <button
              onClick={handleProceed}
              disabled={!selectedSeat}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
            >
              <Lock className="w-4 h-4" />
              Proceed to Payment
            </button>

            <div className="flex items-center gap-2 text-xs text-slate-400 justify-center">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              Driver contact revealed after payment
            </div>
          </div>
        </div>
      </div>

      <PaymentModal
        open={showPayment}
        fare={ride?.fare || 0}
        onPay={handlePay}
        onClose={() => setShowPayment(false)}
        loading={paying}
      />
    </div>
  )
}  

