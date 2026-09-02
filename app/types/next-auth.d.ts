import { DefaultSession } from "next-auth";
// okay or not ?
declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            role: "USER" | "ADMIN";
            image: string;
            isNewUser: boolean;
            createdAt: string;
            authProvider: "GOOGLE" | "EMAIL";
        } & DefaultSession["user"];
        sessionId: string;
    }

    interface User {
        role: "USER" | "ADMIN";
        picture: string;
        isNewUser: boolean;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        role: "USER" | "ADMIN";
        picture: string;
        isNewUser: boolean;
        createdAt: Date;
        authProvider: "GOOGLE" | "EMAIL";
        sessionId: string;
    }
}