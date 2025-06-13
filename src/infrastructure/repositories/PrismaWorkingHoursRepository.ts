import { PrismaClient } from '@prisma/client';
import { IWorkingHoursRepository } from '../../domain/repositories/IWorkingHoursRepository';
import { WorkingHours, WeeklySchedule } from '../../domain/entities/WorkingHours';

export class PrismaWorkingHoursRepository implements IWorkingHoursRepository {
    constructor(private prisma: PrismaClient) {}

    async create(workingHours: WorkingHours): Promise<WorkingHours> {
        const schedule = workingHours.schedule;

        const created = await this.prisma.workingHours.create({
            data: {
                id: workingHours.id,
                userId: workingHours.userId,
                mondayStart: schedule.monday.start,
                mondayEnd: schedule.monday.end,
                tuesdayStart: schedule.tuesday.start,
                tuesdayEnd: schedule.tuesday.end,
                wednesdayStart: schedule.wednesday.start,
                wednesdayEnd: schedule.wednesday.end,
                thursdayStart: schedule.thursday.start,
                thursdayEnd: schedule.thursday.end, 
                fridayStart: schedule.friday.start,
                fridayEnd: schedule.friday.end,
                saturdayStart: schedule.saturday.start,
                saturdayEnd: schedule.saturday.end,
                sundayStart: schedule.sunday.start,
                sundayEnd: schedule.sunday.end,
            }
        });

        return this.toDomain(created);
    }

    async findByUserId(userId: string): Promise<WorkingHours | null> {
        const workingHours = await this.prisma.workingHours.findUnique({
            where: { userId },
        });

        return workingHours ? this.toDomain(workingHours) : null;
    }

    async update(userId: string, data: Partial<WorkingHours>): Promise<WorkingHours> {
        const schedule = data.schedule;
     
        const updated = await this.prisma.workingHours.update({
            where: { userId },
            data: {
                mondayStart: schedule?.monday?.start,
                mondayEnd: schedule?.monday?.end,
                tuesdayStart: schedule?.tuesday?.start,
                tuesdayEnd: schedule?.tuesday?.end,
                wednesdayStart: schedule?.wednesday?.start,
                wednesdayEnd: schedule?.wednesday?.end,
                thursdayStart: schedule?.thursday?.start,
                thursdayEnd: schedule?.thursday?.end,
                fridayStart: schedule?.friday?.start,
                fridayEnd: schedule?.friday?.end,
                saturdayStart: schedule?.saturday?.start,
                saturdayEnd: schedule?.saturday?.end,
                sundayStart: schedule?.sunday?.start,
                sundayEnd: schedule?.sunday?.end,
                updatedAt: new Date(),
            }
        });

        return this.toDomain(updated);
    }

    async delete(userId: string): Promise<void> {
        await this.prisma.workingHours.delete({
            where: { userId },
        });
    }

    private toDomain(workingHours: any): WorkingHours {
        const schedule: WeeklySchedule = {};

        if (workingHours.mondayStart !== null && workingHours.mondayEnd !== null) {
            schedule.monday = {
                start: workingHours.mondayStart,
                end: workingHours.mondayEnd,
            };
        }
        if (workingHours.tuesdayStart !== null && workingHours.tuesdayEnd !== null) {
            schedule.tuesday = {
                start: workingHours.tuesdayStart,
                end: workingHours.tuesdayEnd,
            };
        }
        if (workingHours.wednesdayStart !== null && workingHours.wednesdayEnd !== null) {
            schedule.wednesday = {
                start: workingHours.wednesdayStart,
                end: workingHours.wednesdayEnd,
            };
        }
        if (workingHours.thursdayStart !== null && workingHours.thursdayEnd !== null) {
            schedule.thursday = {
                start: workingHours.thursdayStart,
                end: workingHours.thursdayEnd,
            };
        }
        if (workingHours.fridayStart !== null && workingHours.fridayEnd !== null) {
            schedule.friday = {
                start: workingHours.fridayStart,
                end: workingHours.fridayEnd,
            };
        }
        if (workingHours.saturdayStart !== null && workingHours.saturdayEnd !== null) {
            schedule.saturday = {
                start: workingHours.saturdayStart,
                end: workingHours.saturdayEnd,
            };
        }
        if (workingHours.sundayStart !== null && workingHours.sundayEnd !== null) {
            schedule.sunday = {
                start: workingHours.sundayStart,
                end: workingHours.sundayEnd,
            };
        }
        return new WorkingHours(
            workingHours.id,
            workingHours.userId,
            schedule,
            workingHours.createdAt,
            workingHours.updatedAt
        );
    }
}
