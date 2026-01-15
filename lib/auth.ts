import prisma from "@/lib/prisma";
import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import argon2 from 'argon2';

type UserRole = "USER" | "ADMIN";

export const authOptions: AuthOptions = {
    secret: process.env.AUTH_SECRET,
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },

            async authorize(credentials) {
                if (!credentials) return null

                const { email, password } = credentials;

                const Fetchuser = await prisma.user.findUnique({
                    where: { email },
                });


                if (!Fetchuser) throw new Error("User not found");

                const isValid = await argon2.verify(Fetchuser.password, password);
                if (!isValid) throw new Error("Invalid password");

                const user = {
                    id: Fetchuser.id,
                    name: Fetchuser.name,
                    email: Fetchuser.email,
                    role: Fetchuser.role,
                    createdAt: Fetchuser.createdAt,
                    picture: Fetchuser.PhotoUrl
                }
                return user;
            },
        })
    ],
    session: {
        strategy: "jwt"
    },
    jwt: {
        secret: process.env.AUTH_SECRET,
    },
    callbacks: {
        async jwt({ token, user }) { 

            if (user && 'role' in user) {
                token.role = (user as any).role;
                token.picture = (user as any).picture;
            } 
            return token
        },
        async session({ session, token }: any) {
            if (session.user) {
                session.user.id = token.sub as string;
                session.user.image = token.picture as string;
                session.user.role = token.role as UserRole;
            }
            return session;
        }
    }
};