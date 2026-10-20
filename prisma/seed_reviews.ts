import "dotenv/config";
import prisma from "@/lib/prisma";

const PRODUCTS = [
    { id: "0a857a2e-a108-487b-8c63-6d5ef269b1b8", name: "MODULAR CROSSBODY" },
    { id: "0b6e2cd7-2624-415e-98b2-ba54201be3f1", name: "INSULATED GILET" },
    { id: "0f21a406-24cf-4b05-a706-f4a4eaba0af0", name: "RIBBED BEANIE" },
    { id: "18a9d8e1-7a0f-4b05-84d9-b84b393317b5", name: "PROTOCOL SOCKS" },
    { id: "19dc61ab-f3d9-4a36-acfb-1a1c6092e7da", name: "CYBER WATCH" },
    { id: "1ad465a1-0c0a-4940-9772-d7066d39304b", name: "GEO-CUT LONGSLEEVE" },
    { id: "281c7f1d-aa94-442d-b48c-69fd27081781", name: "TACTICAL SHADES" },
    { id: "37dada7e-64e3-4cfe-8f24-5ed370558e06", name: "TACTICAL MESSENGER" },
    { id: "39e11341-62bf-472d-b939-d0857d4902b4", name: "TACTICAL VEST" },
    { id: "3fa9c97c-1e7f-40ce-bd02-a6fe62be2855", name: "MID-LAYER FLEECE" },
    { id: "41ea2ad8-4703-4264-9576-408b127606ae", name: "BASE LAYER TOP" },
    { id: "462a30c2-716b-4e0f-bfd9-5b710102a51b", name: "PLATFORM HIGH-X" },
    { id: "5a4091cb-fe9c-4436-a484-1264f712696d", name: "WIDE CARGO TROUSER" },
    { id: "5a7d50d8-6baf-4eaa-9834-9b9fecf25b27", name: "TECH-ZIP POLO" },
    { id: "5bc61b82-248e-428f-9541-618fcf53cab9", name: "STEALTH BOMBER" },
    { id: "60013723-abbc-452f-b30d-f4e56b492cff", name: "MODULAR BACKPACK" },
    { id: "617ced55-c8af-4fcb-9995-04247d7b6cca", name: "TECH GLOVES" },
    { id: "6674d13a-a930-449d-9c9f-c8bb49a34da3", name: "TACTICAL UTILITY BELT" },
    { id: "6df8ee49-2d83-47fa-af08-64dac8a01309", name: "WIRELESS PODS" },
    { id: "72867156-0551-4653-87d4-e24a76989bcc", name: "ARTICULATED PANT" },
    { id: "83fb26c9-7737-4a62-adbe-e5b25ec332a7", name: "TECH-CARGO PANT" },
    { id: "9acd09ce-a86a-4432-8164-90ac380ca7e7", name: "ASYMM WINDBREAKER" },
    { id: "a6a88882-27e6-4a49-a892-3e5e88c777c6", name: "VOID RUNNER V2" },
    { id: "aa379a61-9f31-48fc-a3e3-93e65a3a9102", name: "STEALTH JOGGER" },
    { id: "ae4afcd7-9747-4bde-a6c2-dc54b5ca479d", name: "TACTICAL MESH TANK" },
    { id: "b5bf8778-b7aa-4941-8a8e-dbe74778be16", name: "STEALTH SLIP-ON" },
    { id: "bb9a60e0-2144-4a28-8d8b-9ced2858a75d", name: "NEURAL LINK HOODIE" },
    { id: "c5d1b296-3d28-4bdc-a05a-7ca354efc72e", name: "STEALTH SLING" },
    { id: "cc203e7f-8e0e-45de-8076-2cd71de78f13", name: "CYBER-SHELL PARKA" },
    { id: "cf22cc20-50b4-41b1-9098-3a0233659ade", name: "THERMAL LEGGINGS" },
    { id: "d4f3c507-bfd8-45b5-8067-f6b2f11e78fb", name: "TECH MASK PRO" },
    { id: "ded486ea-76b0-4afe-a5e4-323b57ae8f5e", name: "UTILITY WAIST BAG" },
    { id: "e9447c04-a11c-45aa-97f4-615a68bd088f", name: "PUFFER LINER" },
    { id: "f5819228-3c9c-4d59-89a3-84dce4a72bc8", name: "UTILITY SHORTS" },
    { id: "fe6258e9-5218-4d49-b88a-2574d3341735", name: "TERRAIN RUNNER GTX" },
] as const;

const REVIEW_CONTENT = [
    {
        rating: 5,
        headline: "WORTH THE CREDITS",
        body: "The materials feel premium, the construction is solid, and the design looks even better in person. A strong addition to the everyday rotation.",
    },
    {
        rating: 4,
        headline: "BUILT FOR DAILY USE",
        body: "Great overall quality and a clean technical design. Everything feels thoughtfully made. One small detail could be improved, but I am happy with it.",
    },
    {
        rating: 5,
        headline: "FIT IS EXACTLY AS EXPECTED",
        body: "The design, finish, and overall feel are excellent. It fits the HyperReal aesthetic perfectly and feels like a product made with attention to detail.",
    },
    {
        rating: 4,
        headline: "SOLID PIECE OF KIT",
        body: "Really good quality for the price. The details stand out without being too flashy, and it works well with the rest of my wardrobe.",
    },
] as const;

async function main() {
    console.log("Starting HyperReal review seeding...");
    console.log("DATABASE_URL exists:", Boolean(process.env.DATABASE_URL));
    console.log(
        "DATABASE_URL type:",
        typeof process.env.DATABASE_URL
    );


    const demoUsers = await prisma.user.findMany({
        where: {
            email: {
                startsWith: "october.customer.",
            },
        },
        select: {
            id: true,
            name: true,
            email: true,
        },
        orderBy: {
            email: "asc",
        },
        take: 4,
    });

    if (demoUsers.length < 4) {
        throw new Error(
            `Expected at least 4 demo users, found ${demoUsers.length}. Run your existing seed first.`
        );
    }

    const productIds = PRODUCTS.map((product) => product.id);

    const existingProducts = await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, name: true },
    });

    const existingProductIds = new Set(
        existingProducts.map((product) => product.id)
    );

    const missingProducts = PRODUCTS.filter(
        (product) => !existingProductIds.has(product.id)
    );

    if (missingProducts.length > 0) {
        console.warn(
            `Skipping ${missingProducts.length} product(s) whose IDs were not found in the database:`
        );

        for (const product of missingProducts) {
            console.warn(`- ${product.name}: ${product.id}`);
        }
    }

    const reviews = [];

    for (const [productIndex, product] of PRODUCTS.entries()) {
        if (!existingProductIds.has(product.id)) continue;

        for (const [reviewerIndex, user] of demoUsers.entries()) {
            const content =
                REVIEW_CONTENT[
                (productIndex + reviewerIndex) % REVIEW_CONTENT.length
                ];

            const headline =
                reviewerIndex === 0
                    ? content.headline
                    : content.headline;

            const ageInDays = 2 + ((productIndex * 3 + reviewerIndex * 7) % 45);

            reviews.push({
                productId: product.id,
                userId: user.id,
                rating: content.rating,
                headline,
                body: content.body,
                displayName: user.name.slice(0, 40),
                verifiedPurchase: false,
                createdAt: new Date(
                    Date.now() - ageInDays * 24 * 60 * 60 * 1000
                ),
            });
        }
    }

    const result = await prisma.review.createMany({
        data: reviews,
        skipDuplicates: true,
    });

    console.log(`Products in JSON: ${PRODUCTS.length}`);
    console.log(`Products found in database: ${existingProducts.length}`);
    console.log(`Review records prepared: ${reviews.length}`);
    console.log(`New reviews inserted: ${result.count}`);
    console.log(
        `Existing reviews skipped: ${reviews.length - result.count}`
    );
    console.log("Review seeding completed.");
}

main()
    .catch((error) => {
        console.error("Review seeding failed:", error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
