import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Map, Search, Filter, Star, Phone, Mail, ArrowLeft, User } from 'lucide-react';
import { Link, useSearchParams, useLocation } from 'react-router-dom';
import { hospitals } from '@/data/hospitals';
import Navbar from '@/components/auralaid/layout/Navbar';
import { Button } from "@/components/ui/button";

interface FilterState {
  specialties: string[];
  rating: number | null;
}

const HospitalsPage = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [filters, setFilters] = useState<FilterState>({
    specialties: location.state?.specialty ? [location.state.specialty] : [],
    rating: null,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [filteredHospitals, setFilteredHospitals] = useState(hospitals);

  // Get unique specialties across all hospitals
  const allSpecialties = Array.from(
    new Set(hospitals.flatMap(hospital => hospital.specialties))
  ).sort();

  useEffect(() => {
    // Apply filters and search
    let results = hospitals;

    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(
        hospital =>
          hospital.name.toLowerCase().includes(term) ||
          hospital.description.toLowerCase().includes(term) ||
          hospital.location.city.toLowerCase().includes(term) ||
          hospital.specialties.some(specialty => specialty.toLowerCase().includes(term))
      );
    }

    // Apply specialty filters
    if (filters.specialties.length > 0) {
      results = results.filter(hospital =>
        filters.specialties.some(specialty =>
          hospital.specialties.includes(specialty)
        )
      );
    }

    // Apply rating filter
    if (filters.rating !== null) {
      results = results.filter(hospital => hospital.rating >= filters.rating);
    }

    setFilteredHospitals(results);
  }, [searchTerm, filters]);

  const toggleSpecialty = (specialty: string) => {
    setFilters(prev => {
      const isSelected = prev.specialties.includes(specialty);
      return {
        ...prev,
        specialties: isSelected
          ? prev.specialties.filter(s => s !== specialty)
          : [...prev.specialties, specialty],
      };
    });
  };

  const setRatingFilter = (rating: number | null) => {
    setFilters(prev => ({
      ...prev,
      rating,
    }));
  };

  const resetFilters = () => {
    setFilters({
      specialties: [],
      rating: null,
    });
    setSearchTerm('');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  const lang = searchParams.get('lang') || 'en';

  const translations = {
    en: {
      find: "Find Hospitals",
      back: "Back to Home",
      subtitle: "Search for top-rated hospitals, browse specialties, and book appointments with ease.",
      searchPlaceholder: "Search by hospital name, specialty, or location...",
      filters: "Filters",
      reset: "Reset All",
      specialties: "Specialties",
      rating: "Minimum Rating",
      allRatings: "All Ratings",
      viewMap: "View on Map",
      recSpecialists: "Recommended Specialists for",
      noDocs: "No specific doctors found for this specialty in our listed hospitals, but you can browse the hospitals below.",
      exp: "yrs exp",
      bookAppt: "Book Appointment",
      details: "Details",
      bookNow: "Book Now",
      call: "Call",
      email: "Email",
      noHospitals: "No hospitals found",
      noHospitalsDesc: "We couldn't find any hospitals matching your search criteria. Try adjusting your filters or search term.",
      resetFilters: "Reset Filters",
      showFilters: "Show Filters",
      hideFilters: "Hide Filters",
    },
    hi: {
      find: "अस्पताल खोजें",
      back: "वापस जाएं",
      subtitle: "शीर्ष रेटेड अस्पतालों की खोज करें, विशेषज्ञताएं ब्राउज़ करें और आसानी से अपॉइंटमेंट बुक करें।",
      searchPlaceholder: "अस्पताल का नाम, विशेषज्ञता या स्थान खोजें...",
      filters: "फिल्टर",
      reset: "रीसेट करें",
      specialties: "विशेषज्ञता",
      rating: "न्यूनतम रेटिंग",
      allRatings: "सभी रेटिंग",
      viewMap: "मैप पर देखें",
      recSpecialists: "इसके लिए अनुशंसित विशेषज्ञ",
      noDocs: "इस विशेषज्ञता के लिए कोई विशिष्ट डॉक्टर नहीं मिले, लेकिन आप नीचे अस्पताल देख सकते हैं।",
      exp: "वर्ष अनुभव",
      bookAppt: "अपॉइंटमेंट बुक करें",
      details: "विवरण",
      bookNow: "अभी बुक करें",
      call: "कॉल",
      email: "ईमेल",
      noHospitals: "कोई अस्पताल नहीं मिला",
      noHospitalsDesc: "हमें आपके खोज मानदंडों से मेल खाने वाले कोई अस्पताल नहीं मिले। अपने फिल्टर या खोज शब्द को समायोजित करने का प्रयास करें।",
      resetFilters: "फिल्टर रीसेट करें",
      showFilters: "फिल्टर दिखाएं",
      hideFilters: "फिल्टर छिपाएं",
    },
    te: {
      find: "ఆసుపత్రులను కనుగొనండి",
      back: "వెనుకకు వెళ్ళండి",
      subtitle: "టాప్ రేటెడ్ ఆసుపత్రులను కనుగొనండి, స్పెషాలిటీలను నిరోధించండి మరియు సులభంగా అపాయింట్‌మెంట్లు బుక్ చేయండి.",
      searchPlaceholder: "ఆసుపత్రి పేరు, స్పెషాలిటీ లేదా స్థానం ద్వారా శోధించండి...",
      filters: "ఫిల్టర్లు",
      reset: "రీసెట్ చేయండి",
      specialties: "స్పెషాలిటీలు",
      rating: "కనీస రేటింగ్",
      allRatings: "అన్ని రేటింగ్‌లు",
      viewMap: "మ్యాప్‌లో చూడండి",
      recSpecialists: "కోసం సిఫార్సు చేయబడిన నిపుణులు",
      noDocs: "ఈ స్పెషాలిటీ కోసం నిర్దిష్ట డాక్టర్లు దొరకలేదు, కానీ మీరు కింద ఆసుపత్రులను చూడవచ్చు.",
      exp: "సంవత్సరాల అనుభవం",
      bookAppt: "అపాయింట్‌మెంట్ బుక్ చేయండి",
      details: "వివరాలు",
      bookNow: "ఇప్పుడే బుక్ చేయండి",
      call: "కాల్",
      email: "ఇమెయిల్",
      noHospitals: "ఏ ఆసుపత్రులు కనుగొనబడలేదు",
      noHospitalsDesc: "మీ శోధన ప్రమాణాలకు సరిపోయే ఏ ఆసుపత్రులూ కనుగొనబడలేదు. మీ ఫిల్టర్లు లేదా శోధన పదాన్ని సర్దుబాటు చేయడానికి ప్రయత్నించండి.",
      resetFilters: "ఫిల్టర్లు రీసెట్ చేయండి",
      showFilters: "ఫిల్టర్లు చూపించు",
      hideFilters: "ఫిల్టర్లు దాచండి",
    }
  };
  const t = translations[lang as keyof typeof translations] || translations.en;

  return (
    <div className="min-h-screen bg-background pb-16">
      <Navbar />

      {/* Header Section with Gradient */}
      <div className="bg-gradient-to-br from-blue-500/10 via-teal-500/10 to-background pt-24 pb-12 px-4 relative">
        <div className="container-custom">
          <Link to="/" className="inline-block mb-6">
            <Button variant="ghost" size="sm" className="hover:bg-white/50">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t.back}
            </Button>
          </Link>
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-teal-600 bg-clip-text text-transparent">
              {t.find}
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t.subtitle}
            </p>

            <div className="relative max-w-2xl mx-auto mt-8">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-4 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent shadow-lg transition-shadow duration-300"
                placeholder={t.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom -mt-8 relative z-10">
        {/* Recommended Doctors Section */}
        {filters.specialties.length > 0 && (
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <User className="mr-2 text-primary-500" />
              {t.recSpecialists} {filters.specialties.join(", ")}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredHospitals.flatMap(h =>
                h.doctors
                  .filter(d => filters.specialties.includes(d.specialty))
                  .map(d => ({ ...d, hospitalName: h.name, hospitalId: h.id }))
              ).map((doctor) => (
                <motion.div
                  key={doctor.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-xl shadow-md p-4 border border-gray-100 hover:shadow-lg transition-all"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <img src={doctor.profileImage} alt={doctor.name} className="w-16 h-16 rounded-full object-cover" />
                    <div>
                      <h3 className="font-bold text-gray-800">{doctor.name}</h3>
                      <p className="text-primary-600 text-sm">{doctor.specialty}</p>
                      <p className="text-gray-400 text-xs">{doctor.hospitalName}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>{doctor.experience} {t.exp}</span>
                    <span className="font-bold text-green-600">₹{doctor.fees}</span>
                  </div>
                  <Link
                    to={`/appointment/${doctor.hospitalId}?doctorId=${doctor.id}`}
                    state={{ reason: location.state?.reason }}
                    className="btn btn-primary w-full py-2 rounded-lg text-sm text-center block"
                  >
                    {t.bookAppt}
                  </Link>
                </motion.div>
              ))}
            </div>
            {filteredHospitals.flatMap(h => h.doctors.filter(d => filters.specialties.includes(d.specialty))).length === 0 && (
              <div className="text-center text-gray-500 py-4 bg-gray-50 rounded-lg">
                {t.noDocs}
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
          {/* Filters Sidebar - Mobile Toggle */}
          <div className="w-full md:hidden mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="w-full btn btn-outline flex items-center justify-center bg-white shadow-sm"
            >
              <Filter size={18} className="mr-2" />
              {showFilters ? t.hideFilters : t.showFilters}
            </button>
          </div>

          {/* Filters Sidebar */}
          <motion.div
            className={`w-full md:w-72 md:sticky md:top-24 ${showFilters ? 'block' : 'hidden md:block'}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 mb-4">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-800">{t.filters}</h3>
                <button
                  onClick={resetFilters}
                  className="text-sm text-primary hover:text-primary font-medium transition-colors"
                >
                  {t.reset}
                </button>
              </div>

              {/* Specialties Filter */}
              <div className="mb-8">
                <h4 className="font-semibold text-gray-700 mb-4">{t.specialties}</h4>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {allSpecialties.map(specialty => (
                    <label key={specialty} className="flex items-center group cursor-pointer">
                      <div className="relative flex items-center">
                        <input
                          type="checkbox"
                          className="peer h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary transition-all"
                          checked={filters.specialties.includes(specialty)}
                          onChange={() => toggleSpecialty(specialty)}
                        />
                      </div>
                      <span className="ml-3 text-gray-600 group-hover:text-primary transition-colors text-sm">{specialty}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Rating Filter */}
              <div>
                <h4 className="font-semibold text-gray-700 mb-4">{t.rating}</h4>
                <div className="space-y-3">
                  {[5, 4, 3, 2, 1].map(rating => (
                    <label key={rating} className="flex items-center group cursor-pointer">
                      <input
                        type="radio"
                        className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                        checked={filters.rating === rating}
                        onChange={() => setRatingFilter(rating)}
                        name="rating"
                      />
                      <div className="flex items-center ml-3">
                        <div className="flex space-x-0.5">
                          {Array.from({ length: 5 }).map((_, index) => (
                            <Star
                              key={index}
                              size={14}
                              className={`${index < rating
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-300'
                                }`}
                            />
                          ))}
                        </div>
                        <span className="ml-2 text-sm text-gray-600 group-hover:text-primary transition-colors">
                          {rating}+
                        </span>
                      </div>
                    </label>
                  ))}
                  <label className="flex items-center group cursor-pointer">
                    <input
                      type="radio"
                      className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                      checked={filters.rating === null}
                      onChange={() => setRatingFilter(null)}
                      name="rating"
                    />
                    <span className="ml-3 text-sm text-gray-600 group-hover:text-primary transition-colors">{t.allRatings}</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Map View Button */}
            <Link
              to="/hospitals/map"
              className="w-full btn btn-outline flex items-center justify-center bg-white hover:bg-gray-50 border-gray-200 shadow-sm py-3 rounded-xl"
            >
              <Map size={18} className="mr-2" />
              {t.viewMap}
            </Link>
          </motion.div>

          {/* Main Content */}
          <div className="flex-1 w-full">
            {/* Results */}
            {filteredHospitals.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
                <div className="mb-6 bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                  <Search size={32} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{t.noHospitals}</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  {t.noHospitalsDesc}
                </p>
                <button
                  onClick={resetFilters}
                  className="btn btn-primary px-8 py-3 rounded-xl shadow-lg shadow-primary/30 hover:shadow-primary/40 transition-all"
                >
                  {t.resetFilters}
                </button>
              </div>
            ) : (
              <motion.div
                className="space-y-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {filteredHospitals.map((hospital) => (
                  <motion.div
                    key={hospital.id}
                    className="bg-white rounded-2xl shadow-md hover:shadow-xl border border-gray-100 overflow-hidden transition-all duration-300 group"
                    variants={itemVariants}
                    whileHover={{ y: -4 }}
                  >
                    <div className="flex flex-col md:flex-row">
                      <div className="md:w-1/3 h-56 md:h-auto relative overflow-hidden">
                        <img
                          src={hospital.imageUrl}
                          alt={hospital.name}
                          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute top-4 left-4">
                          <div className="flex items-center bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm">
                            <Star size={14} className="text-yellow-400 fill-yellow-400 mr-1.5" />
                            <span className="text-sm font-bold text-gray-800">{hospital.rating}</span>
                          </div>
                        </div>
                      </div>
                      <div className="p-6 md:w-2/3 flex flex-col">
                        <div className="flex justify-between items-start mb-2">
                          <h2 className="text-xl md:text-2xl font-bold text-gray-800 group-hover:text-primary transition-colors">
                            {hospital.name}
                          </h2>
                        </div>

                        <div className="flex items-start text-gray-500 mb-4">
                          <Map size={16} className="mr-2 mt-1 flex-shrink-0" />
                          <p className="text-sm">
                            {hospital.location.address}, {hospital.location.city}, {hospital.location.state}
                          </p>
                        </div>

                        <p className="text-gray-600 mb-6 line-clamp-2 text-sm leading-relaxed">
                          {hospital.description}
                        </p>

                        <div className="mb-6">
                          <div className="flex flex-wrap gap-2">
                            {hospital.specialties.slice(0, 4).map((specialty, index) => (
                              <span
                                key={index}
                                className="bg-primary/10 text-primary text-xs font-medium px-2.5 py-1 rounded-lg border border-primary/20"
                              >
                                {specialty}
                              </span>
                            ))}
                            {hospital.specialties.length > 4 && (
                              <span className="bg-gray-50 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-lg border border-gray-200">
                                +{hospital.specialties.length - 4} more
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between gap-4">
                          <div className="flex gap-4 text-sm text-gray-500">
                            <div className="flex items-center">
                              <Phone size={14} className="mr-1.5" />
                              <span className="hidden sm:inline">{t.call}</span>
                            </div>
                            <div className="flex items-center">
                              <Mail size={14} className="mr-1.5" />
                              <span className="hidden sm:inline">{t.email}</span>
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <Link
                              to={`/hospitals/${hospital.id}`}
                              className="btn btn-outline px-4 py-2 text-sm rounded-lg hover:bg-primary/10 hover:text-primary hover:border-primary/30"
                            >
                              {t.details}
                            </Link>
                            <Link
                              to={`/appointment/${hospital.id}`}
                              state={{ reason: location.state?.reason }}
                              className="btn btn-primary px-4 py-2 text-sm rounded-lg shadow-md shadow-primary/20 hover:shadow-primary/30"
                            >
                              {t.bookNow}
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HospitalsPage;