import { NextApiRequest, NextApiResponse } from "next";

export default function health(req: NextApiRequest, res: NextApiResponse) {
    try {
        // Only allow GET requests
        if (req.method !== 'GET') {
            return res.status(405).json({
                status: "error",
                message: "Method not allowed",
                method: req.method
            });
        }

        // Basic health check response
        const healthResponse = "healthy";

        return res.status(200).json(healthResponse);
    } catch (error) {
        console.error('Health check error:', error);

        return res.status(500).json({
            status: "error",
            message: "Health check failed",
            time: new Date().toISOString(),
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}
