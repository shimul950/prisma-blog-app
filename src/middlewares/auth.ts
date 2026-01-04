import { NextFunction, Request, Response } from "express"
import { auth as betterAuth } from "../lib/auth";
export enum UserRole {
    USER = "USER",
    ADMIN = "ADMIN"
}

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string,
                email: string,
                name: string,
                role: string,
                emailVarified: boolean
            }
        }
    }
}

const auth = (...role: UserRole[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            //get user session
            const session = await betterAuth.api.getSession({
                headers: req.headers as any
            })


            if (!session) {
                return res.status(401).json({
                    srccess: false,
                    message: "you are not authorized"
                })
            }
            if (!session.user.emailVerified) {
                return res.status(401).json({
                    success: false,
                    message: "Email varification required. Please varify your email"
                })
            }

            req.user = {
                id: session.user.id,
                email: session.user.email,
                name: session.user.name,
                role: session.user.role as string,
                emailVarified: session.user.emailVerified
            }

            if (role.length && !role.includes(req.user.role as UserRole)) {
                return res.status(401).json({
                    success: false,
                    message: "You don't have permission to access this resources"
                })
            }

            next()
        } catch (err) {
            next(err);
        }
    }
}

export default auth;