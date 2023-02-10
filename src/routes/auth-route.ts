import {Request, Response, Router} from "express";
import {usersService} from "../domain/users-service";
import {RequestWithBody} from "../models/types";
import {userAuthModel, userInputModel} from "../models/users-models";
import {jwtService} from "../application/jwt-service";
import {authMiddleware, refreshTokenCheck} from "../middlewares/basic-auth.middleware";
import {
    confirmationCodeValidation,
    emailResendingValidation,
    emailValidation,
    inputValidationMiddleware,
    loginValidation, passwordValidation
} from "../middlewares/input-validation-middleware/input-validation-middleware";
import {authService} from "../domain/auth-service";
import rateLimit from "express-rate-limit";
import {rateLimiter} from "../middlewares/rate-limiter";


export const authRouter = Router({})

authRouter.post('/registration',
    rateLimiter,
    loginValidation,
    passwordValidation,
    emailValidation,
    inputValidationMiddleware,
    async (req: RequestWithBody<userInputModel>, res: Response) => {
        const newUser = await authService.registerUser(
            req.body.login,
            req.body.password,
            req.body.email)
        if (newUser) {
            res.status(204).send(newUser)
        }
        else {
            res.sendStatus(400)
        }
    })

authRouter.post('/registration-email-resending',
    rateLimiter,
    emailResendingValidation,
    inputValidationMiddleware,
    async (req: Request, res: Response) => {
        const result = await authService.registrationEmailResending(req.body.email)
        if (result) {
            res.sendStatus(204)
        }
        else res.sendStatus(400)
    })

authRouter.post('/registration-confirmation',
    rateLimiter,
    confirmationCodeValidation,
    inputValidationMiddleware,
    async (req: Request, res: Response) => {
    const result = await authService.confirmEmail(req.body.code)
        if (result) {
            res.sendStatus(204)
        }
        else res.sendStatus(400)
    })

authRouter.post('/login',
    rateLimiter,
    async (req: RequestWithBody<userAuthModel>, res: Response) => {
        const user = await usersService.checkCredentials(req.body.loginOrEmail, req.body.password)
        if (user) {
            const {accessToken, refreshToken} = await authService.login(user, req.ip, req.headers['user-agent']!)
            res.status(200).cookie("refreshToken", refreshToken, {httpOnly: true, secure: true}).send({accessToken})
        } else res.sendStatus(401)
    })

authRouter.get('/me',
    authMiddleware,
    async (req: Request, res: Response) => {
        const currentUserInfo = {
            "email": req.user!.email,
            "login": req.user!.login,
            "userId": req.user!._id
        }
        res.status(200).send(currentUserInfo)

    })

authRouter.post('/logout',
    refreshTokenCheck,
    async (req: Request, res: Response) => {
        const isLogout = await authService.logout(req.user!._id, req.cookies!.refreshToken)
        if (isLogout) res.cookie("refreshToken", "", {httpOnly: true, secure: true}).sendStatus(204)
        else res.status(404).send("no logout")
    })

authRouter.post('/refresh-token',
    refreshTokenCheck,
    async (req: Request, res: Response) => {
        const newRefreshToken = await jwtService.updateJWTRefresh(req.user!._id, req.cookies!.refreshToken)
        const accessToken = await jwtService.createJWT(req.user!)
        res.status(200).cookie("refreshToken", newRefreshToken, {httpOnly: true, secure: true}).send({accessToken})
    }
)