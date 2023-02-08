import {NextFunction, Request, Response} from "express";
import {usersService} from "../domain/users-service";
import {authService} from "../domain/auth-service";
import {jwtService} from "../application/jwt-service";


export const basicAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {

    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send("Unauthorized")
    }
    const authType = authHeader.split(' ')[0]
    if (authType !== 'Basic') return res.sendStatus(401)
    let auth = Buffer.from(authHeader.split(' ')[1],
        'base64').toString().split(':');
    let user = auth[0];
    let pass = auth[1];
    if (!(user == 'admin' && pass == 'qwerty')) {
        return res.status(401).send("Unauthorized")
    }
    return next()
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.headers.authorization) {
        res.sendStatus(401)
        return
    }

    const token = req.headers.authorization?.split(' ')[1]

    const userId = await jwtService.getUserIdFromRefreshToken(token)
    if (userId) {
        req.user = await usersService.getUserById(userId)
        next()
        return
    }
    res.sendStatus(401)
}

export const refreshTokenCheck = async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies.refreshToken
    if (!refreshToken) {
        res.status(401).send("нет куки")
        return
    }
    const userId = await jwtService.getUserIdFromRefreshToken(refreshToken)
    if (!userId) {
        res.status(401).send("нет куки")
        return
    }
    // const isTokenExpired = await authService.isTokenExpired(refreshToken)
    // console.log(isTokenExpired)
    // if (isTokenExpired) {
    //     // res.sendStatus(401)
    //     res.status(401).send("токен сдох")
    //     return
    // }

    const user = await usersService.getUserById(userId)
    if (!user) return res.status(401).send('no user')


    req.user = user
    next()
    return

}
