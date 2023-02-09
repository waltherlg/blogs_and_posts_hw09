import {Request, Response, Router} from "express";
import {refreshTokenCheck} from "../middlewares/basic-auth.middleware";
import {securityService} from "../domain/security-service";
import {RequestWithParams} from "../models/types";
import {ObjectId} from "mongodb";

export const securityRouter = Router({})

securityRouter.get('/devices',
    refreshTokenCheck,
    async (req: Request, res: Response) => {
    const usersDevises = await securityService.getActiveUserDevices(req.user!._id)
        res.status(200).send(usersDevises)
})

securityRouter.delete('/devices',
    refreshTokenCheck,
    async (req: Request, res: Response) => {
        const isAllUsersDevisesDeleted = await securityService.deleteAllActiveUserDevices(req.user!._id)
        if (isAllUsersDevisesDeleted) return res.sendStatus(204)
        else res.sendStatus(404)
    })

securityRouter.delete('/devices',
    refreshTokenCheck,
    async (req: Request, res: Response) => {
        const isAllUsersDevisesDeleted = await securityService.deleteAllActiveUserDevices(req.user!._id)
        if (isAllUsersDevisesDeleted) return res.sendStatus(204)
        else res.sendStatus(404)
    })

securityRouter.delete('/devices/:deviceId',
    refreshTokenCheck,
    async (req: RequestWithParams<any>, res: Response) => {
        const isDeviceDeleted = await securityService.deleteUserDeviceById(req.user!._id, req.params.deviceId)
        if (isDeviceDeleted) {
            return res.sendStatus(204)
        } else {
            res.sendStatus(404)
        }
    })