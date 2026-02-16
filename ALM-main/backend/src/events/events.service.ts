import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Event, Prisma } from '@/generated/prisma-client/client';
import { CreateEventDTO, UpdateEventDTO } from './dto/create-event';
import { format } from 'date-fns';
import { timeout } from 'rxjs';

// DTOs
export class EventFilterDto {
  status?: string;
  category?: string;
  search?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number = 10;
  offset?: number = 0;
  orderBy?: 'createdAt' | 'date' | 'title' = 'createdAt';
  orderDirection?: 'asc' | 'desc' = 'desc';
}

export interface PaginatedEvents {
  data: any[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
    totalPages: number;
    currentPage: number;
  };
}

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new event with related entities
   */
  async create(data: CreateEventDTO) {
    try {
      const eventDate = new Date(data.date);
      if (eventDate < new Date()) {
        throw new BadRequestException('Event date cannot be in the past');
      }

      const event = await this.prisma.event.create({
        data: {
          title: data.title,
          date: eventDate,
          startTime: data.time,
          category: data.category,
          location: data.location || '',
          description: data.description || '',
          image: data.image || '',
          status: data.status || 'Upcoming',
          registrationRequired: data.registrationRequired ?? false,
          speakers: data.speakers?.length
            ? { create: data.speakers }
            : undefined,
          agenda: data.agenda?.length ? { create: data.agenda } : undefined,
          attachments: data.attachments?.length
            ? { create: data.attachments }
            : undefined,
        },
        include: {
          speakers: true,
          agenda: true,
          attachments: true,
          _count: {
            select: { attendees: true },
          },
        },
      });

      this.logger.log(`Event created: ${event.id} - ${event.title}`);
      return event;
    } catch (error) {
      this.logger.error('Error creating event:', error);

      if (error instanceof BadRequestException) {
        throw error;
      }

      if (error.code === 'P2002') {
        throw new ConflictException('An event with this title already exists');
      }

      throw new InternalServerErrorException(
        'Failed to create event. Please check your input data.',
      );
    }
  }

  /**
   * Find all events with advanced filtering and pagination
   */
  async findAll(filter?: EventFilterDto): Promise<PaginatedEvents> {
    try {
      const where = this.buildWhereClause(filter);
      const orderBy = this.buildOrderByClause(filter);
      const take = filter?.limit || 10;
      const skip = filter?.offset || 0;

      const [events, total] = await Promise.all([
        this.prisma.event.findMany({
          where,
          include: {
            speakers: true,
            agenda: true,
            attachments: true,
            attendees: true,
            _count: {
              select: { attendees: true },
            },
          },
          orderBy,
          take,
          skip,
        }),
        this.prisma.event.count({ where }),
      ]);

      this.logger.log(
        `Retrieved ${events.length} events out of ${total} total`,
      );

      return this.buildPaginatedResponse(events, total, filter);
    } catch (error) {
      this.logger.error('Error fetching events:', error);
      throw new InternalServerErrorException('Failed to fetch events');
    }
  }

  /**
   * Find a single event by ID with full details
   */
  async findOne(id: string) {
    try {
      const event = await this.prisma.event.findUnique({
        where: { id },
        include: {
          speakers: true,
          agenda: {
            orderBy: {
              time: 'asc',
            },
          },
          attachments: true,
          attendees: {
            include: {
              member: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  avatar: true,
                },
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      });

      if (!event) {
        throw new NotFoundException(`Event with ID ${id} not found`);
      }

      return event;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      this.logger.error(`Error fetching event ${id}:`, error);
      throw new InternalServerErrorException('Failed to fetch event');
    }
  }

  /**
   * Update an event with validation
   */
  async update(id: string, data: UpdateEventDTO) {
    try {
      // Check if event exists
      await this.findOne(id);

      // Validate date if provided
      if (data.date) {
        const eventDate = new Date(data.date);
        if (eventDate < new Date()) {
          throw new BadRequestException('Event date cannot be in the past');
        }
      }

      const event = await this.prisma.event.update({
        where: { id },
        data: {
          ...(data.title && { title: data.title }),
          ...(data.date && { date: new Date(data.date).toISOString() }),
          ...(data.time && { startTime: data.time }),
          ...(data.category && { category: data.category }),
          ...(data.location !== undefined && { location: data.location }),
          ...(data.description !== undefined && {
            description: data.description,
          }),
          ...(data.image !== undefined && { image: data.image }),
          ...(data.status && { status: data.status }),
          ...(data.registrationRequired !== undefined && {
            registrationRequired: data.registrationRequired,
          }),
          ...(data.eventfee !== undefined && { eventfee: data.eventfee }),
          ...(data.contactEmail !== undefined && {
            contactEmail: data.contactEmail,
          }),
          ...(data.maxAttendees !== undefined && {
            maxAttendees: data.maxAttendees,
          }),
          ...(data.attachments && {
            attachments: {
              deleteMany: {},
              create: data.attachments,
            },
          }),
          ...(data.agenda && {
            agenda: {
              deleteMany: {},
              create: data.agenda,
            },
          }),

          ...(data.speakers && {
            speakers: {
              deleteMany: {},
              create: data.speakers,
            },
          }),
        },
        include: {
          speakers: true,
          agenda: true,
          attachments: true,
          _count: {
            select: { attendees: true },
          },
        },
      });

      this.logger.log(`Event updated: ${id}`);
      return event;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      this.logger.error(`Error updating event ${id}:`, error);
      throw new InternalServerErrorException('Failed to update event');
    }
  }

  /**
   * Soft delete an event (or hard delete if no attendees)
   */
  async delete(id: string) {
    try {
      // Check if event exists and has attendees
      const event = await this.findOne(id);

      if (event.attendees.length > 0) {
        // Soft delete by changing status
        await this.prisma.event.update({
          where: { id },
          data: { status: 'Cancelled' },
        });

        this.logger.warn(
          `Event ${id} soft deleted (has ${event.attendees.length} attendees)`,
        );
        return {
          message: 'Event cancelled successfully (attendees will be notified)',
          cancelled: true,
        };
      }

      // Hard delete if no attendees
      await this.prisma.event.delete({ where: { id } });

      this.logger.log(`Event ${id} permanently deleted`);
      return {
        message: 'Event deleted successfully',
        cancelled: false,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      this.logger.error(`Error deleting event ${id}:`, error);
      throw new InternalServerErrorException('Failed to delete event');
    }
  }

  /**
   * Toggle RSVP for an event with transaction safety
   */
  async toggleRsvp(eventId: string, memberId: string) {
    try {
      // Verify event exists
      const event = await this.findOne(eventId);

      // Check if event is open for registration
      if (event.status === 'Cancelled') {
        throw new BadRequestException('Cannot RSVP to a cancelled event');
      }

      if (event.status === 'Completed') {
        throw new BadRequestException('Cannot RSVP to a completed event');
      }

      const existingRsvp = await this.prisma.eventRSVP.findUnique({
        where: {
          eventId_memberId: {
            eventId,
            memberId,
          },
        },
      });

      if (existingRsvp) {
        // Remove RSVP with transaction
        await this.prisma.$transaction([
          this.prisma.eventRSVP.delete({
            where: { id: existingRsvp.id },
          }),
          this.prisma.event.update({
            where: { id: eventId },
            data: { rsvpCount: { decrement: 1 } },
          }),
        ]);

        this.logger.log(`RSVP cancelled: event ${eventId}, member ${memberId}`);
        return {
          message: 'RSVP cancelled successfully',
          isAttending: false,
        };
      } else {
        // Add RSVP with transaction
        await this.prisma.$transaction([
          this.prisma.eventRSVP.create({
            data: { eventId, memberId },
          }),
          this.prisma.event.update({
            where: { id: eventId },
            data: { rsvpCount: { increment: 1 } },
          }),
        ]);

        this.logger.log(`RSVP created: event ${eventId}, member ${memberId}`);
        return {
          message: "You're attending this event!",
          isAttending: true,
        };
      }
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      if (error.code === 'P2002') {
        throw new ConflictException('RSVP already exists');
      }

      this.logger.error('Error toggling RSVP:', error);
      throw new InternalServerErrorException('Failed to process RSVP');
    }
  }

  /**
   * Get all events a member has RSVP'd to
   */
  async getMyRsvps(memberId: string, includeCompleted: boolean = false) {
    try {
      const where: Prisma.EventRSVPWhereInput = {
        memberId,
        ...(!includeCompleted && {
          event: {
            status: {
              notIn: ['Completed', 'Cancelled'],
            },
          },
        }),
      };

      const rsvps = await this.prisma.eventRSVP.findMany({
        where,
        include: {
          event: {
            include: {
              speakers: true,
              _count: {
                select: { attendees: true },
              },
            },
          },
        },
        orderBy: {
          event: {
            date: 'asc',
          },
        },
      });

      return rsvps.map((r) => ({
        ...r.event,
        rsvpDate: r.createdAt,
      }));
    } catch (error) {
      this.logger.error(`Error fetching RSVPs for member ${memberId}:`, error);
      throw new InternalServerErrorException('Failed to fetch your RSVPs');
    }
  }

  /**
   * Check if a member has RSVP'd to an event
   */
  async hasRsvp(eventId: string, memberId: string): Promise<boolean> {
    try {
      const rsvp = await this.prisma.eventRSVP.findUnique({
        where: {
          eventId_memberId: {
            eventId,
            memberId,
          },
        },
      });

      return !!rsvp;
    } catch (error) {
      this.logger.error('Error checking RSVP:', error);
      return false;
    }
  }

  /**
   * Get event statistics
   */
  async getEventStats(eventId: string) {
    try {
      const event = await this.findOne(eventId);

      return {
        totalAttendees: event.attendees.length,
        totalSpeakers: event.speakers.length,
        totalAgendaItems: event.agenda.length,
        status: event.status,
        registrationRequired: event.registrationRequired,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      this.logger.error(`Error fetching stats for event ${eventId}:`, error);
      throw new InternalServerErrorException(
        'Failed to fetch event statistics',
      );
    }
  }

  // Private helper methods
  private buildWhereClause(filter?: EventFilterDto): Prisma.EventWhereInput {
    const where: Prisma.EventWhereInput = {};

    if (!filter) return where;

    if (filter.status) {
      where.status = filter.status as any;
    }

    if (filter.category) {
      where.category = filter.category;
    }

    if (filter.search) {
      where.OR = [
        { title: { contains: filter.search, mode: 'insensitive' } },
        { description: { contains: filter.search, mode: 'insensitive' } },
        { location: { contains: filter.search, mode: 'insensitive' } },
      ];
    }

    if (filter.startDate || filter.endDate) {
      where.date = {};
      if (filter.startDate) {
        where.date.gte = filter.startDate.toISOString();
      }
      if (filter.endDate) {
        where.date.lte = filter.endDate.toISOString();
      }
    }

    return where;
  }

  private buildOrderByClause(filter?: EventFilterDto) {
    const orderByField = filter?.orderBy || 'createdAt';
    const orderByDirection = filter?.orderDirection || 'desc';
    return { [orderByField]: orderByDirection };
  }

  private async buildPaginatedResponse(
    events: any[],
    total: number,
    filter?: EventFilterDto,
  ): Promise<PaginatedEvents> {
    const limit = filter?.limit || 10;
    const offset = filter?.offset || 0;
    const totalPages = Math.ceil(total / limit);
    const currentPage = Math.floor(offset / limit) + 1;

    const formattedEvents = await Promise.all(
      events.map(async (event: Event) => {
        const {
          startTime,
          date,
          maxAttendees,
          attendees: _,
          eventfee,
          ...rsdta
        } = event as any;
        const getAtt = await this.prisma.eventRSVP.findMany({
          where: {
            eventId: event.id,
          },
          include: {
            member: true,
          },
        });
        const attendees = getAtt.map((att) => ({
          id: att.member.id,
          name: att.member.lastName + ' ' + att.member.firstName,
          email: att.member.email,
          registrationDate: format(
            new Date(att.createdAt),
            'yyyy-MM-dd, HH:mm:ss',
          ),
          status: att.status,
          phone: att.member.phone,
          attended: att.attended,
        }));
        return {
          ...rsdta,
          attendees,
          time: startTime,
          date: format(new Date(date), 'yyyy-MM-dd'),
          price: eventfee,
          capacity: maxAttendees,
          isPastEvent: new Date(event.date) < new Date(),
        };
      }),
    );

    return {
      data: formattedEvents,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
        totalPages,
        currentPage,
      },
    };
  }
}
