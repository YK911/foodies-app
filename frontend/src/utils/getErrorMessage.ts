import { isAxiosError } from 'axios';

const FALLBACK_MESSAGE = 'Something went wrong. Please try again later.';

// Prefers the backend's { message } body, then the network error text.
export const getErrorMessage = (error: unknown): string => {
  if (isAxiosError<{ message?: unknown }>(error)) {
    const message = error.response?.data?.message;

    if (typeof message === 'string' && message.trim()) {
      return message;
    }

    if (!error.response) {
      return 'The server is not responding. Check your connection and try again.';
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return FALLBACK_MESSAGE;
};
