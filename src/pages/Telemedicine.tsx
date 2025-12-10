import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
    Stethoscope,
    Bone,
    Brain,
    Heart,
    Eye,
    Baby,
    Activity,
    Smile,
    Ear,
    User,
    Pill,
    Scissors,
    ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionTitle } from "@/components/telemedicine/SectionTitle";
import { SearchBar } from "@/components/telemedicine/SearchBar";
import { SpecializationCard } from "@/components/telemedicine/SpecializationCard";
import { FilterBar } from "@/components/telemedicine/FilterBar";
import { DoctorCard, Doctor } from "@/components/telemedicine/DoctorCard";
import { HospitalCard, Hospital } from "@/components/telemedicine/HospitalCard";
import { AppointmentModal } from "@/components/telemedicine/AppointmentModal";
import { useLanguage } from "@/contexts/LanguageContext";

// --- Mock Data ---

const specializations = [
    { name: "Orthopedics", icon: Bone },
    { name: "Internal Medicine", icon: Stethoscope },
    { name: "Gastroenterology", icon: Pill },
    { name: "Ophthalmology", icon: Eye },
    { name: "Cardiac Sciences", icon: Heart },
    { name: "Urology", icon: Activity },
    { name: "ENT", icon: Ear },
    { name: "Dermatology", icon: User },
    { name: "Pediatrics", icon: Baby },
    { name: "Gynecology", icon: User },
    { name: "Dental Surgery", icon: Smile },
    { name: "Neuro Surgery", icon: Brain },
];

const doctorsData: Doctor[] = [
    {
        id: "1",
        name: "Dr. Jairam Chandra Pingle",
        specialization: "Orthopedics",
        hospital: "Apollo Health City",
        experience: "50+ years",
        rating: 4.9,
        qualification: "MBBS; MS (Ortho); FRCS",
        consultOptions: ["video", "inperson"],
        languages: "Telugu, English",
        timings: "9:30-12:30",
        location: "Jubilee Hills"
    },
    {
        id: "2",
        name: "Dr Prof Ramulu",
        specialization: "Internal Medicine",
        hospital: "Apollo Hospitals",
        experience: "47+ years",
        rating: 4.8,
        qualification: "MBBS, MD",
        consultOptions: ["video", "audio", "inperson"],
        languages: "Telugu",
        timings: "17:30-19:30",
        location: "Secunderabad"
    },
    {
        id: "3",
        name: "Dr. Nandanavanam Raghupathi Rao",
        specialization: "Gastroenterology",
        hospital: "Apollo Health City",
        experience: "46+ years",
        rating: 4.7,
        qualification: "MBBS; MS (General Surgery)",
        consultOptions: ["video", "inperson"],
        languages: "Telugu",
        timings: "10:00-14:00",
        location: "Jubilee Hills"
    },
    {
        id: "4",
        name: "Dr. Prakash Kumar",
        specialization: "Ophthalmology",
        hospital: "Apollo Hospitals",
        experience: "45+ years",
        rating: 4.8,
        qualification: "MBBS, MS (Opthalmology), D, O",
        consultOptions: ["inperson"],
        languages: "Telugu",
        timings: "16:00-17:30",
        location: "Secunderabad"
    },
    {
        id: "5",
        name: "Dr. Vijay Dikshit",
        specialization: "Cardiac Sciences",
        hospital: "Apollo Health City",
        experience: "42+ years",
        rating: 5.0,
        qualification: "M.B.B.S.; M.S.(Surgery); M.Ch.",
        consultOptions: ["video", "inperson"],
        languages: "English",
        timings: "09:00-19:00",
        location: "Jubilee Hills"
    },
    {
        id: "6",
        name: "Dr. Rajagopal V",
        specialization: "Urology",
        hospital: "Apollo Health City",
        experience: "40+ years",
        rating: 4.6,
        qualification: "MBBS; MS (GENERAL SURGERY)",
        consultOptions: ["video", "audio", "inperson"],
        languages: "Telugu",
        timings: "10:00-17:00",
        location: "Jubilee Hills"
    },
    {
        id: "7",
        name: "Dr. E C Vinaya Kumar",
        specialization: "ENT",
        hospital: "Apollo Health City",
        experience: "38+ years",
        rating: 4.7,
        qualification: "M.B.B.S., D.L.O., M.S. (ENT)",
        consultOptions: ["video", "inperson"],
        languages: "Telugu",
        timings: "10:30-15:00",
        location: "Jubilee Hills"
    },
    {
        id: "8",
        name: "Dr. Lahary A K",
        specialization: "Dermatology",
        hospital: "Apollo Hospitals",
        experience: "37+ years",
        rating: 4.9,
        qualification: "DD, MD, MBBS",
        consultOptions: ["video", "audio", "inperson"],
        languages: "English",
        timings: "10:30-12:00",
        location: "Secunderabad"
    },
    {
        id: "9",
        name: "Dr. Dinesh Kumar Chirla",
        specialization: "Pediatrics",
        hospital: "Rainbow Children's Hospitals",
        experience: "32+ years",
        rating: 4.8,
        qualification: "MD, DM, FRCPCH",
        consultOptions: ["video", "inperson"],
        languages: "Telugu",
        timings: "11:00-15:00",
        location: "Banjara Hills"
    },
    {
        id: "10",
        name: "Dr. Pranathi Reddy A",
        specialization: "Gynecology",
        hospital: "Rainbow Children's Hospitals",
        experience: "25+ years",
        rating: 4.9,
        qualification: "MD, DGO, DNB, FRCOG",
        consultOptions: ["video", "audio", "inperson"],
        languages: "Telugu",
        timings: "09:00-15:00",
        location: "Banjara Hills"
    },
    {
        id: "11",
        name: "Dr. D. Sainath",
        specialization: "Dental Surgery",
        hospital: "Yashoda Hospitals",
        experience: "16 years",
        rating: 4.5,
        qualification: "MDS",
        consultOptions: ["inperson"],
        languages: "Telugu",
        timings: "09:00-15:00",
        location: "Hitech City"
    },
    {
        id: "12",
        name: "Dr. Kale Satya Sridhar",
        specialization: "CT Surgery",
        hospital: "Yashoda Hospitals",
        experience: "20 years",
        rating: 4.7,
        qualification: "MBBS, MS, MCh",
        consultOptions: ["video", "inperson"],
        languages: "Telugu",
        timings: "09:00-15:00",
        location: "Secunderabad"
    },
    {
        id: "13",
        name: "Dr. BSV Raju",
        specialization: "Neuro Surgery",
        hospital: "Yashoda Hospitals",
        experience: "28 years",
        rating: 4.8,
        qualification: "MS, DNB (Ortho), MCh (Neuro)",
        consultOptions: ["video", "inperson"],
        languages: "Hindi",
        timings: "09:00-16:00",
        location: "Somajiguda"
    },
    {
        id: "14",
        name: "Dr. Chetan Rao Vaddepally",
        specialization: "Pulmonology",
        hospital: "Yashoda Hospitals",
        experience: "12 years",
        rating: 4.6,
        qualification: "MD, EDARM, FAPSR",
        consultOptions: ["video", "audio", "inperson"],
        languages: "English",
        timings: "10:00-16:00",
        location: "Hitech City"
    },
    {
        id: "15",
        name: "Dr. P Ranganadham",
        specialization: "Neuro Surgery",
        hospital: "Aster Hospitals",
        experience: "30+ years",
        rating: 4.7,
        qualification: "MBBS, MCh Neuro Surgery",
        consultOptions: ["video", "inperson"],
        languages: "Telugu",
        timings: "10:00-16:00",
        location: "Ameerpet"
    }
];

const hospitalsData: Hospital[] = [
    {
        id: "1",
        name: "Apollo Health City",
        location: "Jubilee Hills, Hyderabad",
        specialties: ["Orthopedics", "Cardiology", "Gastroenterology", "ENT"],
        doctorsCount: 45,
        rating: 4.8,
        image: "https://images.unsplash.com/photo-1587351021759-3e566b9af9ef?auto=format&fit=crop&q=80&w=500"
    },
    {
        id: "2",
        name: "Apollo Hospitals",
        location: "Secunderabad",
        specialties: ["Internal Medicine", "Ophthalmology", "Dermatology"],
        doctorsCount: 32,
        rating: 4.6,
        image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=500"
    },
    {
        id: "3",
        name: "Rainbow Children's Hospitals",
        location: "Banjara Hills",
        specialties: ["Pediatrics", "Gynecology", "Neonatology"],
        doctorsCount: 28,
        rating: 4.9,
        image: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&q=80&w=500"
    },
    {
        id: "4",
        name: "Yashoda Hospitals",
        location: "Hitech City / Somajiguda",
        specialties: ["Neuro Surgery", "CT Surgery", "Pulmonology"],
        doctorsCount: 50,
        rating: 4.7,
        image: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&q=80&w=500"
    },
    {
        id: "5",
        name: "Aster Hospitals",
        location: "Ameerpet",
        specialties: ["Neuro Surgery", "General Medicine"],
        doctorsCount: 20,
        rating: 4.5,
        image: "https://images.unsplash.com/photo-1516549655169-df83a0929519?auto=format&fit=crop&q=80&w=500"
    }
];

// --- Main Component ---

const Telemedicine = () => {
    const { t } = useLanguage();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedSpecialization, setSelectedSpecialization] = useState<string | null>(null);
    const [filters, setFilters] = useState({
        specialization: "all",
        type: "all",
        hospital: "all",
        rating: "all"
    });
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Filter Logic
    const filteredDoctors = useMemo(() => {
        return doctorsData.filter((doctor) => {
            // Search Query
            const matchesSearch =
                doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                doctor.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
                doctor.hospital.toLowerCase().includes(searchQuery.toLowerCase());

            if (!matchesSearch) return false;

            // Specialization Card Selection
            if (selectedSpecialization && doctor.specialization !== selectedSpecialization) {
                return false;
            }

            // Dropdown Filters
            if (filters.specialization !== "all" && doctor.specialization !== filters.specialization) return false;
            if (filters.hospital !== "all" && doctor.hospital !== filters.hospital) return false;
            if (filters.type !== "all" && !doctor.consultOptions.includes(filters.type as string)) return false;
            if (filters.rating !== "all" && doctor.rating < parseFloat(filters.rating)) return false;

            return true;
        });
    }, [searchQuery, selectedSpecialization, filters]);

    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        if (key === "specialization" && value !== "all") {
            setSelectedSpecialization(null); // Clear card selection if dropdown is used
        }
    };

    const handleSpecializationClick = (specName: string) => {
        if (selectedSpecialization === specName) {
            setSelectedSpecialization(null);
        } else {
            setSelectedSpecialization(specName);
            setFilters(prev => ({ ...prev, specialization: "all" })); // Clear dropdown if card is used
        }
    };

    const handleBookAppointment = (doctor: Doctor) => {
        setSelectedDoctor(doctor);
        setIsModalOpen(true);
    };

    const handleViewHospitalDoctors = (hospitalName: string) => {
        setFilters(prev => ({ ...prev, hospital: hospitalName }));
        const element = document.getElementById("doctors-list");
        if (element) {
            window.scrollTo({ top: element.offsetTop - 100, behavior: "smooth" });
        }
    };

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header Section */}
            <div className="bg-gradient-to-br from-blue-500/10 via-teal-500/10 to-background pt-8 pb-12 px-4 relative">
                <Link to="/" className="absolute top-4 left-4 md:left-8">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        {t.backToHome}
                    </Button>
                </Link>
                <div className="max-w-5xl mx-auto text-center space-y-6">
                    <SectionTitle
                        title={t.telemedicineTitle}
                        subtitle={t.telemedicineSubtitle}
                        className="mb-8"
                    />

                    <SearchBar
                        value={searchQuery}
                        onChange={setSearchQuery}
                    />
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 -mt-8 space-y-12">
                {/* Specializations */}
                <section>
                    <div className="flex items-center justify-between mb-4 px-2">
                        <h3 className="font-semibold text-lg">{t.specializations}</h3>
                        <button
                            onClick={() => {
                                setSelectedSpecialization(null);
                                setFilters(f => ({ ...f, specialization: "all" }));
                            }}
                            className="text-sm text-primary hover:underline"
                        >
                            {t.viewAll}
                        </button>
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide px-2">
                        {specializations.map((spec) => (
                            <SpecializationCard
                                key={spec.name}
                                name={spec.name}
                                icon={spec.icon}
                                isSelected={selectedSpecialization === spec.name}
                                onClick={() => handleSpecializationClick(spec.name)}
                            />
                        ))}
                    </div>
                </section>

                {/* Hospitals */}
                <section>
                    <h3 className="font-semibold text-lg mb-4 px-2">{t.topHospitals}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {hospitalsData.map((hospital) => (
                            <HospitalCard
                                key={hospital.id}
                                hospital={hospital}
                                onViewDoctors={handleViewHospitalDoctors}
                            />
                        ))}
                    </div>
                </section>

                {/* Doctors List */}
                <section id="doctors-list" className="scroll-mt-24">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 px-2">
                        <h3 className="font-semibold text-lg">
                            {t.availableDoctors} <span className="text-muted-foreground font-normal">({filteredDoctors.length})</span>
                        </h3>
                        <FilterBar
                            filters={filters}
                            onFilterChange={handleFilterChange}
                            onClearFilters={() => {
                                setFilters({ specialization: "all", type: "all", hospital: "all", rating: "all" });
                                setSelectedSpecialization(null);
                                setSearchQuery("");
                            }}
                            hospitals={Array.from(new Set(doctorsData.map(d => d.hospital)))}
                            specializations={specializations.map(s => s.name)}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredDoctors.length > 0 ? (
                            filteredDoctors.map((doctor) => (
                                <DoctorCard
                                    key={doctor.id}
                                    doctor={doctor}
                                    onBook={handleBookAppointment}
                                />
                            ))
                        ) : (
                            <div className="col-span-full text-center py-12 text-muted-foreground bg-muted/30 rounded-2xl border border-dashed">
                                <p>{t.noDoctorsFound}</p>
                                <button
                                    onClick={() => {
                                        setFilters({ specialization: "all", type: "all", hospital: "all", rating: "all" });
                                        setSelectedSpecialization(null);
                                        setSearchQuery("");
                                    }}
                                    className="text-primary hover:underline mt-2"
                                >
                                    {t.clearFilters}
                                </button>
                            </div>
                        )}
                    </div>
                </section>
            </div>

            <AppointmentModal
                doctor={selectedDoctor}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={() => {
                    // Logic to save appointment would go here
                    console.log("Appointment confirmed for", selectedDoctor?.name);
                }}
            />
        </div>
    );
};

export default Telemedicine;
