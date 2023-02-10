import {ObjectId} from "mongodb";
import {userDeviceDBType, userType, userTypeOutput} from "../models/types";
import {usersRepository} from "../repositories/users-repository";
import {expiredTokenRepository} from "../repositories/tokensRepository";
import * as bcrypt from 'bcrypt'
import {v4 as uuid4} from 'uuid'
import add from 'date-fns/add'
import {emailManager} from "../managers/email-manager";
import {usersService} from "./users-service";
import {confirmationCodeValidation} from "../middlewares/input-validation-middleware/input-validation-middleware";
import {jwtService} from "../application/jwt-service";
import {securityService} from "./security-service";
import {userDeviceRepo} from "../repositories/users-device-repository";

export const authService = {

    async registerUser(login: string, password: string, email: string): Promise<userTypeOutput | null> {

        const passwordSalt = await bcrypt.genSalt(10)
        const passwordHash = await this._generateHash(password, passwordSalt)

        const newUser: userType = {
            "_id": new ObjectId(),
            "login": login,
            passwordHash,
            passwordSalt,
            "email": email,
            "createdAt": new Date().toISOString(),
            "confirmationCode": uuid4(),
            "expirationDate": add(new Date(),{
                hours: 1
                //minutes: 3
            }),
            "isConfirmed": false
        }
        const createdUser = await usersRepository.createUser(newUser)
        try {
            await emailManager.sendEmailConfirmationMessage(newUser)
        }
        catch (e) {
            await usersService.deleteUser(newUser._id.toString())
            return null
        }
        return createdUser


    },

    async confirmEmail(code: string){
        let user = await usersRepository.getUserByConfirmationCode(code)
        if (!user) return false
        if (user.expirationDate > new Date()){
            let result = await usersRepository.updateConfirmation(user._id)
            return result
        }
        return false
    },

    async registrationEmailResending(email: string){
        const refreshConfirmationData = {
            "email": email,
            "confirmationCode": uuid4(),
            "expirationDate": add(new Date(),{
                hours: 1
                //minutes: 3
            }),
        }
        try {
            await emailManager.resendEmailConfirmationMessage(refreshConfirmationData)
        }
        catch (e) {
            return null
        }
        let result = await usersRepository.refreshConfirmationCode(refreshConfirmationData)
        return result
    },

    async isConfirmationCodeExist(code: string){
        let user = await usersRepository.getUserByConfirmationCode(code)
        return !!user;
    },

    async _generateHash(password: string, salt: string){
        const hash = await bcrypt.hash(password, salt)
        return hash
    },

    async isTokenExpired(refreshToken: string){
        const isToken = await expiredTokenRepository.findExpiredToken(refreshToken)
        return !!isToken
    },

    async login(user: userType, ip: string, userAgent: string) {
        const deviceId = new ObjectId()
        const accessToken = await jwtService.createJWT(user)
        const refreshToken = await jwtService.createJWTRefresh(user, deviceId)
        const lastActiveDate = await jwtService.getLastActiveDateFromRefreshToken(refreshToken)
        const deviceInfo: userDeviceDBType = {
            _id: deviceId,
            userId: user._id,
            ip,
            title: userAgent,
            lastActiveDate
        }
        await userDeviceRepo.addDeviceInfo(deviceInfo)
        return { accessToken, refreshToken }
    },

    async logout(userId: ObjectId, refreshToken: string){
        const deviceId = await jwtService.getDeviceIdFromRefreshToken(refreshToken)
        const isDeviceDeleted = await securityService.deleteUserDeviceById(userId, deviceId)
        return isDeviceDeleted
    }
}

