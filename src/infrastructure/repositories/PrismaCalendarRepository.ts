import { PrismaClient } from '@prisma/client';
import { ICalendarRepository} from '../../domain/repositories/ICalendarRepository';
import { Calendar } from '../../domain/entities/Calendar';

export class PrismaCalendarRepository implements ICalendarRepository {
    constructor(private prisma: PrismaClient) {}

    async create(calendar: Calendar): Promise<Calendar> {
        const created = await this.prisma.calendar.create({
            data: {
                id: calendar.id,
                name: calendar.name,
                description: calendar.description,
                color: calendar.color,
                userId: calendar.userId,
                isDefault: calendar.isDefault,
                isVisible: calendar.isVisible,
            },
        });

        return this.toDomain(created);
    }

    async findById(id: string): Promise<Calendar | null> {
        const calendar = await this.prisma.calendar.findUnique({
            where: { id },
        });

        return calendar ? this.toDomain(calendar) : null;
    }

    async findByUserId(userId: string): Promise<Calendar[]> {
        const calendars = await this.prisma.calendar.findMany({
            where: { userId },
            orderBy: { name: 'asc' },
        });

        return calendars.map(calendar => this.toDomain(calendar));
    }

    async findDefaultByUserId(userId: string): Promise<Calendar | null> {
        const calendar = await this.prisma.calendar.findFirst({
            where: { userId, isDefault: true },
        });

        return calendar ? this.toDomain(calendar) : null;
    }

    async update(id: string, data: Partial<Calendar>): Promise<Calendar> {
        const updated = await this.prisma.calendar.update({
            where: { id },
            data: {
                ...data,
                updatedAt: new Date(),
            },
        });
        return this.toDomain(updated);
    }

    async delete(id: string): Promise<void> {
        await this.prisma.calendar.delete({
            where: { id },
        });
    }

    async setAsDefault(id: string, userId: string): Promise<void> {
        await this.prisma.$transaction([
        this.prisma.calendar.updateMany({
            where: { userId },
            data: { isDefault: false },
        }),
            this.prisma.calendar.update({
                where: { id },
                data: { isDefault: true },
            }),
        ]);
    }

    private toDomain(calendar: any): Calendar {
        return new Calendar(
            calendar.id,
            calendar.name,
            calendar.description,
            calendar.color,
            calendar.userId,
            calendar.isDefault,
            calendar.isVisible,
            calendar.createdAt,
            calendar.updatedAt
        );
    }
}