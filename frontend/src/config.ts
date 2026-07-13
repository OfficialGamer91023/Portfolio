/**
 * Centralized configuration for the frontend application.
 *
 * In development, the Vite proxy forwards /api requests to localhost:3001,
 * so we default to '/api'. In production (Vercel), VITE_API_URL should
 * point to the deployed backend (e.g. https://your-backend.onrender.com/api).
 */

export const API_BASE: string = import.meta.env.VITE_API_URL || '/api';
