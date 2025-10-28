import { NextApiRequest, NextApiResponse } from "next";
import { getServiceName } from "@shared/game-config";

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
        const healthResponse = {
            status: "ok",
            time: new Date().toISOString(),
            timestamp: Date.now(),
            service: getServiceName(),
            version: process.env.npm_package_version || "1.0.0"
        };

        return res.status(200).send(healthResponse);
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
