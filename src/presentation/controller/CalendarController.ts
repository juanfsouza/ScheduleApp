import { Request, Response } from "express";
import { CreateCalendarUseCase, GetUserCalendarsUseCase } from "../../application/use-cases";
import { z } from "zod";

const createCalendarSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional(),
    color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid color format').optional(),
    isDefault: z.boolean().optional().default(false)
});

export class CalendarController {
    constructor (
        private createCalendarUseCase: CreateCalendarUseCase,
        private getUserCalendarUseCase: GetUserCalendarsUseCase
    ) {}

    create = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = req.user?.id;
              if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const data = createCalendarSchema.parse(req.body);
      
      const calendar = await this.createCalendarUseCase.execute({
        ...data,
        userId
      });

      res.status(201).json(calendar);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Validation failed', details: error.errors });
        return;
      }
      
      res.status(400).json({ error: (error as Error).message });
    }
  };

    getUserCalendars = async (req: Request, res: Response): Promise<void> => {
        try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const calendars = await this.getUserCalendarUseCase.execute(userId);
        res.json(calendars);
        } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
        }
    };
 
}