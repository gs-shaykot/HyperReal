
import { DefaultSession } from "next-auth";
import { Role, AuthProvider } from "@prisma/client";

declare module "next-auth" {
    interface User {
        id: string;
        role: Role;
        createdAt: Date;
        picture?: string | null;
        isNewUser: boolean;
        authProvider: AuthProvider;
    }

    interface Session {
        user: {
            id: string;
            role: Role;
            createdAt: Date;
            isNewUser: boolean;
            authProvider: AuthProvider;
        } & DefaultSession["user"];

        sessionId: string;
        sessionRevoked: boolean;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        role: Role;
        createdAt: Date;
        isNewUser: boolean;
        authProvider: AuthProvider;
        sessionId: string;
        sessionRevoked: boolean;
    }
}
