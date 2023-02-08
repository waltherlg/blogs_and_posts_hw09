import {userDeviceDBType, userDeviceOutputType} from "../models/types";
import {client} from "./db";

export const userDeviceCollection = client.db("blogsAndPosts").collection<userDeviceDBType>("userDevices")
export const userDeviceRepo = {

    async addDeviceInfo(newDevice: userDeviceDBType): Promise<boolean> {
        const result = await userDeviceCollection.insertOne(newDevice);
        return result.acknowledged
    },

    //async refreshDeviceInfo

}