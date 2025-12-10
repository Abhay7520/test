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

interface Review {
  id: string;
  rating: number;
  comment: string;
  user: string;
  date: string;
}

export interface Hospital {
  id: string;
  name: string;
  location: {
    address: string;
    city: string;
    state: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  phone: string;
  email: string;
  description: string;
  facilities: string[];
  specialties: string[];
  imageUrl: string;
  rating: number;
  reviews: Review[];
  doctors: Doctor[];
}

export const hospitals: Hospital[] = [
  {
    id: "h1",
    name: "Apollo Hospitals",
    location: {
      address: "Plot No. 1, Jubilee Hills",
      city: "Hyderabad",
      state: "Telangana",
      coordinates: {
        lat: 17.4138,
        lng: 78.4329
      }
    },
    phone: "+91 40 2360 7777",
    email: "info@apollohospitals.com",
    description: "Apollo Hospitals is India's leading multi-specialty healthcare provider offering comprehensive treatment for patients from India and abroad. The hospital is renowned for its excellence in cardiology, orthopedics, neurology, and organ transplantation.",
    facilities: ["24/7 Emergency", "ICU", "Pharmacy", "Laboratory", "Radiology", "Cafeteria", "Ambulance Services", "Parking"],
    specialties: ["Cardiology", "Neurology", "Orthopedics", "Oncology", "Gastroenterology", "Nephrology", "Pediatrics"],
    imageUrl: "https://images.pexels.com/photos/668300/pexels-photo-668300.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
    rating: 4.7,
    reviews: [
      {
        id: "r1",
        rating: 5,
        comment: "Excellent care and world-class facilities. The cardiac team saved my father's life.",
        user: "Ramesh Kumar",
        date: "2025-02-15"
      },
      {
        id: "r2",
        rating: 4,
        comment: "Professional staff and clean environment. Wait times can be long for certain departments.",
        user: "Priya Sharma",
        date: "2025-01-28"
      }
    ],
    doctors: [
      {
        id: "d1",
        name: "Dr. Suresh Rao",
        specialty: "Cardiology",
        experience: 20,
        qualifications: "MD, DM (Cardiology), FACC",
        profileImage: "https://images.pexels.com/photos/5452201/pexels-photo-5452201.jpeg?auto=compress&cs=tinysrgb&w=600",
        languages: ["English", "Hindi", "Telugu"],
        availability: {
          days: ["Monday", "Wednesday", "Friday"],
          hours: "9:00 AM - 2:00 PM"
        },
        fees: 1500
      },
      {
        id: "d2",
        name: "Dr. Lakshmi Varma",
        specialty: "Neurology",
        experience: 15,
        qualifications: "MBBS, MD (Neurology), DNB",
        profileImage: "https://images.pexels.com/photos/5214958/pexels-photo-5214958.jpeg?auto=compress&cs=tinysrgb&w=600",
        languages: ["English", "Telugu", "Tamil"],
        availability: {
          days: ["Tuesday", "Thursday", "Saturday"],
          hours: "10:00 AM - 4:00 PM"
        },
        fees: 1800
      }
    ]
  },
  {
    id: "h2",
    name: "KIMS Hospitals",
    location: {
      address: "1-8-31/1, Minister Road, Secunderabad",
      city: "Hyderabad",
      state: "Telangana",
      coordinates: {
        lat: 17.4399,
        lng: 78.4983
      }
    },
    phone: "+91 40 4488 5000",
    email: "info@kimshospitals.com",
    description: "KIMS Hospitals is one of the leading healthcare providers in South India with state-of-the-art facilities. The hospital is known for its expertise in cardiac care, organ transplantation, and robotic surgeries.",
    facilities: ["24/7 Emergency", "ICU", "Pharmacy", "Laboratory", "Diagnostic Center", "Cafeteria", "Valet Parking", "Ambulance Services"],
    specialties: ["Cardiology", "Nephrology", "Urology", "Oncology", "Orthopedics", "ENT", "General Surgery"],
    imageUrl: "https://images.pexels.com/photos/236380/pexels-photo-236380.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
    rating: 4.5,
    reviews: [
      {
        id: "r3",
        rating: 5,
        comment: "Outstanding medical care with compassionate staff. The kidney transplant team is exceptional.",
        user: "Sunil Reddy",
        date: "2025-03-05"
      },
      {
        id: "r4",
        rating: 4,
        comment: "Good facilities and expert doctors. The billing process could be more streamlined.",
        user: "Anita Desai",
        date: "2025-02-10"
      }
    ],
    doctors: [
      {
        id: "d3",
        name: "Dr. Rajiv Menon",
        specialty: "Nephrology",
        experience: 18,
        qualifications: "MBBS, MD, DM (Nephrology)",
        profileImage: "https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=600",
        languages: ["English", "Malayalam", "Hindi"],
        availability: {
          days: ["Monday", "Tuesday", "Thursday"],
          hours: "9:00 AM - 3:00 PM"
        },
        fees: 1700
      },
      {
        id: "d4",
        name: "Dr. Ravi Shankar",
        specialty: "Oncology",
        experience: 22,
        qualifications: "MBBS, MD, DM (Medical Oncology)",
        profileImage: "https://images.pexels.com/photos/5407206/pexels-photo-5407206.jpeg?auto=compress&cs=tinysrgb&w=600",
        languages: ["English", "Hindi", "Telugu"],
        availability: {
          days: ["Wednesday", "Friday", "Saturday"],
          hours: "10:00 AM - 5:00 PM"
        },
        fees: 2000
      }
    ]
  },
  {
    id: "h3",
    name: "Care Hospitals",
    location: {
      address: "Road No. 1, Banjara Hills",
      city: "Hyderabad",
      state: "Telangana",
      coordinates: {
        lat: 17.4156,
        lng: 78.4347
      }
    },
    phone: "+91 40 3041 4141",
    email: "info@carehospitals.com",
    description: "Care Hospitals is a multi-specialty healthcare provider known for its excellence in cardiac sciences, neurosciences, and emergency care. The hospital is equipped with the latest technology and has a team of highly skilled medical professionals.",
    facilities: ["24/7 Emergency", "Critical Care Unit", "Pharmacy", "Diagnostic Center", "Cafeteria", "Ambulance Services", "Valet Parking", "Patient Lounge"],
    specialties: ["Cardiology", "Neurosciences", "Orthopedics", "Gastroenterology", "ENT", "Pulmonology", "Dermatology"],
    imageUrl: "https://images.pexels.com/photos/1692693/pexels-photo-1692693.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
    rating: 4.6,
    reviews: [
      {
        id: "r5",
        rating: 5,
        comment: "Excellent cardiac care department. The doctors and nurses were very attentive and professional.",
        user: "Venkat Rao",
        date: "2025-03-15"
      },
      {
        id: "r6",
        rating: 4,
        comment: "Good hospital with modern facilities. The wait time for consultations can be reduced.",
        user: "Meera Joshi",
        date: "2025-02-22"
      }
    ],
    doctors: [
      {
        id: "d5",
        name: "Dr. Aditya Kapoor",
        specialty: "Cardiothoracic Surgery",
        experience: 25,
        qualifications: "MBBS, MS, MCh (CTVS), FACS",
        profileImage: "https://images.pexels.com/photos/4173251/pexels-photo-4173251.jpeg?auto=compress&cs=tinysrgb&w=600",
        languages: ["English", "Hindi"],
        availability: {
          days: ["Monday", "Wednesday", "Friday"],
          hours: "8:00 AM - 2:00 PM"
        },
        fees: 2500
      },
      {
        id: "d6",
        name: "Dr. Nandini Sharma",
        specialty: "Neurology",
        experience: 16,
        qualifications: "MBBS, MD, DM (Neurology)",
        profileImage: "https://images.pexels.com/photos/5327656/pexels-photo-5327656.jpeg?auto=compress&cs=tinysrgb&w=600",
        languages: ["English", "Hindi", "Bengali"],
        availability: {
          days: ["Tuesday", "Thursday", "Saturday"],
          hours: "10:00 AM - 4:00 PM"
        },
        fees: 1900
      }
    ]
  },
  {
    id: "h4",
    name: "Yashoda Hospitals",
    location: {
      address: "Alexander Road, Somajiguda",
      city: "Hyderabad",
      state: "Telangana",
      coordinates: {
        lat: 17.4236,
        lng: 78.4732
      }
    },
    phone: "+91 40 2345 6789",
    email: "info@yashodahospitals.com",
    description: "Yashoda Hospitals is a renowned healthcare institution providing comprehensive medical services. The hospital is known for its advanced treatment options in oncology, neurosurgery, and transplantation.",
    facilities: ["24/7 Emergency", "ICU", "Pharmacy", "Laboratory", "Radiology", "Cafeteria", "Parking", "Patient Support Services"],
    specialties: ["Oncology", "Neurosurgery", "Orthopedics", "Cardiology", "Transplantation", "Gastroenterology", "Gynecology"],
    imageUrl: "https://images.pexels.com/photos/247786/pexels-photo-247786.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
    rating: 4.4,
    reviews: [
      {
        id: "r7",
        rating: 5,
        comment: "The oncology department provided excellent care for my mother. Doctors are highly skilled and compassionate.",
        user: "Kiran Mehta",
        date: "2025-03-02"
      },
      {
        id: "r8",
        rating: 4,
        comment: "Good hospital with modern facilities. The staff is professional but the billing process is a bit complex.",
        user: "Deepa Nair",
        date: "2025-01-18"
      }
    ],
    doctors: [
      {
        id: "d7",
        name: "Dr. Vikram Singh",
        specialty: "Surgical Oncology",
        experience: 21,
        qualifications: "MBBS, MS, MCh (Surgical Oncology)",
        profileImage: "https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=600",
        languages: ["English", "Hindi", "Punjabi"],
        availability: {
          days: ["Monday", "Tuesday", "Thursday"],
          hours: "9:00 AM - 3:00 PM"
        },
        fees: 2200
      },
      {
        id: "d8",
        name: "Dr. Priya Malhotra",
        specialty: "Neurosurgery",
        experience: 18,
        qualifications: "MBBS, MS, MCh (Neurosurgery)",
        profileImage: "https://images.pexels.com/photos/5214949/pexels-photo-5214949.jpeg?auto=compress&cs=tinysrgb&w=600",
        languages: ["English", "Hindi"],
        availability: {
          days: ["Wednesday", "Friday", "Saturday"],
          hours: "10:00 AM - 4:00 PM"
        },
        fees: 2300
      }
    ]
  },
  {
    id: "h5",
    name: "Sunshine Hospitals",
    location: {
      address: "Paradise Circle, Secunderabad",
      city: "Hyderabad",
      state: "Telangana",
      coordinates: {
        lat: 17.4433,
        lng: 78.4985
      }
    },
    phone: "+91 40 4567 8900",
    email: "info@sunshinehospitals.com",
    description: "Sunshine Hospitals is a specialized healthcare facility focused on orthopedics, joint replacement, and sports medicine. The hospital is equipped with the latest technology and has a team of experienced orthopedic surgeons.",
    facilities: ["24/7 Emergency", "ICU", "Pharmacy", "Physiotherapy", "Radiology", "Cafeteria", "Parking", "Patient Lounge"],
    specialties: ["Orthopedics", "Joint Replacement", "Sports Medicine", "Spine Surgery", "Trauma Care", "Rheumatology", "Rehabilitation"],
    imageUrl: "https://images.pexels.com/photos/127873/pexels-photo-127873.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
    rating: 4.8,
    reviews: [
      {
        id: "r9",
        rating: 5,
        comment: "Underwent a knee replacement surgery at Sunshine. The entire experience was smooth, and the results are excellent.",
        user: "Rajesh Tiwari",
        date: "2025-03-10"
      },
      {
        id: "r10",
        rating: 5,
        comment: "The physiotherapy department is exceptional. My recovery after spine surgery was faster than expected.",
        user: "Shalini Gupta",
        date: "2025-02-05"
      }
    ],
    doctors: [
      {
        id: "d9",
        name: "Dr. Arun Kumar",
        specialty: "Orthopedic Surgery",
        experience: 23,
        qualifications: "MBBS, MS (Ortho), Fellowship in Joint Replacement",
        profileImage: "https://images.pexels.com/photos/5853464/pexels-photo-5853464.jpeg?auto=compress&cs=tinysrgb&w=600",
        languages: ["English", "Hindi", "Telugu"],
        availability: {
          days: ["Monday", "Wednesday", "Friday"],
          hours: "9:00 AM - 5:00 PM"
        },
        fees: 2000
      },
      {
        id: "d10",
        name: "Dr. Meera Saxena",
        specialty: "Rheumatology",
        experience: 15,
        qualifications: "MBBS, MD (General Medicine), DM (Rheumatology)",
        profileImage: "https://images.pexels.com/photos/5214961/pexels-photo-5214961.jpeg?auto=compress&cs=tinysrgb&w=600",
        languages: ["English", "Hindi"],
        availability: {
          days: ["Tuesday", "Thursday", "Saturday"],
          hours: "10:00 AM - 3:00 PM"
        },
        fees: 1800
      }
    ]
  }
];

export const getHospitalById = (id: string): Hospital | undefined => {
  return hospitals.find(hospital => hospital.id === id);
};