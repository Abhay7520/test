import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CreditCard, CheckCircle, ArrowLeft, Shield, Calendar, User, Clock, ChevronsUpDown, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import Navbar from '@/components/auralaid/layout/Navbar';
import LoadingScreen from '@/components/auralaid/ui/LoadingScreen';

interface PaymentMethod {
  id: string;
  type: 'card' | 'upi' | 'netbanking';
  name: string;
  icon: React.ReactNode;
  last4?: string;
  expiry?: string;
}

const mockPaymentMethods: PaymentMethod[] = [
  {
    id: 'card1',
    type: 'card',
    name: 'Credit Card',
    icon: <CreditCard size={20} />,
    last4: '4242',
    expiry: '09/28',
  },
  {
    id: 'upi1',
    type: 'upi',
    name: 'UPI',
    icon: <div className="text-xs font-bold">UPI</div>,
  },
  {
    id: 'nb1',
    type: 'netbanking',
    name: 'Net Banking',
    icon: <div className="text-xs font-bold">NB</div>,
  },
];

const PaymentPage = () => {
  const navigate = useNavigate();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('card1');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: '',
  });
  const [upiId, setUpiId] = useState('');
  const [bankName, setBankName] = useState('');
  const [showBankOptions, setShowBankOptions] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaymentComplete, setIsPaymentComplete] = useState(false);

  const handlePaymentMethodChange = (id: string) => {
    setSelectedPaymentMethod(id);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'number') {
      // Only allow digits and format with spaces
      const formatted = value
        .replace(/\D/g, '')
        .slice(0, 16)
        .replace(/(\d{4})/g, '$1 ')
        .trim();

      setCardDetails({ ...cardDetails, number: formatted });
    } else if (name === 'expiry') {
      // Format as MM/YY
      const formatted = value
        .replace(/\D/g, '')
        .slice(0, 4)
        .replace(/(\d{2})(\d{0,2})/, '$1/$2')
        .trim();

      setCardDetails({ ...cardDetails, expiry: formatted });
    } else if (name === 'cvv') {
      // Only allow 3-4 digits
      const formatted = value.replace(/\D/g, '').slice(0, 4);
      setCardDetails({ ...cardDetails, cvv: formatted });
    } else {
      setCardDetails({ ...cardDetails, [name]: value });
    }
  };

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form based on selected payment method
    if (selectedPaymentMethod === 'card1') {
      if (!validateCardDetails()) {
        toast({ title: "Error", description: 'Please enter valid card details', variant: "destructive" });
        return;
      }
    } else if (selectedPaymentMethod === 'upi1') {
      if (!upiId.includes('@')) {
        toast({ title: "Error", description: 'Please enter a valid UPI ID', variant: "destructive" });
        return;
      }
    } else if (selectedPaymentMethod === 'nb1') {
      if (!bankName) {
        toast({ title: "Error", description: 'Please select a bank', variant: "destructive" });
        return;
      }
    }

    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setIsPaymentComplete(true);

      // Redirect to dashboard after payment success
      setTimeout(() => {
        navigate('/dashboard');
        toast({ title: "Success", description: 'Appointment booked successfully!' });
      }, 2000);
    }, 2000);
  };

  const validateCardDetails = () => {
    const { number, name, expiry, cvv } = cardDetails;

    // Simple validation
    if (number.replace(/\s/g, '').length !== 16) return false;
    if (name.trim().length < 3) return false;

    // Check if expiry is in correct format and not expired
    if (!/^\d{2}\/\d{2}$/.test(expiry)) return false;

    const [month, year] = expiry.split('/');
    const expiryDate = new Date(parseInt(`20${year}`), parseInt(month) - 1);
    if (expiryDate < new Date()) return false;

    if (cvv.length < 3) return false;

    return true;
  };

  const banks = [
    'HDFC Bank',
    'ICICI Bank',
    'State Bank of India',
    'Axis Bank',
    'Kotak Mahindra Bank',
    'Yes Bank',
    'Punjab National Bank',
  ];

  if (isProcessing) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen pt-20 pb-16 bg-gray-50">
      <Navbar />
      <div className="container-custom">
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-primary transition-colors"
          >
            <ArrowLeft size={18} className="mr-1" />
            <span>Back</span>
          </button>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-t-xl shadow-sm p-6">
            <h1 className="text-2xl font-bold mb-2">Payment</h1>
            <p className="text-gray-600">Complete your payment to confirm your appointment</p>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-b-xl shadow-md p-6 mb-6">
            {isPaymentComplete ? (
              <div className="text-center py-8">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mx-auto mb-4"
                >
                  <CheckCircle size={32} className="text-white" />
                </motion.div>
                <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
                <p className="text-gray-600 mb-6">Your appointment has been confirmed</p>
                <p className="text-sm text-gray-500 mb-6">
                  You will receive a confirmation email shortly with all the details.
                </p>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="btn btn-primary px-8 py-3"
                >
                  Go to Dashboard
                </button>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row gap-8">
                {/* Payment Methods */}
                <div className="md:w-3/5">
                  <h2 className="text-xl font-semibold mb-4">Payment Methods</h2>

                  <div className="space-y-3 mb-6">
                    {mockPaymentMethods.map((method) => (
                      <div
                        key={method.id}
                        onClick={() => handlePaymentMethodChange(method.id)}
                        className={`border rounded-lg p-4 cursor-pointer transition-all ${selectedPaymentMethod === method.id
                          ? 'border-primary bg-primary/10'
                          : 'border-gray-200 hover:border-primary/60 hover:bg-gray-50'
                          }`}
                      >
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                            {method.icon}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{method.name}</div>
                            {method.last4 && (
                              <div className="text-sm text-gray-500">
                                •••• {method.last4}
                                {method.expiry && <span className="ml-2">Expires {method.expiry}</span>}
                              </div>
                            )}
                          </div>
                          <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0 flex items-center justify-center">
                            {selectedPaymentMethod === method.id && (
                              <div className="w-3 h-3 rounded-full bg-primary"></div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handlePayment}>
                    {/* Credit Card Form */}
                    {selectedPaymentMethod === 'card1' && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Card Number
                          </label>
                          <input
                            type="text"
                            name="number"
                            value={cardDetails.number}
                            onChange={handleInputChange}
                            placeholder="1234 5678 9012 3456"
                            className="input"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Cardholder Name
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={cardDetails.name}
                            onChange={handleInputChange}
                            placeholder="John Doe"
                            className="input"
                            required
                          />
                        </div>
                        <div className="flex gap-4">
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Expiry Date
                            </label>
                            <input
                              type="text"
                              name="expiry"
                              value={cardDetails.expiry}
                              onChange={handleInputChange}
                              placeholder="MM/YY"
                              className="input"
                              required
                            />
                          </div>
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              CVV
                            </label>
                            <input
                              type="text"
                              name="cvv"
                              value={cardDetails.cvv}
                              onChange={handleInputChange}
                              placeholder="123"
                              className="input"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* UPI Form */}
                    {selectedPaymentMethod === 'upi1' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          UPI ID
                        </label>
                        <input
                          type="text"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          placeholder="name@upi"
                          className="input"
                          required
                        />
                        <p className="mt-2 text-sm text-gray-500">
                          Enter your UPI ID (e.g., mobilenumber@upi, username@bank)
                        </p>
                      </div>
                    )}

                    {/* Net Banking Form */}
                    {selectedPaymentMethod === 'nb1' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Select Bank
                        </label>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setShowBankOptions(!showBankOptions)}
                            className="input w-full flex items-center justify-between"
                          >
                            <span>{bankName || 'Select your bank'}</span>
                            <ChevronsUpDown size={16} className="text-gray-400" />
                          </button>

                          {showBankOptions && (
                            <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md max-h-60 overflow-auto">
                              <ul className="py-1">
                                {banks.map((bank) => (
                                  <li
                                    key={bank}
                                    onClick={() => {
                                      setBankName(bank);
                                      setShowBankOptions(false);
                                    }}
                                    className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-gray-700"
                                  >
                                    {bank}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                        <p className="mt-2 text-sm text-gray-500">
                          You will be redirected to your bank's website to complete the payment.
                        </p>
                      </div>
                    )}

                    <div className="mt-8">
                      <button
                        type="submit"
                        disabled={isProcessing}
                        className="btn btn-primary w-full py-3 relative"
                      >
                        {isProcessing ? (
                          <span className="flex items-center justify-center">
                            <span className="mr-2">Processing</span>
                            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                          </span>
                        ) : (
                          'Pay ₹1,500'
                        )}
                      </button>
                    </div>

                    <div className="flex items-center justify-center mt-4 text-sm text-gray-500">
                      <Shield size={14} className="mr-1" />
                      <span>Payments are secure and encrypted</span>
                    </div>
                  </form>
                </div>

                {/* Order Summary */}
                <div className="md:w-2/5">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">Appointment Summary</h2>

                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <div className="text-gray-600">Doctor</div>
                        <div className="font-medium flex items-center">
                          <User size={14} className="mr-1 text-primary" />
                          Dr. Suresh Rao
                        </div>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <div className="text-gray-600">Hospital</div>
                        <div className="font-medium">Apollo Hospitals</div>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <div className="text-gray-600">Specialty</div>
                        <div className="font-medium">Cardiology</div>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 my-4 pt-4">
                      <div className="flex justify-between items-center mb-2">
                        <div className="text-gray-600 flex items-center">
                          <Calendar size={14} className="mr-1" />
                          Date
                        </div>
                        <div className="font-medium">Friday, June 20, 2025</div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="text-gray-600 flex items-center">
                          <Clock size={14} className="mr-1" />
                          Time
                        </div>
                        <div className="font-medium">10:30 AM</div>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 my-4 pt-4">
                      <div className="flex justify-between items-center mb-2">
                        <div className="text-gray-600">Consultation Fee</div>
                        <div className="font-medium">₹1,500</div>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <div className="text-gray-600">Booking Fee</div>
                        <div className="font-medium">₹0</div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="text-gray-600">Taxes</div>
                        <div className="font-medium">₹0</div>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 my-4 pt-4">
                      <div className="flex justify-between items-center">
                        <div className="text-lg font-semibold">Total</div>
                        <div className="text-lg font-bold">₹1,500</div>
                      </div>
                    </div>

                    <div className="mt-4 text-sm text-gray-500 bg-yellow-50 p-3 rounded-lg border border-yellow-100 flex items-start">
                      <AlertCircle size={16} className="text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Cancellations made less than 4 hours before the appointment time may be subject to a cancellation fee.</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;