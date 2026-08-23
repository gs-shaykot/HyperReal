import cloudinary from '@/lib/cloudinary';
import { NextResponse } from 'next/server';

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB MAX

const ALLOWED_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
];

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get("file");

        if (!(file instanceof File)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "No valid file uploaded.",
                },
                { status: 400 }
            );
        }

        // File size
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                {
                    success: false,
                    message: "File size must not exceed 2 MB.",
                },
                { status: 400 }
            );
        }

        // Extension type
        if (!ALLOWED_TYPES.includes(file.type)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Only JPG, PNG, and WebP images are allowed.",
                },
                { status: 400 }
            );
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const uploadResult = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {
                    folder: "users",
                    resource_type: "image",
                },
                (error, result) => {
                    if (error) {
                        reject(error);
                        return;
                    }

                    resolve(result);
                }
            ).end(buffer);
        });

        return NextResponse.json(
            {
                success: true,
                data: uploadResult,
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("Image upload error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Image upload failed.",
            },
            { status: 500 }
        );
    }
}