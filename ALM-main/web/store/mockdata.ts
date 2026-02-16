import {
  Album,
  Announcement,
  Feedback,
  Member,
  Photo,
  Event,
  Transaction,
} from "@/types";
import Logo from "@/src/assets/alm-logo.jpeg";
export { Logo };
export const INITIAL_EVENTS: Event[] = [
  {
    id: "1",
    title: "Annual Community Gala",
    date: "2024-11-16",
    time: "18:00",
    location: "Musanze Conference Hall",
    status: "Upcoming",
    description:
      "Join us for a night of celebration, music, and networking as we honor our community achievements. Keynote by Ambassador Williams.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBUjtKHJQVedLpdZAVUSDzrDyBQI_6KFfzqXVnS8VYMXEf0snhFM6vxckOwtkz-RQKksEVw79e57e2Nq7soCsvUPdLMQSr5_MKAkbioZOeVX_7A_Sdy5fmCncWYOA85p_0tpiF791qpfFvL7EBOPI3cN4ezEV561VhctROL4k5ZzlZokoz8tHj5O7ziGjrQSpzuMaUXLW_Fp7ZS02WQt1F8HN8m6y8pkCVjax4WoaGvjzeodWw4fHezo6FWvaHk6P_W3DEMR8VKVyE",
    banner:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBUjtKHJQVedLpdZAVUSDzrDyBQI_6KFfzqXVnS8VYMXEf0snhFM6vxckOwtkz-RQKksEVw79e57e2Nq7soCsvUPdLMQSr5_MKAkbioZOeVX_7A_Sdy5fmCncWYOA85p_0tpiF791qpfFvL7EBOPI3cN4ezEV561VhctROL4k5ZzlZokoz8tHj5O7ziGjrQSpzuMaUXLW_Fp7ZS02WQt1F8HN8m6y8pkCVjax4WoaGvjzeodWw4fHezo6FWvaHk6P_W3DEMR8VKVyE",
    rsvpCount: 124,
    category: "Cultural",
    organizer: "ALM Executive Committee",
    capacity: 200,
    price: 5000,
    registrationRequired: true,
    speakers: [
      {
        id: "s1",
        name: "Ambassador Williams",
        title: "Keynote Speaker",
        avatar:
          "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200&fit=crop",
      },
      {
        id: "s2",
        name: "Joseph Tamba",
        title: "President",
        avatar:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&fit=crop",
      },
    ],
    agenda: [
      { id: "ag1", time: "18:00", activity: "Arrival & Registration" },
      { id: "ag2", time: "18:30", activity: "Opening Prayer & Anthem" },
      { id: "ag3", time: "19:00", activity: "Keynote Address" },
      { id: "ag4", time: "20:00", activity: "Dinner & Networking" },
    ],
    attendees: [
      {
        id: "a1",
        name: "John Doe",
        email: "john@example.com",
        phone: "0788123456",
        status: "Confirmed",
        registrationDate: "2024-10-01",
        attended: false,
      },
      {
        id: "a2",
        name: "Jane Smith",
        email: "jane@example.com",
        phone: "0788654321",
        status: "Pending",
        registrationDate: "2024-10-05",
        attended: false,
      },
      {
        id: "a3",
        name: "Michael Brown",
        email: "mike@example.com",
        phone: "0788111222",
        status: "Checked In",
        registrationDate: "2024-10-06",
        attended: true,
      },
    ],
  },
  {
    id: "2",
    title: "Career Development Workshop",
    date: "2024-12-04",
    time: "10:00",
    location: "Kigali Business Center",
    status: "Upcoming",
    description:
      "Enhance your professional skills with our workshop on resume building, interview techniques, and networking strategies in the local market.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDIW6OAbEq09-sjavX9K6uPB3omNYSEg_MIijoTLvZ5iFN4IFUWuB6_dS150VqYZwnAfQJ6_Wa7deCFz4KuLO9fwkT8WjPwvdM5ftotS16DpihR6D6X-eHlHUR83-1NFJe4tGS8kz01t109zjgd4Tjq0TGj3RDF7h4h1Hidf4JPkcU1qU2m4FiyTroSa-3gCaDdydUPCo6Dw4o9M4Wub32G-0_ev9pPjx7Yw9Td9DR89T7q9_tQP71Wyq7P1A52OX5FduvvkDXXtzA",
    banner:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDIW6OAbEq09-sjavX9K6uPB3omNYSEg_MIijoTLvZ5iFN4IFUWuB6_dS150VqYZwnAfQJ6_Wa7deCFz4KuLO9fwkT8WjPwvdM5ftotS16DpihR6D6X-eHlHUR83-1NFJe4tGS8kz01t109zjgd4Tjq0TGj3RDF7h4h1Hidf4JPkcU1qU2m4FiyTroSa-3gCaDdydUPCo6Dw4o9M4Wub32G-0_ev9pPjx7Yw9Td9DR89T7q9_tQP71Wyq7P1A52OX5FduvvkDXXtzA",
    rsvpCount: 45,
    category: "Training",
    organizer: "Education Committee",
    capacity: 50,
    price: 0,
    registrationRequired: true,
    attendees: [],
  },
  {
    id: "3",
    title: "Independence Day Celebration",
    date: "2025-01-26",
    time: "13:00",
    location: "Musanze Public Park",
    status: "Upcoming",
    description:
      "A family-friendly day of cultural performances, traditional food, and music to celebrate our shared heritage. All are welcome!",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC8EhEOLowsKN097VkT_B6Mm94ADJR3tCamZ9qwBpmcOtNLcAxAYcqAqsQGn3pfXjYdXiDL9UsJ05wsEPOtDSyH3y6NYUUsKrThCT1x6lEET04hJ-RBsThzZ7ns5fKl-8O7XLkj0HPq72uY9Lms2fVhvFJLcF-G2d2DFecDJEX1NvbtPVEzqWV_CZ4WyE_gNfjG06bzrtlZGPF0eGXH0kzhhWfdRXfGU2dgyaCW5exaM_B0dY01HQfDbclEXVysYgNEmbldFsG9NPU",
    banner:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC8EhEOLowsKN097VkT_B6Mm94ADJR3tCamZ9qwBpmcOtNLcAxAYcqAqsQGn3pfXjYdXiDL9UsJ05wsEPOtDSyH3y6NYUUsKrThCT1x6lEET04hJ-RBsThzZ7ns5fKl-8O7XLkj0HPq72uY9Lms2fVhvFJLcF-G2d2DFecDJEX1NvbtPVEzqWV_CZ4WyE_gNfjG06bzrtlZGPF0eGXH0kzhhWfdRXfGU2dgyaCW5exaM_B0dY01HQfDbclEXVysYgNEmbldFsG9NPU",
    rsvpCount: 210,
    category: "Cultural",
    organizer: "ALM Social Team",
    capacity: 500,
    price: 0,
    registrationRequired: false,
    attendees: [],
  },
  {
    id: "4",
    title: "Summer Community Picnic",
    date: "2024-07-15",
    time: "11:00",
    location: "Lake Ruhondo Side",
    status: "Past",
    description:
      "Fun in the sun with games, BBQ, and swimming. A great bonding experience for families.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA7X4f1joZTe51YHPdqikBQ7FXkFx7eniwK_L36mvtb-ds_WQNqIXYeeuf8CK42Yy9axt-GWzlcjjy6K71SFEnnROsA11z-3rXZ5qf6Ju4sO5THMS7xgGP5CM9uFg3bslP2hG0EIGY-aTisUiSef1Nkf4aPceENFyk9jkRQhXDFexEjdmaMeN3L0KFGQlZWMZjY9V1xgk1zBFTDEqEbHiFbiXgoEW1XGjt6AC3q3YEZHHSerdGxH-dKW7SVxcVLxEaFF8o17M6GIFM",
    banner:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA7X4f1joZTe51YHPdqikBQ7FXkFx7eniwK_L36mvtb-ds_WQNqIXYeeuf8CK42Yy9axt-GWzlcjjy6K71SFEnnROsA11z-3rXZ5qf6Ju4sO5THMS7xgGP5CM9uFg3bslP2hG0EIGY-aTisUiSef1Nkf4aPceENFyk9jkRQhXDFexEjdmaMeN3L0KFGQlZWMZjY9V1xgk1zBFTDEqEbHiFbiXgoEW1XGjt6AC3q3YEZHHSerdGxH-dKW7SVxcVLxEaFF8o17M6GIFM",
    rsvpCount: 88,
    category: "Sports",
    organizer: "Youth Committee",
    capacity: 100,
    price: 2000,
    registrationRequired: true,
    attendees: [],
  },
];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: "1",
    title: "Call for Volunteers",
    content:
      "We are looking for enthusiastic volunteers for the upcoming Community Cookout. Sign up now to help make it a success!",
    date: "Oct 5, 2024",
    icon: "campaign",
  },
  {
    id: "2",
    title: "New Membership Benefits",
    content:
      "We have partnered with local businesses to offer exclusive discounts to our members. Check the resources page for more details.",
    date: "Oct 1, 2024",
    icon: "card_membership",
  },
  {
    id: "3",
    title: "Minutes from Last Meeting",
    content:
      "The minutes from the September general meeting are now available in the resource library for your review.",
    date: "Sep 28, 2024",
    icon: "history_edu",
  },
];

export const INITIAL_MEMBERS: Member[] = [
  {
    id: "1",
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "+250 788 123 456",
    joinDate: "2023-10-27",
    status: "Active",
    membershipId: "ALM-001",
    avatar:
      "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200&auto=format&fit=crop",
    password: "password",
    county: "Montserrado",
    profession: "Teacher",
    gender: "Male",
    dateOfBirth: "1985-05-15",
    district: "Musanze",
    sector: "Muhoza",
    membershipType: "Regular",
    paymentStatus: "Paid",
    emergencyContact: {
      name: "Mary Doe",
      relation: "Spouse",
      phone: "+250 788 000 001",
    },
    nationality: "Liberian",
    documents: [
      { name: "Passport_Copy.pdf", type: "PDF", dateUploaded: "2023-10-27" },
    ],
  },
  {
    id: "2",
    firstName: "Jane",
    lastName: "Smith",
    email: "jane.smith@example.com",
    phone: "+250 788 654 321",
    joinDate: "2023-10-26",
    status: "Pending",
    membershipId: "ALM-002",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop",
    password: "password",
    county: "Nimba",
    profession: "Nurse",
    gender: "Female",
    dateOfBirth: "1990-08-20",
    district: "Musanze",
    sector: "Cyuve",
    membershipType: "Student",
    paymentStatus: "Unpaid",
    emergencyContact: {
      name: "Peter Smith",
      relation: "Father",
      phone: "+250 788 000 002",
    },
    nationality: "Liberian",
    documents: [],
  },
  {
    id: "3",
    firstName: "Samuel",
    lastName: "Jackson",
    email: "sam.j@example.com",
    phone: "+250 788 111 222",
    joinDate: "2023-10-25",
    status: "Active",
    membershipId: "ALM-003",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop",
    password: "password",
    county: "Bong",
    profession: "Engineer",
    gender: "Male",
    dateOfBirth: "1978-12-10",
    district: "Burera",
    sector: "Gahunga",
    membershipType: "Executive",
    role: "Treasurer",
    paymentStatus: "Paid",
    emergencyContact: {
      name: "Sarah Jackson",
      relation: "Wife",
      phone: "+250 788 000 003",
    },
    nationality: "Liberian",
    documents: [
      { name: "ID_Card.jpg", type: "Image", dateUploaded: "2023-10-25" },
    ],
  },
  {
    id: "4",
    firstName: "Emily",
    lastName: "White",
    email: "emily.w@example.com",
    phone: "+250 788 333 444",
    joinDate: "2023-10-24",
    status: "Suspended",
    membershipId: "ALM-004",
    avatar:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=200&auto=format&fit=crop",
    password: "password",
    county: "Maryland",
    profession: "Student",
    gender: "Female",
    dateOfBirth: "1995-03-30",
    district: "Musanze",
    sector: "Muhoza",
    membershipType: "Student",
    paymentStatus: "Overdue",
    emergencyContact: {
      name: "David White",
      relation: "Brother",
      phone: "+250 788 000 004",
    },
    nationality: "Liberian",
    documents: [],
  },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: "1",
    amount: 100,
    date: "July 15, 2024",
    status: "Completed",
    type: "Contribution",
    contributorName: "John Doe",
  },
  {
    id: "2",
    amount: 50,
    date: "June 08, 2024",
    status: "Completed",
    type: "Contribution",
    contributorName: "Samuel Jackson",
  },
  {
    id: "3",
    amount: 150,
    date: "May 21, 2024",
    status: "Pending",
    type: "Event Fee",
    contributorName: "Jane Smith",
  },
  {
    id: "4",
    amount: 250,
    date: "April 10, 2024",
    status: "Completed",
    type: "Contribution",
    contributorName: "Ciata Johnson",
  },
  {
    id: "5",
    amount: 100,
    date: "March 01, 2024",
    status: "Failed",
    type: "Contribution",
    contributorName: "Emily White",
  },
];

export const INITIAL_ALBUMS: Album[] = [
  {
    id: "1",
    title: "Graduation Ceremony 2025",
    photoCount: 54,
    date: "Oct 2025",
    type: "Event",
    coverImage:
      "https://scontent.fkgl2-1.fna.fbcdn.net/v/t39.30808-6/573297398_122110159443020460_8879073918611425316_n.jpg?_nc_cat=109&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeGfwbvgtXjmuH2VBH08ROkZ3AM6nNHWOgDcAzqc0dY6AL82EcwbrgxNitnVtpH2QhVzBHjDOk2IzdFjhp5IuFLo&_nc_ohc=RZoRH_Bnrb0Q7kNvwEek5Ee&_nc_oc=Adkq10gF0Ve20XaRQER7uBaj69JYgXhHLN9V0ZT9cqHfQ81LrNICqrn5Exmtkgg9oF0&_nc_zt=23&_nc_ht=scontent.fkgl2-1.fna&_nc_gid=nl6m2jJN0Xik3z-B_TSDmQ&oh=00_Afr8M5guapKimTuo_OXlRg675NOq0_HrdNNdRLy8CHqg3g&oe=696D9FE1",
  },
  {
    id: "2",
    title: "Community Trip",
    photoCount: 112,
    date: "Aug 2025",
    type: "Event",
    coverImage:
      "blob:https://web.whatsapp.com/cc496e9e-2a73-441c-9e66-3eff64c2f25e",
  },
  {
    id: "3",
    title: "Induction Day",
    photoCount: 76,
    date: "May 2023",
    type: "Event",
    coverImage:
      "blob:https://web.whatsapp.com/dea8e88d-d669-4417-9bfd-969a587f1553",
  },
  {
    id: "4",
    title: "Cultural Food",
    photoCount: 98,
    date: "Apr 2024",
    type: "Event",
    coverImage:
      "https://i.ytimg.com/vi/7oKVD1yTbTg/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLBgvd488l8fFudNz_0uuAaGcLFqpw",
  },
];

export const INITIAL_PHOTOS: Photo[] = [
  {
    id: "101",
    albumId: "1",
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuA43jLNTle5UYuxas_vtTJ6P9XvWZ2mk_wf--1fMNBhj-IRxyV377KbmgzxnajgoB19GDSw2RvKDurTO329wMNmy501BhAM63VCym4ILiKf3LMoTIdIGgJXNvUrHMoPgH2cxJE4pS1vvDO9kR4g5hyuq-JAzCSlZfkcjItH7EDb2Zsc5uloqrhu7LAko_zvFSHfIki7HKNePSlnlzorXhluUbmk-BympWLyE4OuIAN0JXAWAwGpPA-vCpwAArCbEairIy_0TNxIrVM",
    caption: "Gala Dinner",
  },
  {
    id: "102",
    albumId: "1",
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuBUjtKHJQVedLpdZAVUSDzrDyBQI_6KFfzqXVnS8VYMXEf0snhFM6vxckOwtkz-RQKksEVw79e57e2Nq7soCsvUPdLMQSr5_MKAkbioZOeVX_7A_Sdy5fmCncWYOA85p_0tpiF791qpfFvL7EBOPI3cN4ezEV561VhctROL4k5ZzlZokoz8tHj5O7ziGjrQSpzuMaUXLW_Fp7ZS02WQt1F8HN8m6y8pkCVjax4WoaGvjzeodWw4fHezo6FWvaHk6P_W3DEMR8VKVyE",
    caption: "Networking",
  },
  {
    id: "201",
    albumId: "2",
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuA7X4f1joZTe51YHPdqikBQ7FXkFx7eniwK_L36mvtb-ds_WQNqIXYeeuf8CK42Yy9axt-GWzlcjjy6K71SFEnnROsA11z-3rXZ5qf6Ju4sO5THMS7xgGP5CM9uFg3bslP2hG0EIGY-aTisUiSef1Nkf4aPceENFyk9jkRQhXDFexEjdmaMeN3L0KFGQlZWMZjY9V1xgk1zBFTDEqEbHiFbiXgoEW1XGjt6AC3q3YEZHHSerdGxH-dKW7SVxcVLxEaFF8o17M6GIFM",
    caption: "Picnic Fun",
  },
  {
    id: "301",
    albumId: "3",
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuATgExQl8zrU0Lx9O5_COnqHNdFTLMdE8e1XBo1x9oJDIDOLkub-dKMVK8j8_sqoSLpftUinX0szVjZvzJv13cIcYDqJnmknw72pGQu4tgd4PdAWw3_PeMAjoHE_0382ta7eEoddHL5lG6gBns-FWckAiMWZ9hKaYYJDTKqMUc6ZLtd4CsT12-D_aDTXt1lkpFqleIin9HPrnlH5IoEEteUmhdycGBCgsvONSTQ09GbCkmHE3qtO7Xhoqh7psSglUSiuP780N-Cb7Y",
    caption: "Cleaning Up",
  },
  {
    id: "401",
    albumId: "4",
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuDRBjCnGVkxm0QyeJ_LGbpK7hEmu_gwonHMqaQ34IQe7B0BYHLjh4N9tlBryoMWrdWe9Ldod1SZH5Jrs0jFaDEi-nk4dSEI1hO672ACGaSlEDgqIDqKhkhjh5vRMW8sVtewL5maEJx0YQfzahAgr5Ik5b4ALACBzY7GumyNMAH_RaLzq9CtJVU9gm6VvrSNbhb821mmokTsF7EDMud2ljzvTgobWM2TocQNsru9JcwD0z8Wzbd7QTemUa2vlpmsyJ2ZZ2o8VErcz54",
    caption: "Traditional Food",
  },
  // more photos reusing images for demo
  {
    id: "103",
    albumId: "1",
    url: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=2000&auto=format&fit=crop",
    caption: "Celebration",
  },
  {
    id: "104",
    albumId: "1",
    url: "https://images.unsplash.com/photo-1542601906990-b4d3fb7d5c73?q=80&w=2000&auto=format&fit=crop",
    caption: "Speeches",
  },
];

export const INITIAL_FEEDBACK: Feedback[] = [
  {
    id: "1",
    sender: "Kwame Appiah",
    email: "kwame.appiah@email.com",
    subject: "Suggestion for Community Events",
    message:
      "Hello, I was hoping we could organize more online meetups for our community members. With many of us having busy schedules, virtual events would be a great way to stay connected.",
    date: "Oct 26, 2023, 10:32 AM",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAJt0jDvd_GkaJJApuzmtKQA9rkoSqWr4HA35TML9H13nikScweA0Y1ZU7QkP9L83UviKgUStoTA4TRz68WduOiyrr93q4bTg0d866KOmIpjNTWoYF8Hr9tuxtjxEHUu0S307M9pdmRTndHsTfDQJNXxMNgFRB7AySSJKpuupdK5J72sCl1kdsGsCfDXXZm6xGmRZOc43XMVaf-j8X48eQZ42XGT-S1XUo_zPO1Np-eu7pLv-cpqOmMdabCnIfDgxF3jUHXaOGaUjY",
    status: "Unread",
    isRead: false,
  },
  {
    id: "2",
    sender: "Amina Kone",
    email: "amina.k@email.com",
    subject: "Question about Membership Fees",
    message:
      "Could you clarify the payment deadline for this year's fees? I am a bit confused about the grace period.",
    date: "Oct 25, 2023, 09:15 AM",
    avatar: "",
    status: "Unread",
    isRead: false,
  },
  {
    id: "3",
    sender: "John Doe",
    email: "john.doe@example.com",
    subject: "Website Bug Report",
    message:
      "The contact form on the website seems to be broken on mobile devices. I cannot click the submit button.",
    date: "Oct 23, 2023, 02:45 PM",
    avatar: "",
    status: "Unread",
    isRead: false,
  },
];
