import api from './api';

export interface Testimonial {
  id: string;
  ownerName: string;
  testimonial: string;
}

export const fetchTestimonials = async (signal?: AbortSignal): Promise<Testimonial[]> => {
  const { data } = await api.get<Testimonial[]>('/testimonials', { signal });
  return Array.isArray(data) ? data : [];
};
