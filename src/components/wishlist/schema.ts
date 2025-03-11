
import { z } from "zod";

export const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  destination: z.string().min(3, "Please select a destination"),
  description: z.string().optional(),
  itemType: z.enum(['places', 'activities', 'products', 'other']),
  activityType: z.string().optional(),
  travelType: z.string().optional(),
  timeframeType: z.string(),
  targetDate: z.date().optional(),
  targetWeek: z.string().optional(),
  targetMonth: z.string().optional(),
  targetYear: z.number().optional(),
  budgetRange: z.string().optional(),
  tags: z.array(z.string()).optional(),
  imageUrl: z.string().url("Please enter a valid URL").optional().or(z.literal('')),
  link: z.string().url("Please enter a valid URL").optional().or(z.literal('')),
});

export type FormValues = z.infer<typeof formSchema>;
