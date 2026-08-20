/**
 * Centralized configuration for the frontend application.
 *
 * In development, the Vite proxy forwards /api requests to localhost:3001,
 * so we default to '/api'. In production (Vercel), VITE_API_URL should
 * point to the deployed backend (e.g. https://your-backend.onrender.com/api).
 */

export const API_BASE: string = import.meta.env.VITE_API_URL || '/api';

/**
 * The CV is served as a static asset from frontend/public, not through the API,
 * so it downloads without waking the backend. Referenced from the navbar, the
 * hero CTA and the footer.
 */
export const CV_DOWNLOAD_PATH: string = '/Muhammad_Rafay_Irfan_CV.pdf';
