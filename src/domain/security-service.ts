import {ObjectId} from "mongodb";
import {userDeviceRepo} from "../repositories/users-device-repository";

export const securityService = {

    async addDeviceInfo(userId: ObjectId, ip: string, title: string, lastActiveDate: string){
        const newDevice = {
            '_id': new ObjectId(),
            'userID': userId,
            'ip': ip,
            'title': title,
            lastActiveDate
        }
        const addedDevice = await userDeviceRepo.addDeviceInfo(newDevice)
        return newDevice._id
    }

}