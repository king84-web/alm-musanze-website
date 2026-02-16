import {
  INITIAL_EVENTS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_TRANSACTIONS,
  INITIAL_ALBUMS,
  INITIAL_PHOTOS,
  INITIAL_FEEDBACK,
} from "@/store/mockdata";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  Event,
  Announcement,
  Member,
  Transaction,
  Album,
  Photo,
  Feedback,
  LoginLog,
  ViewState,
} from "@/types";
import { fetcher, setCookie } from "@/src/hooks/use-fetcher";
import { s } from "framer-motion/client";

type UserRole = "MEMBER" | "ADMIN";

type AdminUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar: string;
};

type CurrentUser = Member | AdminUser | null;

type ActionType =
  | "EDIT_MEMBER"
  | "ADD_MEMBER"
  | "EDIT_EVENT"
  | "EVENT_DETAILS"
  | "ADD_EVENT"
  | "EVENT_LIST";
interface AlmStore {
  // State
  role: UserRole;
  currentView: ViewState;
  currentUser: CurrentUser;
  events: Event[];
  members: Member[];
  announcements: Announcement[];
  transactions: Transaction[];
  albums: Album[];
  photos: Photo[];
  feedback: Feedback[];
  rsvpEventIds: string[];
  loginLogs: LoginLog[];
  selectedMember: Member | null;
  toast: { message: string; type: "success" | "error" } | null;
  currentAction: ActionType | null;
  selectedEvent: Event | null;
  loading: boolean;
  error: string | null;
  // Async Actions
  fetchMembers: () => Promise<void>;
  fetchEvents: () => Promise<void>;
  fetchCurrentUser: () => Promise<boolean>;

  // Selectors
  isSuspended: () => boolean;
  getMyProfile: () => Member | AdminUser | null;
  isAdmin: () => boolean;
  isMember: () => boolean;
  getCurrentMember: () => Member | null;

  // State Setters
  setRole: (role: UserRole) => void;
  setCurrentView: (view: ViewState) => void;
  setCurrentUser: (user: CurrentUser) => void;
  setEvents: (events: Event[]) => void;
  setMembers: (members: Member[]) => void;
  setAnnouncements: (announcements: Announcement[]) => void;
  setTransactions: (transactions: Transaction[]) => void;
  setAlbums: (albums: Album[]) => void;
  setPhotos: (photos: Photo[]) => void;
  setFeedback: (feedback: Feedback[]) => void;
  setRsvpEventIds: (ids: string[]) => void;
  setLoginLogs: (logs: LoginLog[]) => void;
  setSelectedMember: (member: Member | null) => void;
  setToast: (toast: AlmStore["toast"]) => void;
  setCurrentAction: (action: ActionType) => void;
  setSelectedEvent: (event: Event | null) => void;
  setHasUnsavedChanges: (value: boolean) => void;
  // Core Actions
  showToast: (message: string, type?: "success" | "error") => void;
  initializeStore: () => void;
  clearStore: () => void;

  // Auth Actions
  handleLogin: (
    email: string,
    password: string,
    mode: UserRole
  ) => Promise<boolean>;
  handleRegister: (
    newMemberData: Omit<
      Member,
      | "id"
      | "status"
      | "membershipId"
      | "joinDate"
      | "avatar"
      | "membershipType"
      | "paymentStatus"
      | "nationality"
    >
  ) => Promise<boolean>;
  handleLogout: () => void;
  toggleRole: () => void;
  navigateAction: <T>(action: ActionType, data?: T) => void;

  handleNavigate: (view: ViewState) => void;
  handleUpdateProfile: (updatedData: Partial<Member>) => Promise<boolean>;

  handleAddEvent: (
    newEvent: Omit<Event, "id" | "status" | "rsvpCount" | "attendees">
  ) => Promise<boolean>;
  handleUpdateEvent: (updatedEvent: Event) => Promise<boolean>;
  handleDeleteEvent: (id: string) => void;
  handleToggleRsvp: (eventId: string) => void;
  getEventById: (id: string) => Event | undefined;
  getUpcomingEvents: () => Event[];
  getPastEvents: () => Event[];

  // Member Actions
  handleAddMember: (newMember: Omit<Member, "id">) => Promise<boolean>;
  handleUpdateMember: (updatedMember: Member) => Promise<boolean>;
  handleDeleteMember: (id: string) => void;
  getMemberById: (id: string) => Member | undefined;
  getApprovedMembers: () => Member[];
  getPendingMembers: () => Member[];

  // Announcement Actions
  handleAddAnnouncement: (title: string, content: string) => void;
  handleUpdateAnnouncement: (
    id: string,
    title: string,
    content: string
  ) => void;
  handleDeleteAnnouncement: (id: string) => void;
  hasUnsavedChanges: boolean;

  // Feedback Actions
  handleFeedbackSubmit: (
    subject: string,
    message: string,
    senderEmail?: string,
    senderName?: string
  ) => void;
  handleDeleteFeedback: (id: string) => void;
  handleReplyFeedback: (id: string) => void;
  handleArchiveFeedback: (id: string) => void;
  handleMarkFeedbackAsRead: (id: string) => void;
  getUnreadFeedbackCount: () => number;

  // Transaction Actions
  handleAddTransaction: (newTx: Omit<Transaction, "id">) => void;
  handleDeleteTransaction: (id: string) => void;
  getTotalIncome: () => number;
  getTotalExpenses: () => number;
  getBalance: () => number;
}

const STORAGE_KEYS = {
  USER: "alm_user",
  ROLE: "alm_role",
  LOGS: "alm_logs",
  RSVPS: "alm_rsvps",
  MEMBERS: "alm_members",
  EVENTS: "alm_events",
  ANNOUNCEMENTS: "alm_announcements",
  TRANSACTIONS: "alm_transactions",
  FEEDBACK: "alm_feedback",
  TOKEN: "alm_auth",
} as const;

const ADMIN_CREDENTIALS = {
  email: "admin@alm.org",
  password: "admin",
  id: "admin-001",
} as const;

const TOAST_DURATION = 3000;

const DEFAULT_AVATAR =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuC_eNyYtW1vOcquJv4H2VbWCx2P1dONGfGzHxcO3eRAnxjKCqQ7kSI9YzqqjdQv0N2Xwv36HV5Pc5sFDy6rvHZLkAcpvFyVF3sgwwKW8TCXIpVt22L3NfWIi0R66VKkLXpIWL7iY4MTPEnfStuqnsJ3pe20wVKFGbJAOmWoA87BBWnvQxLdTFC1fZow1G5j7DAzKG9zspuhnbnPsmXv-I0m9bWuAJmlkghOn8Ks3svjyInfb8a7sxtt5DqsC7uMGoeGnB8dhKcMvNA";

const ADMIN_AVATAR =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDEvjKG1ss9-v3GWsmn1juUVjs3E9PxfFutd7B4mF7nJEX2vfHzDlJ4r6CcIsaegbRW5mjmyjwgSe2tQ8CIe0VaCWrUvSqP5HCmvnxYR2ZSbbJJyCtawLNRIhMb_842KbZ9oN4_OSGiMIA0_sJYP2er2zRMDhh6LJvjpeB5d71FzldiP9IBXjHVOtfEnYTXwHiYVOUdojv_YawrElbpwsHqzY2s5rWHwu3XMdTQzb7iAUIMUeaaF9qeTwD6_S3h08YF8e3yc641NXg";

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const generateId = () =>
  `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const generateMembershipId = () => {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `ALM-${year}-${random}`;
};

const getCurrentTimestamp = () => new Date().toLocaleString();

const getCurrentDate = () => {
  return new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getCurrentISODate = () => new Date().toISOString().split("T")[0];

const createAdminUser = (): AdminUser => ({
  id: ADMIN_CREDENTIALS.id,
  firstName: "ALM",
  lastName: "Admin",
  email: ADMIN_CREDENTIALS.email,
  avatar: ADMIN_AVATAR,
});

const createLoginLog = (
  userId: string,
  userName: string,
  email: string,
  role: UserRole,
  status: "Success" | "Failed" = "Success"
): LoginLog => ({
  id: generateId(),
  userId,
  userName,
  email,
  role,
  timestamp: getCurrentTimestamp(),
  status,
  ip: role === "ADMIN" ? "192.168.1.1" : "192.168.1.55",
});

const isAdminUser = (user: CurrentUser): user is AdminUser => {
  return user !== null && user.id === ADMIN_CREDENTIALS.id;
};

const isMemberUser = (user: CurrentUser): user is Member => {
  return user !== null && "membershipId" in user;
};

// ============================================================================
// STORAGE HELPERS
// ============================================================================

const saveToLocalStorage = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Failed to save ${key} to localStorage:`, error);
  }
};

const loadFromLocalStorage = <T>(key: string): T | null => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Failed to load ${key} from localStorage:`, error);
    return null;
  }
};

const removeFromLocalStorage = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Failed to remove ${key} from localStorage:`, error);
  }
};

// ============================================================================
// STORE IMPLEMENTATION
// ============================================================================

export const useAlmStore = create<AlmStore>()(
  persist(
    (set, get) => ({
      role: "MEMBER",
      currentView: "PUBLIC_HOME",
      currentUser: null,
      events: INITIAL_EVENTS,
      members: [],
      announcements: INITIAL_ANNOUNCEMENTS,
      transactions: [],
      albums: INITIAL_ALBUMS,
      photos: INITIAL_PHOTOS,
      feedback: INITIAL_FEEDBACK,
      rsvpEventIds: [],
      loginLogs: [],
      selectedMember: null,
      toast: null,
      currentAction: null,
      selectedEvent: null,
      loading: false,
      error: null,
      hasUnsavedChanges: false,
      isSuspended: () => get().getCurrentMember()?.status === "Suspended",
      getMyProfile: () => {
        if (!get().currentUser) return null;
        if (get().isSuspended()) {
          get().showToast(
            "Your account is suspended. Contact support.",
            "error"
          );
          get().setCurrentView("AUTH_LOGIN");
          return null;
        }
        return get().currentUser;
      },
      navigateAction: <T>(action: ActionType, data: T) => {
        switch (action) {
          case "EDIT_MEMBER":
            get().setSelectedMember(data as unknown as Member);
            get().setCurrentView("ADMIN_MEMBERS");
            get().setCurrentAction("EDIT_MEMBER");
            break;
          case "ADD_MEMBER":
            get().setSelectedMember(null);
            get().setCurrentView("ADMIN_MEMBERS");
            get().setCurrentAction("ADD_MEMBER");
            break;
          case "EDIT_EVENT":
            get().setSelectedEvent(data as unknown as Event);
            get().setCurrentView("ADMIN_EVENTS");
            get().setCurrentAction("EDIT_EVENT");
            break;
          case "EVENT_DETAILS":
            get().setSelectedEvent(data as unknown as Event);
            get().setCurrentView("ADMIN_EVENTS");
            get().setCurrentAction("EVENT_DETAILS");
            break;
          case "ADD_EVENT":
            get().setSelectedEvent(null);
            get().setCurrentView("ADMIN_EVENTS");
            get().setCurrentAction("ADD_EVENT");
            break;
          case "EVENT_LIST":
            get().setSelectedEvent(null);
            get().setCurrentView("ADMIN_EVENTS");
            get().setCurrentAction("EVENT_LIST");
            break;
          default:
            break;
        }
      },
      isAdmin: () => {
        return get().role === "ADMIN" && isAdminUser(get().currentUser);
      },

      isMember: () => {
        return get().role === "MEMBER" && isMemberUser(get().currentUser);
      },

      getCurrentMember: () => {
        const user = get().currentUser;
        return isMemberUser(user) ? user : null;
      },

      getEventById: (id: string) => {
        return get().events.find((e) => e.id === id);
      },

      getUpcomingEvents: () => {
        return get().events.filter((e) => e.status === "Upcoming");
      },

      getPastEvents: () => {
        return get().events.filter(
          (e) => e.status === ("Completed" as AlmStore["events"][0]["status"])
        );
      },

      getMemberById: (id: string) => {
        return get().members.find((m) => m.id === id);
      },

      getApprovedMembers: () => {
        return get().members.filter(
          (m) => m.status === ("Approved" as AlmStore["members"][0]["status"])
        );
      },

      getPendingMembers: () => {
        return get().members.filter(
          (m) => m.status === ("Pending" as AlmStore["members"][0]["status"])
        );
      },

      getUnreadFeedbackCount: () => {
        return get().feedback.filter((f) => !f.isRead).length;
      },

      getTotalIncome: () => {
        return get()
          .transactions.filter(
            (t) => t.type === ("income" as AlmStore["transactions"][0]["type"])
          )
          .reduce((sum, t) => sum + t.amount, 0);
      },

      getTotalExpenses: () => {
        return get()
          .transactions.filter(
            (t) => t.type === ("expense" as AlmStore["transactions"][0]["type"])
          )
          .reduce((sum, t) => sum + t.amount, 0);
      },

      getBalance: () => {
        return get().getTotalIncome() - get().getTotalExpenses();
      },

      // ========================================================================
      // BASIC SETTERS
      // ========================================================================
      setRole: (role) => set({ role }),
      setCurrentView: (view) => set({ currentView: view }),
      setCurrentUser: (user) => set({ currentUser: user }),
      setEvents: (events) => set({ events }),
      setMembers: (members) => set({ members }),
      setAnnouncements: (announcements) => set({ announcements }),
      setTransactions: (transactions) => set({ transactions }),
      setAlbums: (albums) => set({ albums }),
      setPhotos: (photos) => set({ photos }),
      setFeedback: (feedback) => set({ feedback }),
      setRsvpEventIds: (ids) => set({ rsvpEventIds: ids }),
      setLoginLogs: (logs) => set({ loginLogs: logs }),
      setSelectedMember: (member) => set({ selectedMember: member }),
      setToast: (toast) => set({ toast }),
      setCurrentAction: (action) => set({ currentAction: action }),
      setSelectedEvent: (event) => set({ selectedEvent: event }),

      // ========================================================================
      // TOAST SYSTEM
      // ========================================================================
      showToast: (message, type = "success") => {
        set({ toast: { message, type } });
        setTimeout(() => set({ toast: null }), TOAST_DURATION);
      },

      // ========================================================================
      // INITIALIZATION
      // ========================================================================
      initializeStore: () => {
        try {
          const storedUser = loadFromLocalStorage<CurrentUser>(
            STORAGE_KEYS.USER
          );
          const storedRole = loadFromLocalStorage<UserRole>(STORAGE_KEYS.ROLE);
          const storedLogs = loadFromLocalStorage<LoginLog[]>(
            STORAGE_KEYS.LOGS
          );
          const storedRsvps = loadFromLocalStorage<string[]>(
            STORAGE_KEYS.RSVPS
          );

          if (storedUser && storedRole) {
            set({
              currentUser: storedUser,
              role: storedRole,
              currentView:
                storedRole === "ADMIN" ? "ADMIN_DASHBOARD" : "MEMBER_HOME",
            });
          }

          if (storedLogs) set({ loginLogs: storedLogs });
          if (storedRsvps) set({ rsvpEventIds: storedRsvps });
        } catch (error) {
          console.error("Failed to initialize store:", error);
          get().clearStore();
        }
      },

      clearStore: () => {
        Object.values(STORAGE_KEYS).forEach(removeFromLocalStorage);
        set({
          role: "MEMBER",
          currentView: "PUBLIC_HOME",
          currentUser: null,
          rsvpEventIds: [],
        });
      },

      // ========================================================================
      // AUTHENTICATION
      // ========================================================================
      handleLogin: async (
        email: string,
        password: string,
        mode: "ADMIN" | "MEMBER"
      ) => {
        const normalizedEmail = email.toLowerCase().trim();

        try {
          // Send credentials to backend for verification
          const { data, success, error } = await fetcher("/auth/login", {
            method: "POST",
            useToken: false,
            body: {
              email: normalizedEmail,
              password,
              role: mode,
            },
          });

          if (!success || error || !data?.token) {
            // Login failed
            const failedLog = createLoginLog(
              "UNKNOWN",
              `${mode} Login Failed`,
              normalizedEmail,
              mode,
              "Failed"
            );
            set({ loginLogs: [failedLog, ...get().loginLogs] });
            get().showToast(`${error || "Invalid credentials"}`, "error");
            return false;
          }
          const user = data.user;
          const token = data.token;
          const loginLog = createLoginLog(
            user.id,
            `${user.firstName || ""} ${user.lastName || ""}`,
            normalizedEmail,
            mode
          );
          const newLogs = [loginLog, ...get().loginLogs];

          set({
            currentUser: user,
            role: mode,
            loginLogs: newLogs,
            currentView: mode === "ADMIN" ? "ADMIN_DASHBOARD" : "MEMBER_HOME",
          });

          saveToLocalStorage(STORAGE_KEYS.USER, user);
          saveToLocalStorage(STORAGE_KEYS.ROLE, mode);
          saveToLocalStorage(STORAGE_KEYS.LOGS, newLogs);
          setCookie("Authorization_token", token);

          get().showToast(
            `Welcome ${user.firstName || (mode === "ADMIN" ? "Administrator" : "")}!`
          );
          return true;
        } catch (err) {
          console.error(`${mode} login error:`, err);
          get().showToast(`An error occurred during ${mode} login`, "error");
          return false;
        }
      },

      handleRegister: async (newMemberData) => {
        const normalizedEmail = newMemberData.email.toLowerCase().trim();
        try {
          const { data, success, error } = await fetcher<{
            member: Member;
            token: string;
            message: string;
          }>("/auth/register", {
            method: "POST",
            useToken: false,
            body: {
              ...newMemberData,
              dateOfBirth: newMemberData.dateOfBirth,
              email: normalizedEmail,
              nationality: "Liberian",
              role: "MEMBER",
            },
          });

          if (success && data) {
            const newMember: Member = {
              ...data.member,
              status: "Pending",
              avatar: DEFAULT_AVATAR,
              documents: [],
            };

            const loginLog = createLoginLog(
              newMember.id,
              `${newMember.firstName} ${newMember.lastName}`,
              normalizedEmail,
              "MEMBER"
            );

            const newLogs = [loginLog, ...get().loginLogs];
            const updatedMembers = [newMember, ...get().members];
            set({
              members: updatedMembers,
              currentUser: newMember,
              role: "MEMBER",
              loginLogs: newLogs,
              currentView: "MEMBER_HOME",
            });

            saveToLocalStorage(STORAGE_KEYS.USER, newMember);
            saveToLocalStorage(STORAGE_KEYS.ROLE, "MEMBER");
            saveToLocalStorage(STORAGE_KEYS.LOGS, newLogs);

            get().showToast("Registration successful! Welcome to ALM.");
            return true;
          } else {
            // Backend returned an error
            get().showToast(
              error || "Registration failed. Try again.",
              "error"
            );
            return false;
          }
        } catch (err) {
          get().showToast("An error occurred during registration.", "error");
          return false;
        }
      },

      handleLogout: () => {
        set({
          currentView: "AUTH_LOGIN",
          role: "MEMBER",
          currentUser: null,
          rsvpEventIds: [],
        });

        removeFromLocalStorage(STORAGE_KEYS.USER);
        removeFromLocalStorage(STORAGE_KEYS.ROLE);
        removeFromLocalStorage(STORAGE_KEYS.RSVPS);
      },

      toggleRole: () => {
        const currentRole = get().role;
        const newRole: UserRole = currentRole === "MEMBER" ? "ADMIN" : "MEMBER";

        // Prevent non-admin users from switching to admin
        if (newRole === "ADMIN" && !isAdminUser(get().currentUser)) {
          get().showToast("Access denied. Admin privileges required.", "error");
          return;
        }

        const newView: ViewState =
          newRole === "MEMBER" ? "MEMBER_HOME" : "ADMIN_DASHBOARD";

        set({ role: newRole, currentView: newView });
        saveToLocalStorage(STORAGE_KEYS.ROLE, newRole);

        get().showToast(
          `Switched to ${
            newRole === "MEMBER" ? "member" : "administrator"
          } view`
        );
      },

      // ========================================================================
      // NAVIGATION
      // ========================================================================
      handleNavigate: (view) => {
        const hasUnsavedChanges = get().hasUnsavedChanges;

        if (hasUnsavedChanges) {
          const confirmed = window.confirm(
            "You have unsaved changes. Do you really want to leave this page?"
          );
          if (!confirmed) return;
          set({ hasUnsavedChanges: false, currentAction: null });
        }
        window.scrollTo({ top: 0, behavior: "smooth" });
        set({ currentView: view });
      },

      setHasUnsavedChanges: (value: boolean) =>
        set({ hasUnsavedChanges: value }),
      // ========================================================================
      // PROFILE MANAGEMENT
      // ========================================================================
      handleUpdateProfile: async (updatedData) => {
        const currentUser = get().currentUser;

        if (!isMemberUser(currentUser)) {
          get().showToast("Only members can update their profile", "error");
          return false;
        }
        try {
          const { data, success, error } = await fetcher(
            `/members/${currentUser.id}/edit-profile`,
            {
              method: "PUT",
              useToken: true,
              body: updatedData,
            }
          );

          if (!success || error) {
            get().showToast(error || "Failed to update profile", "error");
            return false;
          }

          const updatedMember: Member = {
            ...currentUser,
            ...updatedData,
          };

          set({
            currentUser: updatedMember,
          });
          get().showToast("Profile updated successfully!");
          return true;
        } catch (error) {
          console.error("Failed to update profile:", error);
          get().showToast(
            "Failed to update profile. Try again later.",
            "error"
          );
          return false;
        }
      },

      // ========================================================================
      // EVENT MANAGEMENT
      // ========================================================================
      handleAddEvent: async (newEvent) => {
        const event: Event = {
          ...newEvent,
          id: generateId(),
          status: "Upcoming",
          rsvpCount: 0,
          attendees: [],
          speakers: newEvent.speakers || [],
          agenda: newEvent.agenda || [],
          attachments: newEvent.attachments || [],
          registrationRequired: newEvent.registrationRequired || false,
        };
        try {
          const response = await fetcher("/events", {
            method: "POST",
            useToken: true,
            body: event,
          });
          if (response.success && response.data && !response.error) {
            set({ events: [event, ...get().events] });
            get().showToast("Event created successfully!");
            get().setCurrentView("ADMIN_EVENTS");
            return true;
          } else {
            get().showToast(
              response.error || "Failed to create event",
              "error"
            );
            return false;
          }
        } catch (error) {
          console.error("Failed to add event:", error);
          get().showToast("Failed to create event. Try again later.", "error");
        }
      },

      handleUpdateEvent: async (updatedEvent) => {
        try {
          const { data, success, error } = await fetcher(
            `/events/${updatedEvent.id}`,
            {
              method: "PUT",
              useToken: true,
              body: updatedEvent,
            }
          );
          if (!success || error || !data) {
            get().showToast(error || "Failed to update event", "error");
            return false;
          }
          set({
            events: get().events.map((e) =>
              e.id === updatedEvent.id ? updatedEvent : e
            ),
          });
          get().setCurrentView("ADMIN_EVENTS");
          get().showToast("Event updated successfully!");
          return true;
        } catch (error) {
          console.error("Failed to update event:", error);
          get().showToast("Failed to update event. Try again later.", "error");
          return false;
        }
      },

      handleDeleteEvent: (id) => {
        set({
          events: get().events.filter((e) => e.id !== id),
          rsvpEventIds: get().rsvpEventIds.filter((eventId) => eventId !== id),
        });
        get().showToast("Event deleted.");
      },

      handleToggleRsvp: async (eventId: string) => {
        const { rsvpEventIds, events } = get();
        const isAttending = rsvpEventIds.includes(eventId);

        // -------- optimistic state --------
        const optimisticRsvps = isAttending
          ? rsvpEventIds.filter((id) => id !== eventId)
          : [...rsvpEventIds, eventId];

        const optimisticEvents = events.map((e) =>
          e.id === eventId
            ? {
                ...e,
                rsvpCount: Math.max(
                  0,
                  (e.rsvpCount || 0) + (isAttending ? -1 : 1)
                ),
              }
            : e
        );

        // Apply optimistic update
        set({
          rsvpEventIds: optimisticRsvps,
          events: optimisticEvents,
        });

        saveToLocalStorage(STORAGE_KEYS.RSVPS, optimisticRsvps);

        try {
          const { success, error } = await fetcher(`/events/${eventId}/rsvp`, {
            useToken: true,
            method: "POST",
          });

          if (!success || error) {
            throw new Error("Server rejected RSVP");
          }

          get().showToast(
            isAttending ? "RSVP cancelled" : "You're attending this event!"
          );
        } catch (err) {
          set({
            rsvpEventIds,
            events,
          });
          saveToLocalStorage(STORAGE_KEYS.RSVPS, rsvpEventIds);
          get().showToast("Failed to toggle RSVP. Try again later.", "error");
        }
      },

      fetchMembers: async () => {
        set({ loading: true, error: null });
        try {
          const {
            data: response,
            error,
            status,
            success,
          } = await fetcher("/admin/members", {
            useToken: true,
          });

          if (status === 401) {
            get().showToast("Unauthorized. Please log in again.", "error");
            get().handleLogout();
          }
          const data: Member[] = response.data;
          if (response.success && response.data && !response.error) {
            set({ members: data, loading: false });
          } else {
            get().showToast(error || "Failed to fetch members", "error");
            set({
              loading: false,
              error: error || "Failed to fetch members",
              members: [],
            });
          }
        } catch (err: any) {
          set({ error: err.message || "Unknown error", loading: false });
        }
      },

      fetchEvents: async () => {
        set({ loading: true, error: null });
        try {
          const {
            data: response,
            success,
            error,
          } = await fetcher("/events", {
            useToken: true,
          });
          const data: Event[] = response.data;

          if (success && response.data && !error) {
            set({ events: data, loading: false });
            if (get().currentView === "ADMIN_EVENTS")
              get().showToast("Events loaded successfully.");
            set({
              events: data,
              loading: false,
              rsvpEventIds: get().rsvpEventIds.filter((eventId) =>
                data.some((e) => e.id === eventId)
              ),
            });
          } else {
            get().showToast(
              response.error || "Failed to fetch events",
              "error"
            );
            set({
              loading: false,
              error: response.error || "Failed to fetch events",
              events: [],
            });
          }
        } catch (err: any) {
          set({ error: err.message || "Unknown error", loading: false });
        }
      },
      fetchCurrentUser: async () => {
        const user = get().currentUser;
        if (!user) return;
        set({ loading: true, error: null });
        try {
          const { data, success, error, status } = await fetcher(
            "/profile/me",
            {
              useToken: true,
            }
          );

          if (!success || error || !data) {
            get().showToast(error || "Failed to fetch user data", "error");

            set({
              loading: false,
              error: error || "Failed to fetch user data",
            });
            if (status === 401) {
              get().handleLogout();
              get().showToast("Unauthorized. Please log in again.", "error");
            }
            return false;
          }

          const user = data.user;
          const currentRole = get().role;
          set({
            currentUser: user,
            loading: false,
          });

          // Update localStorage
          saveToLocalStorage(STORAGE_KEYS.USER, user);
          if (isMemberUser(user) && currentRole === "MEMBER") {
            const updatedMembers = get().members.map((m) =>
              m.id === user.id ? user : m
            );
            set({ members: updatedMembers });
          }

          return true;
        } catch (err: any) {
          set({
            error: err.message || "Unknown error",
            loading: false,
          });
          get().showToast("Failed to refresh user data", "error");
          return false;
        }
      },
      // ========================================================================
      // MEMBER MANAGEMENT
      // ========================================================================
      handleAddMember: async (newMember) => {
        try {
          const res = await fetcher("/members/create", {
            method: "POST",
            useToken: true,
            headers: { "Content-Type": "application/json" },
            body: {
              ...newMember,
              RequestBy: get().role,
            },
          });
          if (res.status === 401) {
            get().showToast("Unauthorized. Please log in again.", "error");
            get().handleLogout();
            return false;
          }
          if (!res.data || !res.success || res.error) {
            const err = res.error || new Error("Failed to register member");
            get().showToast(
              err.toString() || "Failed to register member",
              "error"
            );
            return false;
          }

          const savedMember = res.data;

          set({ members: [savedMember, ...get().members] });
          // set({ currentView: "ADMIN_MEMBERS" });
          get().showToast("New member registered.", "success");
          return true;
        } catch (error) {
          console.error(error);
          get().showToast("Server error. Try again later.", "error");
          return false;
        }
      },

      handleUpdateMember: async (updatedMemberData) => {
        const memberId = updatedMemberData.id;

        try {
          const res = await fetcher(`/members/${memberId}`, {
            method: "PUT",
            useToken: true,
            body: updatedMemberData,
          });

          if (!res.success || res.error || !res.data) {
            set({ error: res.error || "Failed to update member" });
            get().showToast(res.error || "Failed to update member", "error");
            return false;
          }

          // 2. Updated member returned from backend
          const updatedMember = await res.data;

          const updatedMembers = get().members.map((m) =>
            m.id === updatedMember.id ? updatedMember : m
          );

          set({ members: updatedMembers });

          // 4. Update selectedMember if currently selected
          if (get().selectedMember?.id === updatedMember.id) {
            set({ selectedMember: updatedMember });
          }

          if (get().currentUser?.id === updatedMember.id) {
            set({ currentUser: updatedMember });
            saveToLocalStorage(STORAGE_KEYS.USER, updatedMember);
          }

          // 6. Success toast
          get().showToast("Member updated successfully.", "success");
          return true;
        } catch (error: any) {
          get().showToast(error.message, "error");
        }
      },

      handleDeleteMember: (id) => {
        set({ members: get().members.filter((m) => m.id !== id) });

        // Clear selected member if it's the one being deleted
        if (get().selectedMember?.id === id) {
          set({ selectedMember: null, currentView: "ADMIN_MEMBERS" });
        }

        get().showToast("Member removed.");
      },

      // ========================================================================
      // ANNOUNCEMENT MANAGEMENT
      // ========================================================================
      handleAddAnnouncement: (title, content) => {
        const newAnnouncement: Announcement = {
          id: generateId(),
          title,
          content,
          date: getCurrentDate(),
          icon: "campaign",
        };

        set({ announcements: [newAnnouncement, ...get().announcements] });
        get().showToast("Announcement published.");
      },

      handleUpdateAnnouncement: (id, title, content) => {
        set({
          announcements: get().announcements.map((a) =>
            a.id === id ? { ...a, title, content } : a
          ),
        });
        get().showToast("Announcement updated.");
      },

      handleDeleteAnnouncement: (id) => {
        set({
          announcements: get().announcements.filter((a) => a.id !== id),
        });
        get().showToast("Announcement deleted.");
      },

      // ========================================================================
      // FEEDBACK MANAGEMENT
      // ========================================================================
      handleFeedbackSubmit: (
        subject,
        message,
        senderEmail = "guest@example.com",
        senderName = "Guest"
      ) => {
        const newFeedback: Feedback = {
          id: generateId(),
          subject,
          message,
          sender: senderName,
          email: senderEmail,
          date: getCurrentTimestamp(),
          status: "Unread",
          isRead: false,
          avatar: DEFAULT_AVATAR,
        };

        set({ feedback: [newFeedback, ...get().feedback] });
        get().showToast("Message sent! We'll get back to you soon.");
      },

      handleDeleteFeedback: (id) => {
        set({ feedback: get().feedback.filter((f) => f.id !== id) });
        get().showToast("Message deleted.");
      },

      handleReplyFeedback: (id) => {
        set({
          feedback: get().feedback.map((f) =>
            f.id === id ? { ...f, status: "Replied", isRead: true } : f
          ),
        });
        get().showToast("Reply sent.");
      },

      handleArchiveFeedback: (id) => {
        set({
          feedback: get().feedback.map((f) =>
            f.id === id ? { ...f, status: "Archived", isRead: true } : f
          ),
        });
        get().showToast("Message archived.");
      },

      handleMarkFeedbackAsRead: (id) => {
        set({
          feedback: get().feedback.map((f) =>
            f.id === id ? { ...f, isRead: true } : f
          ),
        });
      },

      // ========================================================================
      // TRANSACTION MANAGEMENT
      // ========================================================================
      handleAddTransaction: (newTx) => {
        const transaction: Transaction = {
          ...newTx,
          id: generateId(),
        };

        set({ transactions: [transaction, ...get().transactions] });
        get().showToast("Transaction recorded.");
      },

      handleDeleteTransaction: (id) => {
        set({ transactions: get().transactions.filter((t) => t.id !== id) });
        get().showToast("Transaction deleted.");
      },
    }),
    {
      name: "alm-store",
      partialize: (state) => ({
        currentView: state.currentView,
        role: state.role,
        currentUser: state.currentUser,
        selectedEvent: state.selectedEvent,
        currentAction: state.currentAction,
        selectedMember:
          state.currentView === "ADMIN_MEMBER_PROFILE"
            ? state.selectedMember
            : null,
      }),
    }
  )
);

export const useCurrentUser = () => useAlmStore((state) => state.currentUser);
export const useCurrentRole = () => useAlmStore((state) => state.role);
export const useIsAdmin = () => useAlmStore((state) => state.isAdmin());
export const useIsMember = () => useAlmStore((state) => state.isMember());
export const useCurrentMember = () =>
  useAlmStore((state) => state.getCurrentMember());
