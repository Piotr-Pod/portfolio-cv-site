import { z } from "zod";

export const CvDownloadSchema = z.object({
  // Required fields
  gdprConsent: z.boolean().refine(val => val === true, {
    message: "Musisz wyrazić zgodę na przetwarzanie danych osobowych"
  }),
  
  // Optional fields
  fullName: z.string()
    .min(0)
    .max(100, "Imię i nazwisko nie może być dłuższe niż 100 znaków")
    .optional()
    .transform(val => val?.trim() || undefined),
  
  company: z.string()
    .min(0)
    .max(100, "Nazwa firmy nie może być dłuższa niż 100 znaków")
    .optional()
    .transform(val => val?.trim() || undefined),
  
  contact: z.string()
    .min(0)
    .max(100, "Kontakt nie może być dłuższy niż 100 znaków")
    .optional()
    .transform(val => val?.trim() || undefined),
  
  justification: z.string()
    .min(0)
    .max(500, "Uzasadnienie nie może być dłuższe niż 500 znaków")
    .optional()
    .transform(val => val?.trim() || undefined),
  
  // Session tracking fields (added automatically by client)
  clientId: z.string().optional(),
  sessionId: z.string().optional(),
  analyticsConsent: z.object({
    clarity: z.boolean(),
    plausible: z.boolean(),
    umami: z.boolean(),
  }).optional(),
});

export type CvDownloadData = z.infer<typeof CvDownloadSchema>;

// Validation messages for different locales
export const validationMessages = {
  pl: {
    gdprRequired: "Musisz wyrazić zgodę na przetwarzanie danych osobowych",
    fullNameTooLong: "Imię i nazwisko nie może być dłuższe niż 100 znaków",
    companyTooLong: "Nazwa firmy nie może być dłuższa niż 100 znaków",
    contactTooLong: "Kontakt nie może być dłuższy niż 100 znaków",
    justificationTooLong: "Uzasadnienie nie może być dłuższe niż 500 znaków",
  },
  en: {
    gdprRequired: "You must consent to personal data processing",
    fullNameTooLong: "Full name cannot be longer than 100 characters",
    companyTooLong: "Company name cannot be longer than 100 characters",
    contactTooLong: "Contact cannot be longer than 100 characters",
    justificationTooLong: "Justification cannot be longer than 500 characters",
  }
};
