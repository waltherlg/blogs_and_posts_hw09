import {ObjectId} from "mongodb";
import {userDeviceRepo} from "../repositories/users-device-repository";
import {userDeviceOutputType} from "../models/types";

export const securityService = {

    async getActiveUserDevices(userId: ObjectId){
        let foundDevices = await userDeviceRepo.getActiveUserDevices(userId)
        return foundDevices
    },

    async deleteAllActiveUserDevices(userId: ObjectId){
        let isDevicesDeleted = await userDeviceRepo.deleteAllActiveUserDevices(userId)
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