export type ViewState =
  | "PUBLIC_HOME"
  | "PUBLIC_ABOUT"
  | "PUBLIC_EVENTS"
  | "PUBLIC_GALLERY"
  | "PUBLIC_FINANCE"
  | "PUBLIC_LEADERS"
  | "PUBLIC_CONTACT"
  | "AUTH_LOGIN"
  | "AUTH_REGISTER"
  | "MEMBER_HOME"
  | "MEMBER_EVENTS"
  | "MEMBER_PROFILE"
  | "MEMBER_FINANCE"
  | "MEMBER_GALLERY"
  | "MEMBER_FEEDBACK"
  | "ADMIN_DASHBOARD"
  | "ADMIN_MEMBERS"
  | "ADMIN_MEMBER_PROFILE"
  | "ADMIN_EVENTS"
  | "ADMIN_FINANCE"
  | "ADMIN_CONTENT"
  | "ADMIN_INBOX";

export enum ExecutiveCommitteePosition {
  PRESIDENT = "PRESIDENT",
  VICE_PRESIDENT = "VICE_PRESIDENT",
  SECRETARY_GENERAL = "SECRETARY_GENERAL",
  DEPUTY_SECRETARY_GENERAL = "DEPUTY_SECRETARY_GENERAL",
  TREASURER = "TREASURER",
  DEPUTY_TREASURER = "DEPUTY_TREASURER",
  ORGANIZING_SECRETARY = "ORGANIZING_SECRETARY",
  PUBLIC_RELATIONS_OFFICER = "PUBLIC_RELATIONS_OFFICER",
  LEGAL_ADVISOR = "LEGAL_ADVISOR",
  AUDITOR = "AUDITOR",
  MEMBER_AT_LARGE = "MEMBER_AT_LARGE",
  Financial_Secretary = "Financial_Secretary",
}
export const ExecutiveCommitteePositionOptions = [
  {
    value: ExecutiveCommitteePosition.PRESIDENT,
    label: "President",
  },
  {
    value: ExecutiveCommitteePosition.VICE_PRESIDENT,
    label: "Vice President",
  },
  {
    value: ExecutiveCommitteePosition.SECRETARY_GENERAL,
    label: "Secretary General",
  },
  {
    value: ExecutiveCommitteePosition.DEPUTY_SECRETARY_GENERAL,
    label: "Deputy Secretary General",
  },
  {
    value: ExecutiveCommitteePosition.TREASURER,
    label: "Treasurer",
  },
  {
    value: ExecutiveCommitteePosition.DEPUTY_TREASURER,
    label: "Deputy Treasurer",
  },
  {
    value: ExecutiveCommitteePosition.ORGANIZING_SECRETARY,
    label: "Organizing Secretary",
  },
  {
    value: ExecutiveCommitteePosition.PUBLIC_RELATIONS_OFFICER,
    label: "Public Relations Officer",
  },
  {
    value: ExecutiveCommitteePosition.LEGAL_ADVISOR,
    label: "Legal Advisor",
  },
  {
    value: ExecutiveCommitteePosition.AUDITOR,
    label: "Auditor",
  },
  {
    value: ExecutiveCommitteePosition.MEMBER_AT_LARGE,
    label: "Member at Large",
  },
];

export type UserRole = "MEMBER" | "ADMIN";

export interface Attendee {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: "Confirmed" | "Pending" | "Checked In" | "Cancelled" | "Rejected";
  registrationDate: string;
  ticketType?: string;
  attended?: boolean;
}

export interface EventSpeaker {
  id: string;
  name: string;
  title: string;
  avatar?: string;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  image: string;
  banner?: string;
  description: string;
  status: "Upcoming" | "Ongoing" | "Past" | "Cancelled" | "Draft" | "Published";
  rsvpCount?: number;
  category:
    | "Meeting"
    | "Training"
    | "Workshop"
    | "Cultural"
    | "Sports"
    | "Other";
  organizer: string;
  capacity?: number;
  price?: number; // 0 for free
  registrationRequired?: boolean;
  contactEmail?: string;
  attendees?: Attendee[];
  agenda?: {
    id: string;
    time: string;
    activity: string;
    description?: string;
  }[];
  speakers?: EventSpeaker[];
  attachments?: { name: string; url: string; size: string }[];
}

export interface EmergencyContact {
  name: string;
  relation: string;
  phone: string;
}

export interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  joinDate: string;
  status:
    | "Active"
    | "Pending"
    | "Suspended"
    | "Expired"
    | "Approved"
    | "Rejected"; // Mapped 'Approved' to 'Active' visually usually
  membershipId: string;
  avatar: string;
  password?: string;

  // New Fields
  gender: "Male" | "Female" | "Other";
  dateOfBirth: string;
  maritalStatus?: "Single" | "Married" | "Divorced" | "Widowed";
  nationality: string; // Default 'Liberian'

  // Location
  district: string;
  sector: string;
  cell?: string;

  // Membership Details
  membershipType: "Regular" | "Student" | "Executive" | "Honorary";
  paymentStatus: "Paid" | "Unpaid" | "Overdue";
  role?: string;
  position?: ExecutiveCommitteePosition;

  emergencyContact: EmergencyContact;
  documents?: { name: string; type: string; dateUploaded: string }[]; // Mock document list

  // Legacy fields kept for compatibility during migration
  county?: string;
  occupation?: string;
  bio?: string;
}

export interface Transaction {
  id: string;
  amount: number;
  date: string;
  status: "Completed" | "Pending" | "Failed";
  type: "Contribution" | "Donation" | "Event Fee";
  contributorName?: string; // For admin view
}

export interface Feedback {
  id: string;
  sender: string;
  email: string;
  subject: string;
  message: string;
  date: string;
  avatar: string;
  status: "Unread" | "Replied" | "Archived";
  isRead: boolean;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  icon: string;
}

export interface Album {
  id: string;
  title: string;
  photoCount: number;
  date: string;
  coverImage: string;
  type: "Event" | "Member";
}

export interface Photo {
  id: string;
  albumId: string;
  url: string;
  caption: string;
}

export interface LoginLog {
  id: string;
  userId: string;
  userName: string;
  email: string;
  role: UserRole;
  timestamp: string;
  status: "Success" | "Failed";
  ip?: string; // Simulated IP
}

export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const DAYS_OF_WEEK = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

export const getFirstDayOfMonth = (year: number, month: number): number => {
  return new Date(year, month, 1).getDay();
};

export const isSameDate = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

export const isToday = (date: Date): boolean => {
  return isSameDate(date, new Date());
};

export const generateYears = (
  currentYear: number,
  range: number = 10
): number[] => {
  const years = [];
  for (let i = currentYear - range; i <= currentYear + range; i++) {
    years.push(i);
  }
  return years;
};

export const getStartOfWeek = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day; // adjust when day is sunday
  return new Date(d.setDate(diff));
};

export const getEndOfWeek = (date: Date): Date => {
  const d = getStartOfWeek(date);
  d.setDate(d.getDate() + 6);
  return d;
};

export const isDateInRange = (
  date: Date,
  minDate?: Date,
  maxDate?: Date
): boolean => {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  if (minDate) {
    const min = new Date(
      minDate.getFullYear(),
      minDate.getMonth(),
      minDate.getDate()
    );
    if (d < min) return false;
  }
  if (maxDate) {
    const max = new Date(
      maxDate.getFullYear(),
      maxDate.getMonth(),
      maxDate.getDate()
    );
    if (d > max) return false;
  }
  return true;
};
