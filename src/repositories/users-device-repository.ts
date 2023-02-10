import {userDeviceDBType, userDeviceOutputType} from "../models/types";
import {client} from "./db";
import {ObjectId} from "mongodb";

export const userDeviceCollection = client.db("blogsAndPosts").collection<userDeviceDBType>("userDevices")
export const userDeviceRepo = {

    async addDeviceInfo(newDevice: userDeviceDBType): Promise<boolean> {
        const result = await userDeviceCollection.insertOne(newDevice);
        return result.acknowledged
    },

    async getActiveUserDevices(userId: ObjectId){
        const activeUserDevices = await userDeviceCollection.find({"userId": userId}).toArray()

        return  activeUserDevices.map((device) => ({
                ip: device.ip,
                title: device.title,
                lastActiveDate: device.lastActiveDate,
                deviceId: device._id.toString()
        }))
    },

    async deleteAllActiveUserDevices(userId: ObjectId): Promise<boolean>{
        const result = await userDeviceCollection.deleteMany({"userId": userId})
        return result.acknowledged
    },

    async deleteUserDeviceById(userId: ObjectId, deviceId: string): Promise<boolean>{
        if (ObjectId.isValid(deviceId)){
            let _id = new ObjectId(deviceId)
            const result = await userDeviceCollection.deleteOne({$and:[{"_id": _id},{"userId": userId}]})
            return result.deletedCount === 1
        }
        else return false
    },

    async getCurrentDevise(userId: ObjectId, deviceId: string){
        if (ObjectId.isValid(userId) && ObjectId.isValid(deviceId)){
            let _id = new ObjectId(deviceId)
            let userIdObj = new ObjectId(userId)
            const currentDevise = await userDeviceCollection.findOne({$and:[{"_id": _id},{"userId": userIdObj}]})
            if (currentDevise){
                return currentDevise
            }
            else return null
        }
    },

    async deleteAllDevices(): Promise<boolean>{
        const result = await userDeviceCollection.deleteMany({})
        return result.acknowledged
    }

    //async refreshDeviceInfo

}