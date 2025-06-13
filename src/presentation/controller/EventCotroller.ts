
import { Request, Response } from "express";
import { CreateEventUseCase, GetEventsInRangeUseCase, UpdateEventUseCase } from "../../application/use-cases";
import { z } from "zod";


const createEventSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    startTime: z.string().datetime(),
    endTime: z.string().datetime(),
    AllDay: z.boolean().optional().default(false),
    color: z.string().optional(),
    location: z.string().optional(),
    calendarId: z.string().uuid(),
    checkConflicts: z.boolean().optional().default(true),
});

const getEventsSchema = z.object({
    calendarId: z.string().optional().transform(str => str ? str.split(',') : undefined),
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
});

const updateEventSchema = z.object({
    title: z.string().min(1, "Title is required").optional(),
    description: z.string().optional(),
    startTime: z.string().datetime().optional(),
    endTime: z.string().datetime().optional(),
    AllDay: z.boolean().optional(),
    color: z.string().optional(),
    location: z.string().optional(),
    status: z.enum(["confirmed", "tentative", "cancelled"]).optional(),
    checkConflicts: z.boolean().optional().default(true)     
});

export class EventCotroller {
    constructor(
        private createEventUseCase: CreateEventUseCase,
        private getEventsInRangeUseCase: GetEventsInRangeUseCase,
        private updateEventUseCase: UpdateEventUseCase,
    ) {}

    create = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ error: "Unauthorized" });
                return;
            }

            const data = createEventSchema.parse(req.body);
            const event = await this.createEventUseCase.execute({
                ...data,
                startTime: new Date(data.startTime),
                endTime: new Date(data.endTime),
                userId,
            });

            res.status(201).json(event);
        } catch (error) {
            if (error instanceof z.ZodError) {
                res.status(400).json({ error: error.errors });
            } else {
                console.error("Error creating event:", error);
                res.status(500).json({ error: "Internal server error" });
            }
        }
    };

    getByRange = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ error: "Unauthorized" });
                return;
            }

            const { calendarIds, startDate, endDate } = getEventsSchema.parse(req.query);
            
            const events = await this.getEventsInRangeUseCase.execute({
                userId,
                calendarIds,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
            });

            res.status(200).json(events);
        } catch (error) {
            if (error instanceof z.ZodError) {
                res.status(400).json({ error: error.errors });
            } else {
                console.error("Error fetching events:", error);
                res.status(500).json({ error: "Internal server error" });
            }
        }
    }

    update = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ error: "Unauthorized" });
                return;
            }
            
            const { id } = req.params;
            const data = updateEventSchema.parse(req.body);

            const updateData: any = { ...data, eventId: id, userId };
            if (data.startTime) updateData.startTime = new Date(data.startTime);
            if (data.endTime) updateData.endTime = new Date(data.endTime);

            const event = await this.updateEventUseCase.execute(updateData);

            res.json(event);
            } catch (error) {
                if (error instanceof z.ZodError) {
                    res.status(400).json({ error: 'Validation failed', details: error.errors });
                    return;
                }

                res.status(400).json({ error: (error as Error).message });
            }
        };
}
