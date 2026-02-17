import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });


const COLOR_MAP = {
  neon: 'Neon Breach',
  black: 'Carbon Void',
};


const IMAGE_MAP: Record<
  string,
  { neon?: string; black?: string }
> = {
  // FOOTWEAR
  "stealth-slip": {
    neon: "https://res.cloudinary.com/dloasaxt1/image/upload/v1771323374/stealth-slip-lime_qswb2t.png",
    black: "https://res.cloudinary.com/dloasaxt1/image/upload/v1771323360/stealth-slip_gkngrw.jpg",
  },
  "platform-high": {
    neon: "https://res.cloudinary.com/dloasaxt1/image/upload/v1771322470/platform-high_qf1uqv.jpg",
    black: "https://res.cloudinary.com/dloasaxt1/image/upload/v1771322483/platform-high-black_ulpyj5.png",
  },
  "trail-runner": {
    neon: "https://res.cloudinary.com/dloasaxt1/image/upload/v1771323373/trail-runner_if8jhy.jpg",
    black: "https://res.cloudinary.com/dloasaxt1/image/upload/v1771323385/trail-runner-variant_n285lr.jpg",
  },

  // TOPS
  "neural-hoodie": {
    neon: "https://res.cloudinary.com/dloasaxt1/image/upload/v1771322472/neural-hoodie-lime_ln9lmt.png",
    black: "https://res.cloudinary.com/dloasaxt1/image/upload/v1771322469/neural-hoodie_br294l.jpg",
  },
  "geo-longsleeve": {
    neon: "https://res.cloudinary.com/dloasaxt1/image/upload/v1771322463/geo-longsleeve-lime_lpv4gm.png",
    black: "https://res.cloudinary.com/dloasaxt1/image/upload/v1771322507/geo-longsleeve_qdmr7a.jpg",
  },
  "mesh-tank": {
    neon: "https://res.cloudinary.com/dloasaxt1/image/upload/v1771322484/mesh-tank-lime_be5rbr.png",
    black: "https://res.cloudinary.com/dloasaxt1/image/upload/v1771322463/mesh-tank_npmise.jpg",
  },
  "tech-polo": {
    neon: "https://res.cloudinary.com/dloasaxt1/image/upload/v1771323383/tech-polo-lime_bxg42j.png",
    black: "https://res.cloudinary.com/dloasaxt1/image/upload/v1771323367/tech-polo_ifo8xt.jpg",
  },

  // BOTTOMS
  "cargo-pant": {
    neon: "https://res.cloudinary.com/dloasaxt1/image/upload/v1771322050/cargo-pant-lime_ocdnah.png",
    black: "https://res.cloudinary.com/dloasaxt1/image/upload/v1771322049/cargo-pant_nkdlt8.jpg",
  },
  "stealth-jogger": {
    neon: "https://res.cloudinary.com/dloasaxt1/image/upload/v1771323380/stealth-jogger-lime_q4iox7.png",
    black: "https://res.cloudinary.com/dloasaxt1/image/upload/v1771323353/stealth-jogger_kh38nn.jpg",
  },
  "wide-trouser": {
    neon: "https://res.cloudinary.com/dloasaxt1/image/upload/v1771323807/wide-trouser-green_iv2ici.png",
    black: "https://res.cloudinary.com/dloasaxt1/image/upload/v1771323776/wide-trouser_nrxuco.jpg",
  },
  "utility-shorts": {
    neon: "https://res.cloudinary.com/dloasaxt1/image/upload/v1771323784/utility-shorts-variant_gos7qt.jpg",
    black: "https://res.cloudinary.com/dloasaxt1/image/upload/v1771323776/utility-shorts_sfzerw.jpg",
  },
  "articulated-pant": {
    neon: "https://res.cloudinary.com/dloasaxt1/image/upload/v1771322051/articulated-pant-lime_a87yhc.png",
    black: "https://res.cloudinary.com/dloasaxt1/image/upload/v1771322049/articulated-pant_wpq7de.jpg",
  },

  // OUTERWEAR
  "cyber-parka": {
    neon: "https://res.cloudinary.com/dloasaxt1/image/upload/v1771322327/cyber-parka-lime_di6fnp.png",
    black: "https://res.cloudinary.com/dloasaxt1/image/upload/v1771322253/cyber-parka_dknatu.jpg",
  },
  "tactical-vest": {
    neon: "https://res.cloudinary.com/dloasaxt1/image/upload/v1771323395/tactical-vest-lime_lnuwpf.png",
    black: "https://res.cloudinary.com/dloasaxt1/image/upload/v1771323362/tactical-vest_l1il3e.jpg",
  },
  "stealth-bomber": {
    neon: "https://res.cloudinary.com/dloasaxt1/image/upload/v1771323380/stealth-bomber-lime_xdsxit.png",
    black: "https://res.cloudinary.com/dloasaxt1/image/upload/v1771323353/stealth-bomber_xztrub.jpg",
  },
  "asymm-windbreaker": {
    neon: "https://res.cloudinary.com/dloasaxt1/image/upload/v1771322051/asymm-windbreaker-lime_mtv4pc.png",
    black: "https://res.cloudinary.com/dloasaxt1/image/upload/v1771322049/asymm-windbreaker_pdligf.jpg",
  },
  "insulated-gilet": {
    neon: "https://res.cloudinary.com/dloasaxt1/image/upload/v1771322474/insulated-gilet-lime_zh7c5i.png",
    black: "https://res.cloudinary.com/dloasaxt1/image/upload/v1771322462/insulated-gilet_cbwj0p.jpg",
  },

  // ACCESSORIES
  "protocol-socks": {
    neon: "https://res.cloudinary.com/dloasaxt1/image/upload/v1771322464/protocol-socks-lime_wv4jna.png",
    black: "https://res.cloudinary.com/dloasaxt1/image/upload/v1771322470/protocol-socks_xkggnb.jpg",
  },
  "crossbody-bag": {
    neon: "https://res.cloudinary.com/dloasaxt1/image/upload/v1771322254/crossbody-bag-lime_ozargd.png",
    black: "https://res.cloudinary.com/dloasaxt1/image/upload/v1771322252/crossbody-bag_u8fzhj.jpg",
  },
  "ribbed-beanie": {
    neon: "https://res.cloudinary.com/dloasaxt1/image/upload/v1771323389/ribbed-beanie-lime_fq8hsj.png",
    black: "https://res.cloudinary.com/dloasaxt1/image/upload/v1771323353/ribbed-beanie_whgeeq.jpg",
  },
  "utility-belt": {
    neon: "https://res.cloudinary.com/dloasaxt1/image/upload/v1771323384/utility-belt-variant_yi1pu7.jpg",
    black: "https://res.cloudinary.com/dloasaxt1/image/upload/v1771323370/utility-belt_whv3ee.jpg",
  },
  "tech-gloves": {
    neon: "https://res.cloudinary.com/dloasaxt1/image/upload/v1771323394/tech-gloves-lime_pi8ny6.png",
    black: "https://res.cloudinary.com/dloasaxt1/image/upload/v1771323372/tech-gloves_smubib.jpg",
  },

  // BAGS
  "tactical-messenger": {
    neon: "https://res.cloudinary.com/dloasaxt1/image/upload/v1771323386/tactical-messenger-lime_axexm3.png",
    black: "https://res.cloudinary.com/dloasaxt1/image/upload/v1771323360/tactical-messenger_zijh8y.jpg",
  },
  "stealth-sling": {
    neon: "https://res.cloudinary.com/dloasaxt1/image/upload/v1771323390/stealth-sling-lime_q5ozoa.png",
    black: "https://res.cloudinary.com/dloasaxt1/image/upload/v1771323354/stealth-sling_bc6vn3.jpg",
  },
  "modular-backpack": {
    neon: "https://res.cloudinary.com/dloasaxt1/image/upload/v1771322483/modular-backpack-lime_vimqir.png",
    black: "https://res.cloudinary.com/dloasaxt1/image/upload/v1771322465/modular-backpack_jruyp6.jpg",
  },
  "utility-waist-bag": {
    neon: "https://res.cloudinary.com/dloasaxt1/image/upload/v1771323783/utility-waist-bag-variant_zouhbm.jpg",
    black: "https://res.cloudinary.com/dloasaxt1/image/upload/v1771323776/utility-waist-bag_jwwqbj.jpg",
  },

  // LAYERING
  "base-layer-top": {
    neon: "https://res.cloudinary.com/dloasaxt1/image/upload/v1771322049/base-layer-top_kqhm7b.jpg",
    black: "https://res.cloudinary.com/dloasaxt1/image/upload/v1771322050/base-layer-top-black_scs4mv.png",
  },
  "mid-layer-fleece": {
    neon: "https://res.cloudinary.com/dloasaxt1/image/upload/v1771322482/mid-layer-fleece-lime_jgux3b.png",
    black: "https://res.cloudinary.com/dloasaxt1/image/upload/v1771322464/mid-layer-fleece_icvilm.jpg",
  },
  "thermal-leggings": {
    neon: "https://res.cloudinary.com/dloasaxt1/image/upload/v1771323378/thermal-leggings-lime_rdpmt9.png",
    black: "https://res.cloudinary.com/dloasaxt1/image/upload/v1771323368/thermal-leggings_kjccgv.jpg",
  },
  "puffer-liner": {
    neon: "https://res.cloudinary.com/dloasaxt1/image/upload/v1771323353/puffer-liner-lime_jd61rn.png",
    black: "https://res.cloudinary.com/dloasaxt1/image/upload/v1771323353/puffer-liner_zdm1op.jpg",
  },

  // TECH GEAR
  "cyber-watch": {
    neon: "https://res.cloudinary.com/dloasaxt1/image/upload/v1771322260/cyber-watch_jprgyn.jpg",
    black: "https://res.cloudinary.com/dloasaxt1/image/upload/v1771322253/cyber-watch-black_mx2g0c.png",
  },
  "tactical-shades": {
    neon: "https://res.cloudinary.com/dloasaxt1/image/upload/v1771323375/tactical-shades-lime_ae2b0u.png",
    black: "https://res.cloudinary.com/dloasaxt1/image/upload/v1771323361/tactical-shades_cndopx.jpg",
  },
  "tech-mask": {
    neon: "https://res.cloudinary.com/dloasaxt1/image/upload/v1771323392/tech-mask-lime_h9jf0g.png",
    black: "https://res.cloudinary.com/dloasaxt1/image/upload/v1771323366/tech-mask_j219wm.jpg",
  },
  "wireless-pods": {
    neon: "https://res.cloudinary.com/dloasaxt1/image/upload/v1771323840/wireless-pods-green_ii4gjm.png",
    black: "https://res.cloudinary.com/dloasaxt1/image/upload/v1771323781/wireless-pods_cphprn.jpg",
  },
};


const PRODUCTS = [
  // FOOTWEAR
  {
    name: "STEALTH SLIP-ON",
    slug: "stealth-slip",
    categorySlug: "footwear",
    price: 135,
    description:
      "Minimalist slip-on sneakers with mesh panels and sleek silhouette. Perfect for urban mobility.",
    sizes: ["40", "41", "42", "43", "44", "45"],
  },
  {
    name: "PLATFORM HIGH-X",
    slug: "platform-high",
    categorySlug: "footwear",
    price: 220,
    description:
      "High-top platform sneakers with neon accents and technical straps. Statement piece for the bold.",
    sizes: ["40", "41", "42", "43", "44", "45"],
  },
  {
    name: "TERRAIN RUNNER GTX",
    slug: "trail-runner",
    categorySlug: "footwear",
    price: 195,
    description:
      "Technical trail running shoes with reflective details and aggressive tread for all-terrain performance.",
    sizes: ["40", "41", "42", "43", "44", "45"],
  },

  // TOPS
  {
    name: "NEURAL LINK HOODIE",
    slug: "neural-hoodie",
    categorySlug: "tops",
    price: 110,
    description:
      "Premium heavyweight hoodie with circuit-inspired embroidery. Double-layered hood, kangaroo pocket with hidden zip.",
    sizes: ["S", "M", "L", "XL"],
  },
  {
    name: "GEO-CUT LONGSLEEVE",
    slug: "geo-longsleeve",
    categorySlug: "tops",
    price: 85,
    description:
      "Oversized long sleeve with geometric seam details and asymmetric hem. Avant-garde silhouette.",
    sizes: ["S", "M", "L", "XL"],
  },
  {
    name: "TACTICAL MESH TANK",
    slug: "mesh-tank",
    categorySlug: "tops",
    price: 55,
    description:
      "Breathable mesh tank with utility straps and cyberpunk graphics. Layering essential.",
    sizes: ["S", "M", "L", "XL"],
  },
  {
    name: "TECH-ZIP POLO",
    slug: "tech-polo",
    categorySlug: "tops",
    price: 75,
    description:
      "Technical polo with concealed zipper and moisture-wicking fabric. Minimal techwear aesthetic.",
    sizes: ["S", "M", "L", "XL"],
  },

  // BOTTOMS
  {
    name: "TECH-CARGO PANT",
    slug: "cargo-pant",
    categorySlug: "bottoms",
    price: 120,
    description:
      "Water-resistant nylon ripstop cargo pants featuring 8 articulated pockets and magnetic fidlock buckle closures.",
    sizes: ["30", "32", "34", "36"],
  },
  {
    name: "STEALTH JOGGER",
    slug: "stealth-jogger",
    categorySlug: "bottoms",
    price: 95,
    description:
      "Tapered fit joggers with zippered pockets and elastic cuffs. Urban tactical comfort.",
    sizes: ["S", "M", "L", "XL"],
  },
  {
    name: "WIDE CARGO TROUSER",
    slug: "wide-trouser",
    categorySlug: "bottoms",
    price: 135,
    description:
      "Wide-leg trousers with adjustable straps and oversized cargo pockets. Avant-garde proportions.",
    sizes: ["30", "32", "34", "36"],
  },
  {
    name: "UTILITY SHORTS",
    slug: "utility-shorts",
    categorySlug: "bottoms",
    price: 75,
    description:
      "Technical shorts with utility belt and multiple cargo pockets. Summer tactical essential.",
    sizes: ["30", "32", "34", "36"],
  },
  {
    name: "ARTICULATED PANT",
    slug: "articulated-pant",
    categorySlug: "bottoms",
    price: 145,
    description:
      "Slim-fit pants with articulated knees and reflective piping. Designed for maximum mobility.",
    sizes: ["30", "32", "34", "36"],
  },

  // OUTERWEAR
  {
    name: "CYBER-SHELL PARKA",
    slug: "cyber-parka",
    categorySlug: "outerwear",
    price: 250,
    description:
      "Waterproof technical parka with sealed seams and modular hood system. DWR-coated ripstop shell.",
    sizes: ["S", "M", "L", "XL"],
  },
  {
    name: "TACTICAL VEST",
    slug: "tactical-vest",
    categorySlug: "outerwear",
    price: 140,
    description:
      "Modular tactical vest with MOLLE webbing system. Multiple attachment points for accessories.",
    sizes: ["S", "M", "L", "XL"],
  },
  {
    name: "STEALTH BOMBER",
    slug: "stealth-bomber",
    categorySlug: "outerwear",
    price: 180,
    description:
      "Lightweight bomber jacket with minimal design and hidden utility pockets. Classic redefined.",
    sizes: ["S", "M", "L", "XL"],
  },
  {
    name: "ASYMM WINDBREAKER",
    slug: "asymm-windbreaker",
    categorySlug: "outerwear",
    price: 165,
    description:
      "Packable windbreaker with asymmetric zipper and integrated hood. Weather-ready design.",
    sizes: ["S", "M", "L", "XL"],
  },
  {
    name: "INSULATED GILET",
    slug: "insulated-gilet",
    categorySlug: "outerwear",
    price: 155,
    description:
      "Insulated vest with high collar and multiple utility pockets. Layering essential for cold days.",
    sizes: ["S", "M", "L", "XL"],
  },

  // ACCESSORIES
  {
    name: "PROTOCOL SOCKS",
    slug: "protocol-socks",
    categorySlug: "accessories",
    price: 25,
    description:
      "Technical performance socks with reinforced heel and toe. Moisture-wicking fabric blend.",
    sizes: ["S/M", "L/XL"],
  },
  {
    name: "MODULAR CROSSBODY",
    slug: "crossbody-bag",
    categorySlug: "accessories",
    price: 85,
    description:
      "Crossbody bag with modular attachment system and MOLLE webbing. Urban carry essential.",
    sizes: ["ONE SIZE"],
  },
  {
    name: "RIBBED BEANIE",
    slug: "ribbed-beanie",
    categorySlug: "accessories",
    price: 35,
    description:
      "Ribbed texture beanie with subtle logo embroidery. Minimalist winter essential.",
    sizes: ["ONE SIZE"],
  },
  {
    name: "TACTICAL UTILITY BELT",
    slug: "utility-belt",
    categorySlug: "accessories",
    price: 65,
    description:
      "Utility belt with magnetic buckle and detachable pouches. Statement accessory.",
    sizes: ["S/M", "L/XL"],
  },
  {
    name: "TECH GLOVES",
    slug: "tech-gloves",
    categorySlug: "accessories",
    price: 55,
    description:
      "Touchscreen-compatible gloves with reinforced knuckles. Tactical protection meets everyday utility.",
    sizes: ["S", "M", "L", "XL"],
  },

  // BAGS
  {
    name: "TACTICAL MESSENGER",
    slug: "tactical-messenger",
    categorySlug: "bags",
    price: 145,
    description:
      "Tactical messenger bag with MOLLE webbing and modular straps. Multiple compartments for urban carry.",
    sizes: ["ONE SIZE"],
  },
  {
    name: "STEALTH SLING",
    slug: "stealth-sling",
    categorySlug: "bags",
    price: 95,
    description:
      "Minimalist sling bag with reflective details and waterproof fabric. Perfect for daily essentials.",
    sizes: ["ONE SIZE"],
  },
  {
    name: "MODULAR BACKPACK",
    slug: "modular-backpack",
    categorySlug: "bags",
    price: 195,
    description:
      "Technical backpack with angular design and multiple compartments. Futuristic urban storage solution.",
    sizes: ["ONE SIZE"],
  },
  {
    name: "UTILITY WAIST BAG",
    slug: "utility-waist-bag",
    categorySlug: "bags",
    price: 75,
    description:
      "Utility waist bag with neon accent zippers and multiple pockets. Hands-free urban mobility.",
    sizes: ["ONE SIZE"],
  },

  // LAYERING
  {
    name: "BASE LAYER TOP",
    slug: "base-layer-top",
    categorySlug: "layering",
    price: 65,
    description:
      "Compression base layer with seamless construction. Athletic fit for maximum performance layering.",
    sizes: ["S", "M", "L", "XL"],
  },
  {
    name: "MID-LAYER FLEECE",
    slug: "mid-layer-fleece",
    categorySlug: "layering",
    price: 125,
    description:
      "Technical fleece jacket with angular seams and zippered pockets. Essential warmth layer.",
    sizes: ["S", "M", "L", "XL"],
  },
  {
    name: "THERMAL LEGGINGS",
    slug: "thermal-leggings",
    categorySlug: "layering",
    price: 55,
    description:
      "Compression thermal leggings with reflective seam details. Cold weather base layer essential.",
    sizes: ["S", "M", "L", "XL"],
  },
  {
    name: "PUFFER LINER",
    slug: "puffer-liner",
    categorySlug: "layering",
    price: 155,
    description:
      "Lightweight insulated puffer liner jacket. Quilted pattern with futuristic silhouette.",
    sizes: ["S", "M", "L", "XL"],
  },

  // TECH GEAR
  {
    name: "CYBER WATCH",
    slug: "cyber-watch",
    categorySlug: "techgear",
    price: 285,
    description:
      "Futuristic timepiece with angular case and neon lime accents. Statement tech accessory.",
    sizes: ["ONE SIZE"],
  },
  {
    name: "TACTICAL SHADES",
    slug: "tactical-shades",
    categorySlug: "techgear",
    price: 145,
    description:
      "Angular tactical sunglasses with futuristic visor design. UV protection meets cyberpunk style.",
    sizes: ["ONE SIZE"],
  },
  {
    name: "TECH MASK PRO",
    slug: "tech-mask",
    categorySlug: "techgear",
    price: 95,
    description:
      "Advanced face mask with filtration system and angular design. Urban protection redefined.",
    sizes: ["S/M", "L/XL"],
  },
  {
    name: "WIRELESS PODS",
    slug: "wireless-pods",
    categorySlug: "techgear",
    price: 175,
    description:
      "Premium wireless earbuds in angular case. Techwear audio essential with immersive sound.",
    sizes: ["ONE SIZE"],
  },
];


async function main() {
  for (const item of PRODUCTS) {
    const category = await prisma.category.findUnique({
      where: { slug: item.categorySlug },
    });

    if (!category) {
      continue;
    }

    const existing = await prisma.product.findFirst({
      where: { name: item.name },
    });

    if (existing) {
      continue;
    }

    const product = await prisma.product.create({
      data: {
        name: item.name,
        description: item.description,
        price: item.price,
        categoryId: category.id,
      },
    });

    const imageSet = IMAGE_MAP[item.slug];

    if (imageSet?.neon) {
      await prisma.productImage.create({
        data: {
          productId: product.id,
          imageUrl: imageSet.neon,
          color: COLOR_MAP.neon,
        },
      });
    }

    if (imageSet?.black) {
      await prisma.productImage.create({
        data: {
          productId: product.id,
          imageUrl: imageSet.black,
          color: COLOR_MAP.black,
        },
      });
    }

    for (const size of item.sizes) {
      await prisma.productVariant.createMany({
        data: [
          {
            productId: product.id,
            size,
            color: COLOR_MAP.neon,
            stock: Math.floor(Math.random() * 20) + 10,
          },
          {
            productId: product.id,
            size,
            color: COLOR_MAP.black,
            stock: Math.floor(Math.random() * 20) + 10,
          },
        ],
      });
    }

  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
  });
