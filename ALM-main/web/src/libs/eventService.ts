import { fetcher } from "../hooks/use-fetcher";

interface EventFilters {
  status?: string; // e.g., 'upcoming', 'past'
  category?: string;
}

interface EventPayload {
  title: string;
  location: string;
  date: string | Date;
  capacity: number;
  description?: string;
  category?: string;
}

interface RSVPUpdate {
  eventId: string;
  userId: string;
  status: "attending" | "not_attending";
}

const EventsService = {
  getAllEvents: async (filters?: EventFilters) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append("status", filters.status);
    if (filters?.category) params.append("category", filters.category);

    const query = params.toString()
      ? `/events?${params.toString()}`
      : "/events";
    return fetcher(query, { method: "GET", useToken: true });
  },

  getEventById: async (eventId: string) => {
    return fetcher(`/events/${eventId}`, { method: "GET", useToken: true });
  },

  createEvent: async (payload: EventPayload) => {
    return fetcher("/events", {
      method: "POST",
      body: JSON.stringify(payload),
      useToken: true,
      headers: { "Content-Type": "application/json" },
    });
  },

  updateEvent: async (eventId: string, payload: Partial<EventPayload>) => {
    return fetcher(`/events/${eventId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
      useToken: true,
      headers: { "Content-Type": "application/json" },
    });
  },

  deleteEvent: async (eventId: string) => {
    return fetcher(`/events/${eventId}`, {
      method: "DELETE",
      useToken: true,
    });
  },

  updateRSVP: async (payload: RSVPUpdate) => {
    return fetcher(`/events/${payload.eventId}/rsvp`, {
      method: "POST",
      body: JSON.stringify({ userId: payload.userId, status: payload.status }),
      useToken: true,
      headers: { "Content-Type": "application/json" },
    });
  },

  getRSVPCount: async (eventId: string) => {
    return fetcher(`/events/${eventId}/rsvp-count`, {
      method: "GET",
      useToken: true,
    });
  },
};

export default EventsService;
