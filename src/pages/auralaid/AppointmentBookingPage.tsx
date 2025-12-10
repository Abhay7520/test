import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, ArrowLeft, ArrowRight, Check, Mic, Guitar as Hospital } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { Hospital as HospitalType, getHospitalById } from '@/data/hospitals';
import SpeechWave from '@/components/auralaid/ui/SpeechWave';
import LoadingScreen from '@/components/auralaid/ui/LoadingScreen';

import { toast } from '@/hooks/use-toast';
import Navbar from '@/components/auralaid/layout/Navbar';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  experience: number;
  qualifications: string;
  profileImage: string;
  languages: string[];
  availability: {
    days: string[];
    hours: string;
  };
  fees: number;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

const timeSlots: TimeSlot[] = [
  { time: '09:00 AM', available: true },
  { time: '09:30 AM', available: true },
  { time: '10:00 AM', available: true },
  { time: '10:30 AM', available: true },
  { time: '11:00 AM', available: true },
  { time: '11:30 AM', available: true },
  { time: '12:00 PM', available: false },
  { time: '12:30 PM', available: false },
  { time: '01:00 PM', available: false },
  { time: '01:30 PM', available: true },
  { time: '02:00 PM', available: true },
  { time: '02:30 PM', available: true },
  { time: '03:00 PM', available: true },
  { time: '03:30 PM', available: true },
  { time: '04:00 PM', available: true },
  { time: '04:30 PM', available: false },
  { time: '05:00 PM', available: false },
];

const generateDateOptions = (startDays = 1) => {
  const dates = [];
  const today = new Date();

  for (let i = startDays; i < startDays + 7; i++) {
    const date = addDays(today, i);
    dates.push({
      date,
      day: format(date, 'EEE'),
      fullDate: format(date, 'yyyy-MM-dd'),
      label: format(date, 'MMM d'),
      dayOfMonth: format(date, 'd'),
    });
  }

  return dates;
};

const AppointmentBookingPage = () => {
  const { hospitalId } = useParams<{ hospitalId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const currentUser = user;

  const [hospital, setHospital] = useState<HospitalType | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [availableDoctors, setAvailableDoctors] = useState<Doctor[]>([]);
  const [dateOptions, setDateOptions] = useState(generateDateOptions());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const location = useLocation();
  const [reason, setReason] = useState(location.state?.reason || '');
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [bookingStep, setBookingStep] = useState(1);

  const preSelectedDoctorId = searchParams.get('doctorId');

  useEffect(() => {
    if (hospitalId) {
      const fetchedHospital = getHospitalById(hospitalId);

      setTimeout(() => {
        if (fetchedHospital) {
          setHospital(fetchedHospital);
          setAvailableDoctors(fetchedHospital.doctors);

          if (preSelectedDoctorId) {
            const doctor = fetchedHospital.doctors.find(doc => doc.id === preSelectedDoctorId);
            if (doctor) {
              setSelectedDoctor(doctor);
              setBookingStep(2);
            }
          }
        }
        setLoading(false);
      }, 800);
    }
  }, [hospitalId, preSelectedDoctorId]);

  const handleDoctorSelection = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setBookingStep(2);

    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const availableDayIndices = doctor.availability.days.map(day => daysOfWeek.indexOf(day));

    let startDayOffset = 1;
    const today = new Date();
    while (startDayOffset < 30) {
      const checkDate = addDays(today, startDayOffset);
      const dayIndex = checkDate.getDay();
      if (availableDayIndices.includes(dayIndex)) {
        break;
      }
      startDayOffset++;
    }

    setDateOptions(generateDateOptions(startDayOffset));
    setSelectedDate(null);
    setSelectedTimeSlot(null);
  };

  const handleDateSelection = (date: string) => {
    setSelectedDate(date);
    setSelectedTimeSlot(null);
  };

  const handleTimeSelection = (time: string) => {
    setSelectedTimeSlot(time);
  };

  const toggleVoiceRecording = () => {
    setIsVoiceRecording(!isVoiceRecording);

    if (!isVoiceRecording) {
      setTimeout(() => {
        setReason("Regular check-up for recurring chest pain");
        setIsVoiceRecording(false);
      }, 3000);
    }
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser || !selectedDoctor || !selectedDate || !selectedTimeSlot) {
      toast({ title: "Error", description: 'Please fill in all required fields', variant: "destructive" });
      return;
    }

    try {
      // Mock booking logic
      console.log('Booking appointment:', {
        hospitalId,
        doctorId: selectedDoctor.id,
        date: selectedDate,
        time: selectedTimeSlot,
        reason
      });

      toast({ title: "Success", description: 'Appointment booked successfully!' });
      navigate('/payment');
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast({ title: "Error", description: 'Failed to book appointment', variant: "destructive" });
    }
  };

  const goToNextStep = () => {
    if (bookingStep < 3) {
      setBookingStep(bookingStep + 1);
    }
  };

  const goToPrevStep = () => {
    if (bookingStep > 1) {
      setBookingStep(bookingStep - 1);
    }
  };

  const canProceed = () => {
    if (bookingStep === 1) return selectedDoctor !== null;
    if (bookingStep === 2) return selectedDate !== null && selectedTimeSlot !== null;
    return reason.trim().length > 0;
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (!hospital) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Hospital Not Found</h2>
          <p className="text-gray-600 mb-6">The hospital you're trying to book an appointment with doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/hospitals')}
            className="btn btn-primary"
          >
            Back to Hospitals
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-16 bg-gray-50">
      <Navbar />
      <div className="container-custom">
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-primary-500 transition-colors"
          >
            <ArrowLeft size={18} className="mr-1" />
            <span>Back</span>
          </button>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-t-xl shadow-sm p-6 mb-1">
            <h1 className="text-2xl font-bold mb-2">Book an Appointment</h1>
            <div className="flex items-center text-gray-600">
              <Hospital size={18} className="mr-2 text-primary-500" />
              <span>{hospital.name}</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="bg-white shadow-sm p-6 mb-1">
            <div className="flex justify-between">
              <div className="flex flex-col items-center w-1/3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${bookingStep >= 1 ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                  {bookingStep > 1 ? <Check size={16} /> : 1}
                </div>
                <span className={`mt-2 text-sm ${bookingStep >= 1 ? 'text-primary-500 font-medium' : 'text-gray-500'}`}>
                  Select Doctor
                </span>
              </div>
              <div className="flex flex-col items-center w-1/3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${bookingStep >= 2 ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                  {bookingStep > 2 ? <Check size={16} /> : 2}
                </div>
                <span className={`mt-2 text-sm ${bookingStep >= 2 ? 'text-primary-500 font-medium' : 'text-gray-500'}`}>
                  Schedule
                </span>
              </div>
              <div className="flex flex-col items-center w-1/3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${bookingStep >= 3 ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                  3
                </div>
                <span className={`mt-2 text-sm ${bookingStep >= 3 ? 'text-primary-500 font-medium' : 'text-gray-500'}`}>
                  Confirm
                </span>
              </div>
            </div>
            <div className="mt-2 h-1 bg-gray-200 rounded overflow-hidden">
              <div
                className="h-full bg-primary-500 transition-all duration-300"
                style={{ width: `${(bookingStep / 3) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Form Steps */}
          <div className="bg-white rounded-b-xl shadow-md p-6 mb-6">
            <form onSubmit={handleBookingSubmit}>
              {/* Step 1: Select Doctor */}
              {bookingStep === 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <h2 className="text-xl font-semibold mb-4">Select a Doctor</h2>
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                    {availableDoctors.map((doctor) => (
                      <div
                        key={doctor.id}
                        onClick={() => handleDoctorSelection(doctor)}
                        className={`border rounded-lg p-4 cursor-pointer transition-all ${selectedDoctor?.id === doctor.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                          }`}
                      >
                        <div className="flex items-center">
                          <img
                            src={doctor.profileImage}
                            alt={doctor.name}
                            className="w-16 h-16 rounded-full object-cover mr-4"
                          />
                          <div>
                            <h3 className="font-medium">{doctor.name}</h3>
                            <p className="text-primary-500 text-sm">{doctor.specialty}</p>
                            <div className="flex items-center text-gray-500 text-sm mt-1">
                              <User size={14} className="mr-1" />
                              {doctor.experience} years experience
                            </div>
                            <div className="flex mt-2">
                              <div className="text-xs px-2 py-0.5 bg-primary-50 text-primary-700 rounded mr-2">
                                ₹{doctor.fees}
                              </div>
                              <div className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded">
                                {doctor.languages.join(', ')}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Step 2: Select Date and Time */}
              {bookingStep === 2 && selectedDoctor && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="flex items-center mb-6">
                    <img
                      src={selectedDoctor.profileImage}
                      alt={selectedDoctor.name}
                      className="w-12 h-12 rounded-full object-cover mr-3"
                    />
                    <div>
                      <h3 className="font-medium">{selectedDoctor.name}</h3>
                      <p className="text-primary-500 text-sm">{selectedDoctor.specialty}</p>
                    </div>
                  </div>

                  <h2 className="text-xl font-semibold mb-4">Select Date & Time</h2>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Available Dates
                    </label>
                    <div className="flex overflow-x-auto space-x-2 pb-2">
                      {dateOptions.map((dateOption) => (
                        <button
                          key={dateOption.fullDate}
                          type="button"
                          onClick={() => handleDateSelection(dateOption.fullDate)}
                          className={`flex-shrink-0 flex flex-col items-center p-3 rounded-lg transition-colors min-w-[80px] ${selectedDate === dateOption.fullDate
                            ? 'bg-primary-500 text-white'
                            : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                            }`}
                        >
                          <span className={`text-xs ${selectedDate === dateOption.fullDate ? 'text-primary-100' : 'text-gray-500'}`}>
                            {dateOption.day}
                          </span>
                          <span className="text-lg font-semibold">{dateOption.dayOfMonth}</span>
                          <span className={`text-xs ${selectedDate === dateOption.fullDate ? 'text-primary-100' : 'text-gray-500'}`}>
                            {dateOption.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {selectedDate && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Available Time Slots
                      </label>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                        {timeSlots.map((slot) => (
                          <button
                            key={slot.time}
                            type="button"
                            disabled={!slot.available}
                            onClick={() => handleTimeSelection(slot.time)}
                            className={`py-2 px-3 text-sm rounded-lg transition-colors ${selectedTimeSlot === slot.time
                              ? 'bg-primary-500 text-white'
                              : slot.available
                                ? 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              }`}
                          >
                            {slot.time}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Step 3: Confirm Appointment */}
              {bookingStep === 3 && selectedDoctor && selectedDate && selectedTimeSlot && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <h2 className="text-xl font-semibold mb-6">Confirm Your Appointment</h2>

                  <div className="bg-gray-50 rounded-lg p-6 mb-6">
                    <div className="flex items-center mb-4">
                      <img
                        src={selectedDoctor.profileImage}
                        alt={selectedDoctor.name}
                        className="w-16 h-16 rounded-full object-cover mr-4"
                      />
                      <div>
                        <h3 className="font-medium">{selectedDoctor.name}</h3>
                        <p className="text-primary-500">{selectedDoctor.specialty}</p>
                        <div className="text-sm text-gray-500 mt-1">{hospital.name}</div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between border-t border-gray-200 pt-4">
                      <div className="mb-3 sm:mb-0">
                        <div className="text-sm text-gray-500 mb-1">Date</div>
                        <div className="flex items-center">
                          <Calendar size={16} className="text-primary-500 mr-2" />
                          {format(new Date(selectedDate), 'EEEE, MMMM d, yyyy')}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500 mb-1">Time</div>
                        <div className="flex items-center">
                          <Clock size={16} className="text-primary-500 mr-2" />
                          {selectedTimeSlot}
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-4 mt-4">
                      <div className="text-sm text-gray-500 mb-1">Consultation Fee</div>
                      <div className="text-lg font-semibold">₹{selectedDoctor.fees}</div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reason for Visit
                    </label>
                    <div className="relative">
                      <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Briefly describe your symptoms or reason for the appointment..."
                        className="input min-h-[100px] w-full"
                        required
                      ></textarea>
                      <button
                        type="button"
                        onClick={toggleVoiceRecording}
                        className={`absolute right-3 bottom-3 p-2 rounded-full ${isVoiceRecording
                          ? 'bg-primary-100 text-primary-500'
                          : 'text-gray-400 hover:text-primary-500'
                          }`}
                      >
                        {isVoiceRecording ? (
                          <SpeechWave isActive={true} />
                        ) : (
                          <Mic size={20} />
                        )}
                      </button>
                    </div>
                    <div className="mt-2 text-xs text-gray-500 flex items-center">
                      <Mic size={14} className="mr-1" />
                      Click the microphone icon to use voice input
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-6 mt-6">
                    <p className="text-sm text-gray-600 mb-6">
                      By confirming this appointment, you agree to our cancellation policy.
                      Cancellations within 4 hours of the appointment may incur a fee.
                    </p>

                    <button
                      type="submit"
                      className="btn btn-primary w-full py-3"
                    >
                      Confirm & Proceed to Payment
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Navigation Buttons */}
              <div className="mt-8 flex justify-between">
                {bookingStep > 1 ? (
                  <button
                    type="button"
                    onClick={goToPrevStep}
                    className="btn btn-outline"
                  >
                    <ArrowLeft size={16} className="mr-2" />
                    Back
                  </button>
                ) : (
                  <div></div>
                )}

                {bookingStep < 3 && (
                  <button
                    type="button"
                    onClick={goToNextStep}
                    disabled={!canProceed()}
                    className="btn btn-primary"
                  >
                    Next
                    <ArrowRight size={16} className="ml-2" />
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentBookingPage;