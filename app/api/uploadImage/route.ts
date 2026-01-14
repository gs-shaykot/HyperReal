import cloudinary from '@/lib/cloudinary';
import { NextResponse } from 'next/server'; 

export async function POST(req: Request) {
    const formData = await req.formData();
    const file = formData.get('file') as File
    if (!file) {
        return NextResponse.json({ error: "No File Uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            { folder: "users" },
            (error, result) => {
                if (error) reject(error)
                resolve(result)
            }
        ).end(buffer)
    })
    return NextResponse.json(uploadResult)
}