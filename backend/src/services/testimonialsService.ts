import { prisma } from '../db/prisma.js';

// GET /api/testimonials: all testimonials for the home page slider.
export const listTestimonials = () =>
  prisma.testimonial.findMany({
    select: { id: true, ownerName: true, testimonial: true },
    orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
  });
