import { Request, Response } from "express";
import { getHealthStatus } from "../services/healthService";

export function health(req: Request, res: Response) {
    const status = getHealthStatus();

    return res.json(status);
}