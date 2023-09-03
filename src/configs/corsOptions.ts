import { allowedOrigins } from "./allowedOrigins.js";

/**
 * 
 */
export const corsOptions = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    origin: (origin: any, callback: any) => {
        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200
}