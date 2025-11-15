import { z } from 'zod';

export const profileFormSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  age: z.string().min(1, 'Age is required'),
  gender: z.string().min(1, 'Gender is required'),
  location: z.string().min(1, 'Location is required'),
  education: z.string().optional(),
  occupation: z.string().optional(),
  religiousLevel: z.string().min(1, 'Religious level is required'),
  prayerFrequency: z.string().optional(),
  familyBackground: z.string().optional(),
  aboutMe: z.string().min(10, 'Please write at least 10 characters about yourself'),
  waliName: z.string().optional(),
  waliRelationship: z.string().optional(),
  waliContact: z.string().optional(),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;

export const validateProfileForm = (data: Partial<ProfileFormValues>) => {
  try {
    profileFormSchema.parse(data);
    return { isValid: true, errors: {} };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const zodError = error as z.ZodError<any>;
      return {
        isValid: false,
        errors: zodError.issues.reduce(
          (acc: Record<string, string>, err: any) => {
            acc[err.path[0]] = err.message;
            return acc;
          },
          {} as Record<string, string>
        ),
      };
    }
    return { isValid: false, errors: {} };
  }
};
