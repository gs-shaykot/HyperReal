import { DefaultSession } from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            role: "USER" | "ADMIN";
            image: string;
        } & DefaultSession["user"];
    }

    interface User {
        role: "USER" | "ADMIN";
        picture: string;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        role: "USER" | "ADMIN";
        picture: string;
    }
}
