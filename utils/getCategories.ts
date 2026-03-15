import prisma from "@/lib/prisma"
import { cache } from "react"

export const getCategories = cache(async () => {
    return prisma.category.findMany()
})