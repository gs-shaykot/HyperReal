import prisma from "@/lib/prisma";
import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
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

                if (!Fetchuser || !Fetchuser.password) return null;

                const isValid = await argon2.verify(Fetchuser.password, password);

                if (!isValid) throw new Error("Invalid password");

                const user = {
                    id: Fetchuser.id,
                    name: Fetchuser.name,
                    email: Fetchuser.email.toLowerCase(),
                    role: Fetchuser.role,
                    createdAt: Fetchuser.createdAt,
                    picture: Fetchuser.PhotoUrl ??
                        "https://res.cloudinary.com/dskgvk9km/image/upload/v1767725926/user_bvoihx.png",
                    isNewUser: Fetchuser.isNewUser,
                }
                return user;
            },
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        })
    ],
    session: {
        strategy: "jwt"
    },
    jwt: {
        secret: process.env.AUTH_SECRET,
    },
    callbacks: {
        async signIn({ user, account }) {
            if (account?.provider === 'google') {
                const isUserExis = await prisma.user.findUnique({
                    where: { email: user.email?.toLowerCase() },
                });
                if (!isUserExis) {
                    await prisma.user.create({
                        data: {
                            email: user.email?.toLowerCase() as string,
                            name: user.name as string,
                            PhotoUrl: user.image as string,
                            role: "USER",
                            password: "",
                            isVerified: true,
                            isNewUser: true,
                        }
                    })
                }
            }


            return true;
        },
        async jwt({ token, user }) {

            if (user && 'role' in user) {
                token.role = (user as any).role;
                token.picture = (user as any).picture;
                token.isNewUser = (user as any).isNewUser;
            }
            return token
        },
        async session({ session, token }: any) {
            if (session.user) {
                session.user.id = token.sub as string;
                session.user.image = token.picture as string;
                session.user.role = token.role as UserRole;
                session.user.isNewUser = token.isNewUser as boolean;
            }
            return session;
        }
    },
    pages: {
        signIn: "/login",
    },
};