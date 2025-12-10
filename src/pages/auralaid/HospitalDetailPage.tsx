import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Star, Clock, UserCheck, Building, Award, Calendar, User, Users, Activity, ArrowLeft } from 'lucide-react';
import { Hospital, getHospitalById } from '@/data/hospitals';
import LoadingScreen from '@/components/auralaid/ui/LoadingScreen';
import Navbar from '@/components/auralaid/layout/Navbar';
import { Button } from "@/components/ui/button";

const HospitalDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (id) {
      // In a real application, this would be an API call
      const fetchedHospital = getHospitalById(id);

      setTimeout(() => {
        setHospital(fetchedHospital || null);
        setLoading(false);
      }, 800); // Simulated loading delay
    }
  }, [id]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!hospital) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg max-w-md mx-4">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Hospital Not Found</h2>
          <p className="text-gray-600 mb-6">The hospital you're looking for doesn't exist or has been removed.</p>
          <Link to="/hospitals" className="btn btn-primary">
            Back to Hospitals
          </Link>
        </div>
      </div>
    );
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        size={18}
        className={`${index < Math.floor(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <Navbar />

      {/* Hero Section */}
      <div className="relative h-[400px] w-full">
        <img
          src={hospital.imageUrl}
          alt={hospital.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

        <div className="absolute top-24 left-0 w-full px-4">
          <div className="container-custom">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="text-white hover:bg-white/20 hover:text-white mb-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 w-full p-6 md:p-10 text-white">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-3xl md:text-5xl font-bold mb-3">{hospital.name}</h1>
              <div className="flex flex-col md:flex-row md:items-center gap-4 text-gray-200 mb-4">
                <div className="flex items-center">
                  <MapPin size={18} className="mr-2 text-primary-400" />
                  <span>{hospital.location.address}, {hospital.location.city}, {hospital.location.state}</span>
                </div>
                <div className="hidden md:block w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
                    <div className="flex mr-2">{renderStars(hospital.rating)}</div>
                    <span className="font-bold text-white">{hospital.rating.toFixed(1)}</span>
                  </div>
                  <span className="text-sm px-3 py-1 bg-white/10 rounded-full backdrop-blur-sm">
                    {hospital.reviews.length} Reviews
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="container-custom -mt-8 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-8">
          <div className="p-6 md:p-8">
            <div className="flex flex-wrap gap-6 border-b border-gray-100 pb-6 mb-8">
              <div className="flex items-center text-gray-700 bg-gray-50 px-4 py-2 rounded-lg">
                <Building size={20} className="mr-3 text-primary-500" />
                <span className="font-medium">Established Hospital</span>
              </div>
              <div className="flex items-center text-gray-700 bg-gray-50 px-4 py-2 rounded-lg">
                <UserCheck size={20} className="mr-3 text-primary-500" />
                <span className="font-medium">{hospital.doctors.length} Specialists</span>
              </div>
              <div className="flex items-center text-gray-700 bg-gray-50 px-4 py-2 rounded-lg">
                <Award size={20} className="mr-3 text-primary-500" />
                <span className="font-medium">{hospital.specialties.length} Specialties</span>
              </div>
              <div className="flex items-center text-gray-700 bg-gray-50 px-4 py-2 rounded-lg">
                <Clock size={20} className="mr-3 text-primary-500" />
                <span className="font-medium">24/7 Emergency</span>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
              <div className="flex-1">
                <div className="flex space-x-8 mb-8 border-b border-gray-200">
                  {['overview', 'doctors', 'reviews'].map((tab) => (
                    <button
                      key={tab}
                      className={`pb-4 px-2 relative font-medium text-lg transition-colors ${activeTab === tab ? 'text-primary-600' : 'text-gray-500 hover:text-gray-800'
                        }`}
                      onClick={() => setActiveTab(tab)}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      {activeTab === tab && (
                        <motion.div
                          layoutId="activeTabLine"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600"
                          initial={false}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        />
                      )}
                    </button>
                  ))}
                </div>

                {/* Overview Content */}
                {activeTab === 'overview' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="mb-8">
                      <h3 className="text-xl font-bold text-gray-800 mb-4">About {hospital.name}</h3>
                      <p className="text-gray-600 leading-relaxed text-lg">{hospital.description}</p>
                    </div>

                    <div className="mb-8">
                      <h3 className="text-xl font-bold text-gray-800 mb-4">Specialties</h3>
                      <div className="flex flex-wrap gap-2">
                        {hospital.specialties.map((specialty, index) => (
                          <span key={index} className="bg-primary-50 text-primary-700 px-4 py-2 rounded-lg text-sm font-medium border border-primary-100">
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mb-6">
                      <h3 className="text-xl font-bold text-gray-800 mb-4">Facilities & Services</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {hospital.facilities.map((facility, index) => (
                          <div key={index} className="flex items-center text-gray-700 bg-gray-50 p-3 rounded-lg">
                            <div className="w-2 h-2 bg-primary-500 rounded-full mr-3"></div>
                            {facility}
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Doctors Content */}
                {activeTab === 'doctors' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="space-y-6">
                      {hospital.doctors.map((doctor) => (
                        <div key={doctor.id} className="border border-gray-100 rounded-xl p-6 hover:shadow-lg transition-all duration-300 bg-white group">
                          <div className="flex flex-col sm:flex-row gap-6">
                            <div className="sm:w-24 flex-shrink-0">
                              <img
                                src={doctor.profileImage}
                                alt={doctor.name}
                                className="w-24 h-24 rounded-full object-cover mx-auto sm:mx-0 border-4 border-gray-50 group-hover:border-primary-50 transition-colors"
                              />
                            </div>
                            <div className="flex-1">
                              <div className="flex flex-col sm:flex-row justify-between items-start mb-2">
                                <div>
                                  <h4 className="text-lg font-bold text-gray-800 group-hover:text-primary-600 transition-colors">{doctor.name}</h4>
                                  <p className="text-primary-600 font-medium">{doctor.specialty}</p>
                                </div>
                                <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-bold mt-2 sm:mt-0">
                                  ₹{doctor.fees}
                                </span>
                              </div>

                              <div className="flex items-center text-gray-500 text-sm mb-3">
                                <User size={16} className="mr-1.5" />
                                {doctor.experience} years experience
                              </div>

                              <p className="text-gray-600 text-sm mb-3">
                                <span className="font-semibold text-gray-700">Qualifications:</span> {doctor.qualifications}
                              </p>

                              <div className="flex flex-wrap gap-2 mb-4">
                                {doctor.languages.map((language, index) => (
                                  <span key={index} className="bg-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-md font-medium">
                                    {language}
                                  </span>
                                ))}
                              </div>

                              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 pt-4 border-t border-gray-50">
                                <div className="flex items-center text-sm text-gray-500">
                                  <Calendar size={16} className="mr-2 text-primary-400" />
                                  <span>Available: {doctor.availability.days.join(', ')} | {doctor.availability.hours}</span>
                                </div>
                                <Link
                                  to={`/appointment/${hospital.id}?doctorId=${doctor.id}`}
                                  state={{ reason: location.state?.reason }}
                                  className="btn btn-primary text-sm px-6 py-2.5 rounded-lg shadow-md shadow-primary-500/20 hover:shadow-primary-500/30 w-full sm:w-auto text-center"
                                >
                                  Book Appointment
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Reviews Content */}
                {activeTab === 'reviews' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="bg-gray-50 rounded-xl p-6 mb-8 flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="text-4xl font-bold text-gray-800 mr-4">{hospital.rating.toFixed(1)}</div>
                        <div>
                          <div className="flex mb-1">{renderStars(hospital.rating)}</div>
                          <span className="text-gray-500 font-medium">Overall Rating</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-gray-800 block">{hospital.reviews.length}</span>
                        <span className="text-gray-500 text-sm">Total Reviews</span>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {hospital.reviews.map((review) => (
                        <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0">
                          <div className="flex justify-between mb-3">
                            <div className="flex items-center">
                              <div className="bg-gradient-to-br from-primary-100 to-primary-200 text-primary-700 rounded-full w-10 h-10 flex items-center justify-center mr-3 font-bold shadow-sm">
                                {review.user[0]}
                              </div>
                              <div>
                                <div className="font-bold text-gray-800">{review.user}</div>
                                <div className="text-gray-400 text-xs">{review.date}</div>
                              </div>
                            </div>
                            <div className="flex items-center bg-yellow-50 px-2.5 py-1 rounded-lg border border-yellow-100">
                              <div className="flex mr-1.5">
                                {Array.from({ length: 5 }).map((_, index) => (
                                  <Star
                                    key={index}
                                    size={12}
                                    className={`${index < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm font-bold text-yellow-700">{review.rating}</span>
                            </div>
                          </div>
                          <p className="text-gray-600 leading-relaxed pl-13">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Contact Information Sidebar */}
              <div className="lg:w-96">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6 sticky top-24">
                  <h3 className="text-lg font-bold text-gray-800 mb-6 pb-4 border-b border-gray-100">Contact Information</h3>
                  <div className="space-y-5">
                    <div className="flex items-start group">
                      <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center mr-4 flex-shrink-0 group-hover:bg-primary-100 transition-colors">
                        <MapPin size={20} className="text-primary-600" />
                      </div>
                      <div>
                        <span className="block text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Address</span>
                        <span className="text-gray-700 font-medium leading-snug block">
                          {hospital.location.address}, {hospital.location.city}, {hospital.location.state}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start group">
                      <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center mr-4 flex-shrink-0 group-hover:bg-primary-100 transition-colors">
                        <Phone size={20} className="text-primary-600" />
                      </div>
                      <div>
                        <span className="block text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Phone</span>
                        <span className="text-gray-700 font-medium">{hospital.phone}</span>
                      </div>
                    </div>

                    <div className="flex items-start group">
                      <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center mr-4 flex-shrink-0 group-hover:bg-primary-100 transition-colors">
                        <Mail size={20} className="text-primary-600" />
                      </div>
                      <div>
                        <span className="block text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Email</span>
                        <span className="text-gray-700 font-medium">{hospital.email}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-gray-100">
                    <Link
                      to={`/appointment/${hospital.id}`}
                      state={{ reason: location.state?.reason }}
                      className="btn btn-primary w-full justify-center py-4 text-base font-semibold shadow-lg shadow-primary-500/20 hover:shadow-primary-500/30 rounded-xl"
                    >
                      Book Appointment
                    </Link>
                    <p className="text-center text-xs text-gray-400 mt-4">
                      No payment required for booking
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HospitalDetailPage;