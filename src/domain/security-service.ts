import {ObjectId} from "mongodb";
import {userDeviceRepo} from "../repositories/users-device-repository";
import {userDeviceOutputType} from "../models/types";
import {jwtService} from "../application/jwt-service";

export const securityService = {

    async getActiveUserDevices(userId: ObjectId){
        let foundDevices = await userDeviceRepo.getActiveUserDevices(userId)
        return foundDevices
    },

    async deleteAllUserDevicesExceptCurrent(userId: ObjectId, refreshToken: string){
        const deviceId = await jwtService.getDeviceIdFromRefreshToken(refreshToken)
        let isDevicesDeleted = await userDeviceRepo.deleteAllUserDevicesExceptCurrent(userId, deviceId)
        return isDevicesDeleted
    },

    async deleteUserDeviceById(userId: ObjectId, deviceId: string){
        let isDeviceDeleted = await userDeviceRepo.deleteUserDeviceById(userId, deviceId)
        return isDeviceDeleted
    },

    async getCurrentDevise(userId: ObjectId, deviceId: string){
        let currentDevice = await userDeviceRepo.getCurrentDevise(userId, deviceId)
        return currentDevice
    },

    async deleteAllDevices(): Promise<boolean>{
        return await userDeviceRepo.deleteAllDevices()
    }



}