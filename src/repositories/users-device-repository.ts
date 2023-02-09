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
        const activeUserDevices = await userDeviceCollection.find({"userID": userId}).toArray()

        return  activeUserDevices.map((device) => ({
                ip: device.ip,
                title: device.title,
                lastActiveDate: device.lastActiveDate,
                deviceId: device._id.toString()
        }))
    },

    async deleteAllActiveUserDevices(userId: ObjectId): Promise<boolean>{
        const result = await userDeviceCollection.deleteMany({"userID": userId})
        return result.acknowledged
    },

    async deleteUserDeviceById(userId: ObjectId, deviceId: string): Promise<boolean | null>{
        if (ObjectId.isValid(deviceId)){
            let _id = new ObjectId(deviceId)
            const result = await userDeviceCollection.deleteOne({$and:[{"_id": _id},{"userID": userId}]})
            return result.deletedCount === 1
        }
        else return false
    }

    //async refreshDeviceInfo

}