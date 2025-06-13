import { PrismaClient } from '@prisma/client';
import { IEventRepository } from '../../domain/repositories/IEventRepository';
import { Event, EventStatus, EventType } from '../../domain/entities/Event';

export class PrismaEventRepository implements IEventRepository {
 constructor(private prisma: PrismaClient) {}
 
 async create(event: Event): Promise<Event>{
    const created = await this.prisma.event.create({
      data: {
        id: event.id,
        title: event.title,
        description: event.description,
        startTime: event.startTime,
        endTime: event.endTime,
        allDay: event.allDay,
        location: event.location,
        status: event.status,
        type: event.type,
        isRecurring: event.isRecurring,
        userId: event.userId,
        calendarId: event.calendarId,
    }
 })

 return this.toDomain(created);
 }

 async findById(id: string): Promise<Event | null> {
    const event = await this.prisma.event.findUnique({
      where: { id },
    });

    return event ? this.toDomain(event) : null;
 }

 async findByUserId(userId: string): Promise<Event[]> {
    const events = await this.prisma.event.findMany({
        where: { userId },
        orderBy: { startTime: 'asc' },
    });

    return events.map(event => this.toDomain(event));
 }

 async findByCalendarId(calendarId: string): Promise<Event[]> {
    const events = await this.prisma.event.findMany({
        where: { calendarId },
        orderBy: { startTime: 'asc' },
    });

    return events.map(event => this.toDomain(event));
 }

 async findByDateRange(userId: string, startDate: Date, endDate: Date): Promise<Event[]> {
    const events = await this.prisma.event.findMany({
        where: {
            userId,
            OR: [
                { startTime: { gte: startDate, lte: endDate } },
                { endTime: { gte: startDate, lte: endDate } },
                { startTime: { lte: startDate }, endTime: { gte: endDate } },
            ],
        },
        orderBy: { startTime: 'asc' },
    });

    return events.map(event => this.toDomain(event));
  }

  async update(id: string, data: Partial<Event>): Promise<Event> {
    const updated = await this.prisma.event.update({
        where: { id },
        data: {
            ...data,
            updateAt: new Date(),
        },
    });
    return this.toDomain(updated);
  }

    async delete(id: string): Promise<void> {
        await this.prisma.event.delete({
        where: { id },
        });
    }

    async findRecurringEvents(userId: string): Promise<Event[]> {
        const events = await this.prisma.event.findMany({
            where: {
                userId,
                isRecurring: true,
            },
            include: {
                recurrence: true,
            },
        });

        return events.map(event => this.toDomain(event));
    }

    private toDomain(event: any): Event {
        return new Event(
            event.id,
            event.title,
            event.description,
            event.startTime,
            event.endTime,
            event.allDay,
            event.color,
            event.status as EventStatus,
            event.type as EventType,
            event.isRecurring,
            event.location,
            event.status,
            event.type,
            event.isRecurring,
            event.userId,
            event.calendarId
        );
    }
}