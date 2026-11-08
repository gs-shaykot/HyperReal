import cloudinary from "@/lib/cloudinary";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { ipLimiter } from "@/lib/upstash";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function getClientIp(req: Request) {
    const forwarded = req.headers.get("x-forwarded-for");
    return forwarded?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
}

function matchesImageSignature(buffer: Buffer, mimeType: string) {
    if (mimeType === "image/png") {
        return buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
    }
    if (mimeType === "image/jpeg") {
        return buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    }
    if (mimeType === "image/webp") {
        return buffer.length >= 12 && buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP";
    }
    return false;
}

export async function POST(req: Request) {
    try {
        // Keep anonymous profile-image uploads available for registration, but protect
        // the Cloudinary endpoint with an IP-based quota.
        const ipLimit = await ipLimiter.limit(`image-upload:${getClientIp(req)}`);
        if (!ipLimit.success) {
            return NextResponse.json({ success: false, message: "Too many uploads. Please try again later." }, { status: 429 });
        }

        const session = await getServerSession(authOptions);
        const formData = await req.formData();
        const file = formData.get("file");
        const requestedFolder = formData.get("folder");
        const folder = requestedFolder === "products" ? "products" : requestedFolder === "users" || requestedFolder == null ? "users" : null;

        if (!folder) {
            return NextResponse.json({ success: false, message: "Invalid upload folder." }, { status: 400 });
        }

        // Product assets are privileged: require a current, non-blocked DB admin.
        if (folder === "products") {
            if (!session?.user?.id) {
                return NextResponse.json({ success: false, message: "Authentication required." }, { status: 401 });
            }
            const currentUser = await prisma.user.findUnique({
                where: { id: session.user.id },
                select: { role: true, isBlocked: true },
            });
            if (!currentUser || currentUser.isBlocked || currentUser.role !== "ADMIN") {
                return NextResponse.json({ success: false, message: "Admin access required to upload product images." }, { status: 403 });
            }
        } else if (session?.user?.id) {
            // Logged-in profile uploads must belong to an active account.
            const currentUser = await prisma.user.findUnique({
                where: { id: session.user.id },
                select: { isBlocked: true },
            });
            if (!currentUser || currentUser.isBlocked) {
                return NextResponse.json({ success: false, message: "Account is unavailable." }, { status: 403 });
            }
        }

        if (!(file instanceof File) || file.size === 0) {
            return NextResponse.json({ success: false, message: "No valid file uploaded." }, { status: 400 });
        }
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json({ success: false, message: "File size must not exceed 2 MB." }, { status: 400 });
        }
        if (!ALLOWED_TYPES.has(file.type)) {
            return NextResponse.json({ success: false, message: "Only JPG, PNG, and WebP images are allowed." }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        // Do not trust the browser-provided Content-Type alone.
        if (!matchesImageSignature(buffer, file.type)) {
            return NextResponse.json({ success: false, message: "The uploaded file is not a valid image of the declared type." }, { status: 400 });
        }

        const uploadResult = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream({ folder, resource_type: "image" }, (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }).end(buffer);
        });

        return NextResponse.json({ success: true, data: uploadResult }, { status: 200 });
    } catch (error) {
        console.error("[image-upload] Upload failed:", error);
        return NextResponse.json({ success: false, message: "Image upload failed." }, { status: 500 });
    }
}
