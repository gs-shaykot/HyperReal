--
-- PostgreSQL database dump
--

\restrict XzwB4fbh4xblc2K6CTxuMKQ7pSsdCBzgqVeke0f9xPaeFaTJwt0QphRvFxyEfJH

-- Dumped from database version 17.8 (ad62774)
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: neondb_owner
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO neondb_owner;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: neondb_owner
--

COMMENT ON SCHEMA public IS '';


--
-- Name: CouponType; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."CouponType" AS ENUM (
    'percent',
    'flat'
);


ALTER TYPE public."CouponType" OWNER TO neondb_owner;

--
-- Name: OrderStatus; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."OrderStatus" AS ENUM (
    'PENDING',
    'PROCESSING',
    'SHIPPED',
    'COMPLETED'
);


ALTER TYPE public."OrderStatus" OWNER TO neondb_owner;

--
-- Name: PaymentMethod; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."PaymentMethod" AS ENUM (
    'CARD',
    'COD',
    'BKASH'
);


ALTER TYPE public."PaymentMethod" OWNER TO neondb_owner;

--
-- Name: PaymentStatus; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."PaymentStatus" AS ENUM (
    'SUCCESS',
    'FAILED'
);


ALTER TYPE public."PaymentStatus" OWNER TO neondb_owner;

--
-- Name: Role; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."Role" AS ENUM (
    'USER',
    'ADMIN'
);


ALTER TYPE public."Role" OWNER TO neondb_owner;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Cart; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Cart" (
    id text NOT NULL,
    "userId" text NOT NULL
);


ALTER TABLE public."Cart" OWNER TO neondb_owner;

--
-- Name: CartItem; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."CartItem" (
    id text NOT NULL,
    "cartId" text NOT NULL,
    "variantId" text NOT NULL,
    quantity integer NOT NULL
);


ALTER TABLE public."CartItem" OWNER TO neondb_owner;

--
-- Name: Coupon; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Coupon" (
    id text NOT NULL,
    code text NOT NULL,
    type text NOT NULL,
    value double precision NOT NULL,
    "minSpend" double precision NOT NULL,
    "maxDiscount" double precision,
    "newUserOnly" boolean
);


ALTER TABLE public."Coupon" OWNER TO neondb_owner;

--
-- Name: Order; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Order" (
    id text NOT NULL,
    "userId" text NOT NULL,
    status public."OrderStatus" DEFAULT 'PENDING'::public."OrderStatus" NOT NULL,
    "totalAmount" double precision NOT NULL
);


ALTER TABLE public."Order" OWNER TO neondb_owner;

--
-- Name: OrderItem; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."OrderItem" (
    id text NOT NULL,
    "orderId" text NOT NULL,
    "variantId" text NOT NULL,
    quantity integer NOT NULL,
    "priceAtPurchase" double precision NOT NULL
);


ALTER TABLE public."OrderItem" OWNER TO neondb_owner;

--
-- Name: Payment; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Payment" (
    id text NOT NULL,
    "orderId" text NOT NULL,
    method public."PaymentMethod" NOT NULL,
    status public."PaymentStatus" NOT NULL,
    "transactionId" text NOT NULL
);


ALTER TABLE public."Payment" OWNER TO neondb_owner;

--
-- Name: Product; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Product" (
    id text NOT NULL,
    name text NOT NULL,
    description text NOT NULL,
    price double precision NOT NULL,
    "isAvailable" boolean DEFAULT true NOT NULL,
    "categoryId" text NOT NULL,
    "totalLikes" integer DEFAULT 0 NOT NULL,
    "totalSold" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Product" OWNER TO neondb_owner;

--
-- Name: ProductImage; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."ProductImage" (
    id text NOT NULL,
    "productId" text NOT NULL,
    "imageUrl" text NOT NULL,
    color text
);


ALTER TABLE public."ProductImage" OWNER TO neondb_owner;

--
-- Name: ProductVariant; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."ProductVariant" (
    id text NOT NULL,
    "productId" text NOT NULL,
    size text NOT NULL,
    color text NOT NULL,
    stock integer NOT NULL
);


ALTER TABLE public."ProductVariant" OWNER TO neondb_owner;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO neondb_owner;

--
-- Name: address; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.address (
    id text NOT NULL,
    "userId" text NOT NULL,
    street text NOT NULL,
    city text NOT NULL,
    state text NOT NULL,
    "zipCode" text NOT NULL,
    country text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.address OWNER TO neondb_owner;

--
-- Name: category; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.category (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.category OWNER TO neondb_owner;

--
-- Name: user; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."user" (
    id text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    password text,
    role public."Role" DEFAULT 'USER'::public."Role" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "PhotoUrl" text,
    "isVerified" boolean DEFAULT false NOT NULL,
    otp text,
    "otpExpiry" timestamp(3) without time zone,
    "isNewUser" boolean DEFAULT true NOT NULL
);


ALTER TABLE public."user" OWNER TO neondb_owner;

--
-- Data for Name: Cart; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Cart" (id, "userId") FROM stdin;
d69e9fa3-b417-4671-8447-1c663a5c70e3	ace17ca6-7e8c-42d9-9e02-d0a22929ff5d
\.


--
-- Data for Name: CartItem; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."CartItem" (id, "cartId", "variantId", quantity) FROM stdin;
c9bc56fc-9cea-46b5-bd18-fb291fb44cb1	d69e9fa3-b417-4671-8447-1c663a5c70e3	9efe1ed3-acb4-423e-8f7b-536e16d25b97	1
a7ce2f51-b5c3-4d8d-8be4-1632737a9954	d69e9fa3-b417-4671-8447-1c663a5c70e3	612bedf9-a637-42e0-af87-af2b59262b90	1
93347f76-6738-4051-9d1c-5ede43f38f0b	d69e9fa3-b417-4671-8447-1c663a5c70e3	ad252555-d232-43e9-9201-50d58701c13f	2
\.


--
-- Data for Name: Coupon; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Coupon" (id, code, type, value, "minSpend", "maxDiscount", "newUserOnly") FROM stdin;
f2d630ce-0bff-43a2-9dde-d168eea221c0	WELCOME10	percent	10	0	50	t
ce833249-0b0c-44bc-adde-d022b9267a8f	SAVE2000	flat	250	2000	\N	f
6c19c1fc-19f8-4f81-8f5e-2a4c4ecccf06	SAVE1000	flat	100	1000	\N	f
6c19c1fc-19f8-4f81-8f5e-1e3r3123gfkj	SAVE3000	flat\t	300	3000	\N	f
8c56yj87-19f8-4f81-8f5e-876nmjk916xs	SAVE20P	percent	20	2500	100	f
\.


--
-- Data for Name: Order; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Order" (id, "userId", status, "totalAmount") FROM stdin;
\.


--
-- Data for Name: OrderItem; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."OrderItem" (id, "orderId", "variantId", quantity, "priceAtPurchase") FROM stdin;
\.


--
-- Data for Name: Payment; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Payment" (id, "orderId", method, status, "transactionId") FROM stdin;
\.


--
-- Data for Name: Product; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Product" (id, name, description, price, "isAvailable", "categoryId", "totalLikes", "totalSold", "createdAt") FROM stdin;
42ce0e65-3ad4-4670-a6a1-2affc2497fe7	STEALTH SLIP-ON	Minimalist slip-on sneakers with mesh panels and sleek silhouette. Perfect for urban mobility.	135	t	d4520e1f-15aa-45af-bd04-3124a94dc3bd	0	0	2026-04-01 19:35:34.481
a6b4d8f4-e5c0-4def-a31c-d067cb9d7f73	PLATFORM HIGH-X	High-top platform sneakers with neon accents and technical straps. Statement piece for the bold.	220	t	d4520e1f-15aa-45af-bd04-3124a94dc3bd	0	0	2026-04-01 19:35:35.166
23a58873-7c2a-4ada-82e1-68a4a9946c57	TERRAIN RUNNER GTX	Technical trail running shoes with reflective details and aggressive tread for all-terrain performance.	195	t	d4520e1f-15aa-45af-bd04-3124a94dc3bd	0	0	2026-04-01 19:35:35.809
8124a07b-0c78-4c11-af5a-e5eec773ec2b	NEURAL LINK HOODIE	Premium heavyweight hoodie with circuit-inspired embroidery. Double-layered hood, kangaroo pocket with hidden zip.	110	t	f9605ba9-dd8e-451a-8cb0-534b7135caf5	0	0	2026-04-01 19:35:36.453
87e05854-8c3a-449f-89fd-6b586722fa50	GEO-CUT LONGSLEEVE	Oversized long sleeve with geometric seam details and asymmetric hem. Avant-garde silhouette.	85	t	f9605ba9-dd8e-451a-8cb0-534b7135caf5	0	0	2026-04-01 19:35:37.115
176b54ea-ef3a-4762-81ea-b1563e6f5666	TACTICAL MESH TANK	Breathable mesh tank with utility straps and cyberpunk graphics. Layering essential.	55	t	f9605ba9-dd8e-451a-8cb0-534b7135caf5	0	0	2026-04-01 19:35:37.764
ba9c48ec-bbf9-4e8b-bd95-57bdfc53071d	TECH-ZIP POLO	Technical polo with concealed zipper and moisture-wicking fabric. Minimal techwear aesthetic.	75	t	f9605ba9-dd8e-451a-8cb0-534b7135caf5	0	0	2026-04-01 19:35:38.399
68bffdb1-45d7-44f2-ac51-970038af166a	TECH-CARGO PANT	Water-resistant nylon ripstop cargo pants featuring 8 articulated pockets and magnetic fidlock buckle closures.	120	t	c87b8f8c-3c71-4ef3-95ac-91e897959daa	0	0	2026-04-01 19:35:39.045
53377f73-01da-43ae-a9ca-24b4e86b1f43	STEALTH JOGGER	Tapered fit joggers with zippered pockets and elastic cuffs. Urban tactical comfort.	95	t	c87b8f8c-3c71-4ef3-95ac-91e897959daa	0	0	2026-04-01 19:35:39.706
790147d4-d151-4a18-b509-77ccf5077757	WIDE CARGO TROUSER	Wide-leg trousers with adjustable straps and oversized cargo pockets. Avant-garde proportions.	135	t	c87b8f8c-3c71-4ef3-95ac-91e897959daa	0	0	2026-04-01 19:35:40.355
c08e79db-1d94-4d28-80a3-99e1935e6e63	UTILITY SHORTS	Technical shorts with utility belt and multiple cargo pockets. Summer tactical essential.	75	t	c87b8f8c-3c71-4ef3-95ac-91e897959daa	0	0	2026-04-01 19:35:40.988
46e57235-1478-4a50-9700-0161b1e4f555	ARTICULATED PANT	Slim-fit pants with articulated knees and reflective piping. Designed for maximum mobility.	145	t	c87b8f8c-3c71-4ef3-95ac-91e897959daa	0	0	2026-04-01 19:35:41.63
32ec3c35-1ced-418f-ab2f-3c060717d50d	CYBER-SHELL PARKA	Waterproof technical parka with sealed seams and modular hood system. DWR-coated ripstop shell.	250	t	10ac8178-5979-436c-9f11-d8cd2a5c8cab	0	0	2026-04-01 19:35:42.27
c6bd01f9-803e-4f2e-bfe2-cde2287dd2c3	TACTICAL VEST	Modular tactical vest with MOLLE webbing system. Multiple attachment points for accessories.	140	t	10ac8178-5979-436c-9f11-d8cd2a5c8cab	0	0	2026-04-01 19:35:42.918
51e3305e-8e83-4428-ba8a-32a5febeb75d	STEALTH BOMBER	Lightweight bomber jacket with minimal design and hidden utility pockets. Classic redefined.	180	t	10ac8178-5979-436c-9f11-d8cd2a5c8cab	0	0	2026-04-01 19:35:43.563
20d4ae6d-6ba8-4b8f-9c4f-b77658565d7d	ASYMM WINDBREAKER	Packable windbreaker with asymmetric zipper and integrated hood. Weather-ready design.	165	t	10ac8178-5979-436c-9f11-d8cd2a5c8cab	0	0	2026-04-01 19:35:44.204
a8d98ad3-1bb9-4484-9d18-2e3e50d413b9	INSULATED GILET	Insulated vest with high collar and multiple utility pockets. Layering essential for cold days.	155	t	10ac8178-5979-436c-9f11-d8cd2a5c8cab	0	0	2026-04-01 19:35:44.839
dffd9841-3129-4782-8f53-c216e9e4f9eb	PROTOCOL SOCKS	Technical performance socks with reinforced heel and toe. Moisture-wicking fabric blend.	25	t	dc5171c8-a187-445e-9bc8-5657a12fffc5	0	0	2026-04-01 19:35:45.476
559414c9-a9f2-4d8c-a202-951f3f6c78a0	MODULAR CROSSBODY	Crossbody bag with modular attachment system and MOLLE webbing. Urban carry essential.	85	t	dc5171c8-a187-445e-9bc8-5657a12fffc5	0	0	2026-04-01 19:35:46.121
67f60475-f618-4857-a576-9e28333fd7a2	RIBBED BEANIE	Ribbed texture beanie with subtle logo embroidery. Minimalist winter essential.	35	t	dc5171c8-a187-445e-9bc8-5657a12fffc5	0	0	2026-04-01 19:35:46.769
86fdbb4f-b7a1-410e-8879-1b4d154b0e1d	TACTICAL UTILITY BELT	Utility belt with magnetic buckle and detachable pouches. Statement accessory.	65	t	dc5171c8-a187-445e-9bc8-5657a12fffc5	0	0	2026-04-01 19:35:47.409
bf53dcd2-9628-491c-a557-e942610c7ab7	TECH GLOVES	Touchscreen-compatible gloves with reinforced knuckles. Tactical protection meets everyday utility.	55	t	dc5171c8-a187-445e-9bc8-5657a12fffc5	0	0	2026-04-01 19:35:48.042
9a325d01-dfe8-457b-bb9c-1d7a6c3b6d4a	TACTICAL MESSENGER	Tactical messenger bag with MOLLE webbing and modular straps. Multiple compartments for urban carry.	145	t	ffab08f5-3d43-4b12-9e80-d18a62ef55ec	0	0	2026-04-01 19:35:48.689
ab64ef26-d9cb-45e4-9710-d8a684d8d9e1	STEALTH SLING	Minimalist sling bag with reflective details and waterproof fabric. Perfect for daily essentials.	95	t	ffab08f5-3d43-4b12-9e80-d18a62ef55ec	0	0	2026-04-01 19:35:49.314
d1d2f329-e366-4587-a547-c6c4ecf8637d	MODULAR BACKPACK	Technical backpack with angular design and multiple compartments. Futuristic urban storage solution.	195	t	ffab08f5-3d43-4b12-9e80-d18a62ef55ec	0	0	2026-04-01 19:35:49.942
2b2f4d03-570b-4806-ba7b-278d6cc085be	UTILITY WAIST BAG	Utility waist bag with neon accent zippers and multiple pockets. Hands-free urban mobility.	75	t	ffab08f5-3d43-4b12-9e80-d18a62ef55ec	0	0	2026-04-01 19:35:50.569
aec88390-a2da-4ffa-af22-e00f09d7664a	BASE LAYER TOP	Compression base layer with seamless construction. Athletic fit for maximum performance layering.	65	t	4deb160c-7b24-46b5-8206-f40f9cbfec51	0	0	2026-04-01 19:35:51.223
13177363-1f33-4a9e-b9bf-717555eaa489	MID-LAYER FLEECE	Technical fleece jacket with angular seams and zippered pockets. Essential warmth layer.	125	t	4deb160c-7b24-46b5-8206-f40f9cbfec51	0	0	2026-04-01 19:35:51.856
ff55446a-1d6a-4fd8-96fa-3aa2ed583b49	THERMAL LEGGINGS	Compression thermal leggings with reflective seam details. Cold weather base layer essential.	55	t	4deb160c-7b24-46b5-8206-f40f9cbfec51	0	0	2026-04-01 19:35:52.505
8e72f4c3-3399-48ad-ade6-65ef3d46b429	PUFFER LINER	Lightweight insulated puffer liner jacket. Quilted pattern with futuristic silhouette.	155	t	4deb160c-7b24-46b5-8206-f40f9cbfec51	0	0	2026-04-01 19:35:53.14
9e727aae-9047-4ae6-88c1-c496ef58106b	CYBER WATCH	Futuristic timepiece with angular case and neon lime accents. Statement tech accessory.	285	t	95b09159-a59e-4076-9d7d-4e5bdaf968f1	0	0	2026-04-01 19:35:53.77
89086dfe-37be-4adb-ac13-089341da3ca1	TACTICAL SHADES	Angular tactical sunglasses with futuristic visor design. UV protection meets cyberpunk style.	145	t	95b09159-a59e-4076-9d7d-4e5bdaf968f1	0	0	2026-04-01 19:35:54.408
4315de28-11b8-428d-9801-079eba9f9195	TECH MASK PRO	Advanced face mask with filtration system and angular design. Urban protection redefined.	95	t	95b09159-a59e-4076-9d7d-4e5bdaf968f1	0	0	2026-04-01 19:35:55.036
b0fe7016-4320-49ec-bff3-57d127bf2fd4	WIRELESS PODS	Premium wireless earbuds in angular case. Techwear audio essential with immersive sound.	175	t	95b09159-a59e-4076-9d7d-4e5bdaf968f1	0	0	2026-04-01 19:35:55.656
\.


--
-- Data for Name: ProductImage; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."ProductImage" (id, "productId", "imageUrl", color) FROM stdin;
381df92e-5370-467c-8ad6-a187a89a206a	42ce0e65-3ad4-4670-a6a1-2affc2497fe7	https://res.cloudinary.com/dloasaxt1/image/upload/v1771323374/stealth-slip-lime_qswb2t.png	Neon Breach
7f104206-95d3-4873-b3c6-c58524ff2c5a	42ce0e65-3ad4-4670-a6a1-2affc2497fe7	https://res.cloudinary.com/dloasaxt1/image/upload/v1771323360/stealth-slip_gkngrw.jpg	Carbon Void
30318e53-1df8-4d92-804d-2e88b6e2c5ed	a6b4d8f4-e5c0-4def-a31c-d067cb9d7f73	https://res.cloudinary.com/dloasaxt1/image/upload/v1771322470/platform-high_qf1uqv.jpg	Neon Breach
87440de9-db70-45d7-91bc-d3c84d2cc5d7	a6b4d8f4-e5c0-4def-a31c-d067cb9d7f73	https://res.cloudinary.com/dloasaxt1/image/upload/v1771322483/platform-high-black_ulpyj5.png	Carbon Void
3e1cccde-4427-45fd-89fa-eb5596d0d101	23a58873-7c2a-4ada-82e1-68a4a9946c57	https://res.cloudinary.com/dloasaxt1/image/upload/v1771323373/trail-runner_if8jhy.jpg	Neon Breach
00bd6dc1-ebed-4a01-85b9-dbcb16fc6f32	23a58873-7c2a-4ada-82e1-68a4a9946c57	https://res.cloudinary.com/dloasaxt1/image/upload/v1771323385/trail-runner-variant_n285lr.jpg	Carbon Void
61ae88d4-4133-4a38-a777-e96654af0a68	8124a07b-0c78-4c11-af5a-e5eec773ec2b	https://res.cloudinary.com/dloasaxt1/image/upload/v1771322472/neural-hoodie-lime_ln9lmt.png	Neon Breach
392054b1-a385-4184-a4b5-48228b759099	8124a07b-0c78-4c11-af5a-e5eec773ec2b	https://res.cloudinary.com/dloasaxt1/image/upload/v1771322469/neural-hoodie_br294l.jpg	Carbon Void
371452e2-daec-40ca-b86d-edcce6226624	87e05854-8c3a-449f-89fd-6b586722fa50	https://res.cloudinary.com/dloasaxt1/image/upload/v1771322463/geo-longsleeve-lime_lpv4gm.png	Neon Breach
5a5d1bc1-6b55-4efb-b30b-f074d9c848e6	87e05854-8c3a-449f-89fd-6b586722fa50	https://res.cloudinary.com/dloasaxt1/image/upload/v1771322507/geo-longsleeve_qdmr7a.jpg	Carbon Void
253a7a3f-694a-4c11-b8ad-f7e06a42ce36	176b54ea-ef3a-4762-81ea-b1563e6f5666	https://res.cloudinary.com/dloasaxt1/image/upload/v1771322484/mesh-tank-lime_be5rbr.png	Neon Breach
b8fb4d75-a48e-4b1e-92bf-dd29b2c0fe07	176b54ea-ef3a-4762-81ea-b1563e6f5666	https://res.cloudinary.com/dloasaxt1/image/upload/v1771322463/mesh-tank_npmise.jpg	Carbon Void
6ec216bb-10c9-4a4f-8f01-abba2ab1ba9d	ba9c48ec-bbf9-4e8b-bd95-57bdfc53071d	https://res.cloudinary.com/dloasaxt1/image/upload/v1771323383/tech-polo-lime_bxg42j.png	Neon Breach
f740cdd2-63d5-4026-8c3b-b2a6ec4d3052	ba9c48ec-bbf9-4e8b-bd95-57bdfc53071d	https://res.cloudinary.com/dloasaxt1/image/upload/v1771323367/tech-polo_ifo8xt.jpg	Carbon Void
9813e532-b02d-4b22-8628-9d430d054276	68bffdb1-45d7-44f2-ac51-970038af166a	https://res.cloudinary.com/dloasaxt1/image/upload/v1771322050/cargo-pant-lime_ocdnah.png	Neon Breach
8548906a-8c0b-49fc-91fe-014f02e8889a	68bffdb1-45d7-44f2-ac51-970038af166a	https://res.cloudinary.com/dloasaxt1/image/upload/v1771322049/cargo-pant_nkdlt8.jpg	Carbon Void
56418040-6e85-4dc5-a804-99203df3f436	53377f73-01da-43ae-a9ca-24b4e86b1f43	https://res.cloudinary.com/dloasaxt1/image/upload/v1771323380/stealth-jogger-lime_q4iox7.png	Neon Breach
b88b0e79-bc9b-4e41-bef7-43b8ae65d9e9	53377f73-01da-43ae-a9ca-24b4e86b1f43	https://res.cloudinary.com/dloasaxt1/image/upload/v1771323353/stealth-jogger_kh38nn.jpg	Carbon Void
765e24aa-b3dc-4f13-8b58-b468b64bfc7b	790147d4-d151-4a18-b509-77ccf5077757	https://res.cloudinary.com/dloasaxt1/image/upload/v1771323807/wide-trouser-green_iv2ici.png	Neon Breach
62278105-9e41-42ef-945b-5b43f82ea4d9	790147d4-d151-4a18-b509-77ccf5077757	https://res.cloudinary.com/dloasaxt1/image/upload/v1771323776/wide-trouser_nrxuco.jpg	Carbon Void
e9513c67-37a6-4029-a9fa-0cca2266da65	c08e79db-1d94-4d28-80a3-99e1935e6e63	https://res.cloudinary.com/dloasaxt1/image/upload/v1771323784/utility-shorts-variant_gos7qt.jpg	Neon Breach
4060fdc0-fcaf-43a8-8c74-a9b48f4072f2	c08e79db-1d94-4d28-80a3-99e1935e6e63	https://res.cloudinary.com/dloasaxt1/image/upload/v1771323776/utility-shorts_sfzerw.jpg	Carbon Void
76cdabb8-6479-41e5-abf8-d96ac7550cef	46e57235-1478-4a50-9700-0161b1e4f555	https://res.cloudinary.com/dloasaxt1/image/upload/v1771322051/articulated-pant-lime_a87yhc.png	Neon Breach
5179c57b-3f48-49ef-9a46-5acf4ee3d025	46e57235-1478-4a50-9700-0161b1e4f555	https://res.cloudinary.com/dloasaxt1/image/upload/v1771322049/articulated-pant_wpq7de.jpg	Carbon Void
45929d13-9669-45a0-9e38-eed8fefc6a90	32ec3c35-1ced-418f-ab2f-3c060717d50d	https://res.cloudinary.com/dloasaxt1/image/upload/v1771322327/cyber-parka-lime_di6fnp.png	Neon Breach
fd2c6136-8c31-4852-8e3f-4983b3ef9af5	32ec3c35-1ced-418f-ab2f-3c060717d50d	https://res.cloudinary.com/dloasaxt1/image/upload/v1771322253/cyber-parka_dknatu.jpg	Carbon Void
280a3303-6407-4649-9e53-53651c6b19fb	c6bd01f9-803e-4f2e-bfe2-cde2287dd2c3	https://res.cloudinary.com/dloasaxt1/image/upload/v1771323395/tactical-vest-lime_lnuwpf.png	Neon Breach
15237ed0-0cd4-48cb-b176-5cfb1a9c06c2	c6bd01f9-803e-4f2e-bfe2-cde2287dd2c3	https://res.cloudinary.com/dloasaxt1/image/upload/v1771323362/tactical-vest_l1il3e.jpg	Carbon Void
76a8d9ea-b409-4f33-a1e8-812fb6a0d38b	51e3305e-8e83-4428-ba8a-32a5febeb75d	https://res.cloudinary.com/dloasaxt1/image/upload/v1771323380/stealth-bomber-lime_xdsxit.png	Neon Breach
869fa9ff-5304-45c9-bb4f-b12e4dcd75ce	51e3305e-8e83-4428-ba8a-32a5febeb75d	https://res.cloudinary.com/dloasaxt1/image/upload/v1771323353/stealth-bomber_xztrub.jpg	Carbon Void
5b58728f-26e3-49ae-b48e-11dfbfe281ef	20d4ae6d-6ba8-4b8f-9c4f-b77658565d7d	https://res.cloudinary.com/dloasaxt1/image/upload/v1771322051/asymm-windbreaker-lime_mtv4pc.png	Neon Breach
979e5e2c-dbf7-4cff-ac3f-32d50712827d	20d4ae6d-6ba8-4b8f-9c4f-b77658565d7d	https://res.cloudinary.com/dloasaxt1/image/upload/v1771322049/asymm-windbreaker_pdligf.jpg	Carbon Void
c7c4dfc0-9778-47df-aae2-83a71a88e5f6	a8d98ad3-1bb9-4484-9d18-2e3e50d413b9	https://res.cloudinary.com/dloasaxt1/image/upload/v1771322474/insulated-gilet-lime_zh7c5i.png	Neon Breach
73cd4215-174b-4cd7-93cb-307adc70f0dc	a8d98ad3-1bb9-4484-9d18-2e3e50d413b9	https://res.cloudinary.com/dloasaxt1/image/upload/v1771322462/insulated-gilet_cbwj0p.jpg	Carbon Void
f5a56130-ab7d-403d-8bec-9f156d77f2a2	dffd9841-3129-4782-8f53-c216e9e4f9eb	https://res.cloudinary.com/dloasaxt1/image/upload/v1771322464/protocol-socks-lime_wv4jna.png	Neon Breach
2b0cb8a8-46bb-418e-b5f0-25ccc4929602	dffd9841-3129-4782-8f53-c216e9e4f9eb	https://res.cloudinary.com/dloasaxt1/image/upload/v1771322470/protocol-socks_xkggnb.jpg	Carbon Void
f5887b9c-c392-4e8b-86e8-a0ce3f9da537	559414c9-a9f2-4d8c-a202-951f3f6c78a0	https://res.cloudinary.com/dloasaxt1/image/upload/v1771322254/crossbody-bag-lime_ozargd.png	Neon Breach
ddb63bea-a095-4823-9c45-a52b8fce6421	559414c9-a9f2-4d8c-a202-951f3f6c78a0	https://res.cloudinary.com/dloasaxt1/image/upload/v1771322252/crossbody-bag_u8fzhj.jpg	Carbon Void
d7fb044b-c7ad-4c3b-ad86-0b7240bc9084	67f60475-f618-4857-a576-9e28333fd7a2	https://res.cloudinary.com/dloasaxt1/image/upload/v1771323389/ribbed-beanie-lime_fq8hsj.png	Neon Breach
e746ba64-322b-40b9-8d36-00c2e354aa73	67f60475-f618-4857-a576-9e28333fd7a2	https://res.cloudinary.com/dloasaxt1/image/upload/v1771323353/ribbed-beanie_whgeeq.jpg	Carbon Void
4796beba-5dec-4c2c-ae12-ad969c4d6db0	86fdbb4f-b7a1-410e-8879-1b4d154b0e1d	https://res.cloudinary.com/dloasaxt1/image/upload/v1771323384/utility-belt-variant_yi1pu7.jpg	Neon Breach
4d15c73c-e07c-4dcb-84fd-0bda0ebdf429	86fdbb4f-b7a1-410e-8879-1b4d154b0e1d	https://res.cloudinary.com/dloasaxt1/image/upload/v1771323370/utility-belt_whv3ee.jpg	Carbon Void
59f623a0-4dab-4952-b3c5-449114952510	bf53dcd2-9628-491c-a557-e942610c7ab7	https://res.cloudinary.com/dloasaxt1/image/upload/v1771323394/tech-gloves-lime_pi8ny6.png	Neon Breach
299b1105-1375-4086-ad22-e494bde12565	bf53dcd2-9628-491c-a557-e942610c7ab7	https://res.cloudinary.com/dloasaxt1/image/upload/v1771323372/tech-gloves_smubib.jpg	Carbon Void
54fe7432-ae80-4e10-b570-bf7cae9f622e	9a325d01-dfe8-457b-bb9c-1d7a6c3b6d4a	https://res.cloudinary.com/dloasaxt1/image/upload/v1771323386/tactical-messenger-lime_axexm3.png	Neon Breach
e520fd3a-c4c2-42e0-9062-ff04721c48dc	9a325d01-dfe8-457b-bb9c-1d7a6c3b6d4a	https://res.cloudinary.com/dloasaxt1/image/upload/v1771323360/tactical-messenger_zijh8y.jpg	Carbon Void
cb88364d-709b-4eaa-8006-3bdba774d2ab	ab64ef26-d9cb-45e4-9710-d8a684d8d9e1	https://res.cloudinary.com/dloasaxt1/image/upload/v1771323390/stealth-sling-lime_q5ozoa.png	Neon Breach
d4603448-4fc8-4c48-ab07-39eb34ae303a	ab64ef26-d9cb-45e4-9710-d8a684d8d9e1	https://res.cloudinary.com/dloasaxt1/image/upload/v1771323354/stealth-sling_bc6vn3.jpg	Carbon Void
70d4914b-a2e1-4583-a86e-28ce2f8bf442	d1d2f329-e366-4587-a547-c6c4ecf8637d	https://res.cloudinary.com/dloasaxt1/image/upload/v1771322483/modular-backpack-lime_vimqir.png	Neon Breach
401f369f-f654-414b-8add-576610a66354	d1d2f329-e366-4587-a547-c6c4ecf8637d	https://res.cloudinary.com/dloasaxt1/image/upload/v1771322465/modular-backpack_jruyp6.jpg	Carbon Void
90ea73a9-3ce9-4d66-ad55-fe50d6f10601	2b2f4d03-570b-4806-ba7b-278d6cc085be	https://res.cloudinary.com/dloasaxt1/image/upload/v1771323783/utility-waist-bag-variant_zouhbm.jpg	Neon Breach
5abe12cc-64f9-445b-a1ab-cbc22948e9c4	2b2f4d03-570b-4806-ba7b-278d6cc085be	https://res.cloudinary.com/dloasaxt1/image/upload/v1771323776/utility-waist-bag_jwwqbj.jpg	Carbon Void
4c1650bd-4867-4d3b-9a41-601122167800	aec88390-a2da-4ffa-af22-e00f09d7664a	https://res.cloudinary.com/dloasaxt1/image/upload/v1771322049/base-layer-top_kqhm7b.jpg	Neon Breach
0c5f1e5d-81c6-49a0-8683-da1a2178a8fc	aec88390-a2da-4ffa-af22-e00f09d7664a	https://res.cloudinary.com/dloasaxt1/image/upload/v1771322050/base-layer-top-black_scs4mv.png	Carbon Void
8bbabe1f-ce47-4c1b-a91c-1c0dcf7d59b5	13177363-1f33-4a9e-b9bf-717555eaa489	https://res.cloudinary.com/dloasaxt1/image/upload/v1771322482/mid-layer-fleece-lime_jgux3b.png	Neon Breach
4294f44a-7db0-4886-a7dd-ecfea9a85a70	13177363-1f33-4a9e-b9bf-717555eaa489	https://res.cloudinary.com/dloasaxt1/image/upload/v1771322464/mid-layer-fleece_icvilm.jpg	Carbon Void
2524aa47-d911-48d7-b032-3c52eee941da	ff55446a-1d6a-4fd8-96fa-3aa2ed583b49	https://res.cloudinary.com/dloasaxt1/image/upload/v1771323378/thermal-leggings-lime_rdpmt9.png	Neon Breach
fca144b8-42a9-455b-a840-8919236dee2d	ff55446a-1d6a-4fd8-96fa-3aa2ed583b49	https://res.cloudinary.com/dloasaxt1/image/upload/v1771323368/thermal-leggings_kjccgv.jpg	Carbon Void
df6d00a7-3e4e-4a85-aacc-dd25cd26af4f	8e72f4c3-3399-48ad-ade6-65ef3d46b429	https://res.cloudinary.com/dloasaxt1/image/upload/v1771323353/puffer-liner-lime_jd61rn.png	Neon Breach
ed19a57c-9be5-4e8b-9a7d-07385485bdd4	8e72f4c3-3399-48ad-ade6-65ef3d46b429	https://res.cloudinary.com/dloasaxt1/image/upload/v1771323353/puffer-liner_zdm1op.jpg	Carbon Void
df74b2d0-0452-4c9e-ac00-92b3b7fecc5d	9e727aae-9047-4ae6-88c1-c496ef58106b	https://res.cloudinary.com/dloasaxt1/image/upload/v1771322260/cyber-watch_jprgyn.jpg	Neon Breach
b81f10e0-ace2-4aee-abb3-3bc6be5a2179	9e727aae-9047-4ae6-88c1-c496ef58106b	https://res.cloudinary.com/dloasaxt1/image/upload/v1771322253/cyber-watch-black_mx2g0c.png	Carbon Void
f83b9009-3ef6-46f4-b87b-a7e1453c9954	89086dfe-37be-4adb-ac13-089341da3ca1	https://res.cloudinary.com/dloasaxt1/image/upload/v1771323375/tactical-shades-lime_ae2b0u.png	Neon Breach
9a0cd7cf-7766-4173-b5d0-d0ed2551a926	89086dfe-37be-4adb-ac13-089341da3ca1	https://res.cloudinary.com/dloasaxt1/image/upload/v1771323361/tactical-shades_cndopx.jpg	Carbon Void
cdd12e3b-ef66-496e-8f07-c8a427577c3a	4315de28-11b8-428d-9801-079eba9f9195	https://res.cloudinary.com/dloasaxt1/image/upload/v1771323392/tech-mask-lime_h9jf0g.png	Neon Breach
3f9d8553-68b1-46e2-a7ed-6dcd82e69c9d	4315de28-11b8-428d-9801-079eba9f9195	https://res.cloudinary.com/dloasaxt1/image/upload/v1771323366/tech-mask_j219wm.jpg	Carbon Void
5f275736-7381-47ad-8c1e-f5dc0f096bb0	b0fe7016-4320-49ec-bff3-57d127bf2fd4	https://res.cloudinary.com/dloasaxt1/image/upload/v1771323840/wireless-pods-green_ii4gjm.png	Neon Breach
f1823cb5-c965-429b-a2f3-861e2b471245	b0fe7016-4320-49ec-bff3-57d127bf2fd4	https://res.cloudinary.com/dloasaxt1/image/upload/v1771323781/wireless-pods_cphprn.jpg	Carbon Void
\.


--
-- Data for Name: ProductVariant; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."ProductVariant" (id, "productId", size, color, stock) FROM stdin;
dc9c1a7c-ca94-4621-8aab-53bd5ef4ae1d	42ce0e65-3ad4-4670-a6a1-2affc2497fe7	40	Neon Breach	17
d4b6f927-956f-49d5-b031-514f90577142	42ce0e65-3ad4-4670-a6a1-2affc2497fe7	40	Carbon Void	24
b678f1bb-f9e8-419b-b2a7-a23efd3a84f0	42ce0e65-3ad4-4670-a6a1-2affc2497fe7	41	Neon Breach	19
612bedf9-a637-42e0-af87-af2b59262b90	42ce0e65-3ad4-4670-a6a1-2affc2497fe7	41	Carbon Void	26
80ddb09c-d170-4f23-8ccf-7e60eefbcbdc	42ce0e65-3ad4-4670-a6a1-2affc2497fe7	42	Neon Breach	25
46e886b3-a011-4746-8e41-47d22c17a6cb	42ce0e65-3ad4-4670-a6a1-2affc2497fe7	42	Carbon Void	18
5871f38c-5116-4254-8063-9de2f556e77c	42ce0e65-3ad4-4670-a6a1-2affc2497fe7	43	Neon Breach	26
68dc8d7c-6f45-4b22-aed9-33983cea1ef3	42ce0e65-3ad4-4670-a6a1-2affc2497fe7	43	Carbon Void	13
9fdfa8e3-f76d-4174-89e3-d9e476c4d550	42ce0e65-3ad4-4670-a6a1-2affc2497fe7	44	Neon Breach	12
b3fc9c95-cd30-4e72-8580-949ef34f8555	42ce0e65-3ad4-4670-a6a1-2affc2497fe7	44	Carbon Void	10
e6d5b229-4720-4ea1-b432-974a06ea8238	42ce0e65-3ad4-4670-a6a1-2affc2497fe7	45	Neon Breach	18
ee8909c9-c28c-4d06-a0e4-5b3cb620d724	42ce0e65-3ad4-4670-a6a1-2affc2497fe7	45	Carbon Void	17
c3dbd52d-8a57-4c8e-b8ea-c55e24cd92db	a6b4d8f4-e5c0-4def-a31c-d067cb9d7f73	40	Neon Breach	25
3cf3b2f8-4f77-480f-991d-39c96744c2d9	a6b4d8f4-e5c0-4def-a31c-d067cb9d7f73	40	Carbon Void	12
ad252555-d232-43e9-9201-50d58701c13f	a6b4d8f4-e5c0-4def-a31c-d067cb9d7f73	41	Neon Breach	23
6db4a6e8-c3bb-4dc6-92aa-4394926b4d1d	a6b4d8f4-e5c0-4def-a31c-d067cb9d7f73	41	Carbon Void	19
0b6bb11d-f0ea-4758-8550-7ba82d5d0ca1	a6b4d8f4-e5c0-4def-a31c-d067cb9d7f73	42	Neon Breach	15
aad33265-714c-4d7f-b312-8ea44d616f6c	a6b4d8f4-e5c0-4def-a31c-d067cb9d7f73	42	Carbon Void	19
048258c5-b295-487c-b2ce-dfde064b5d84	a6b4d8f4-e5c0-4def-a31c-d067cb9d7f73	43	Neon Breach	12
3d5a1692-d312-41ae-a8c9-908d87177526	a6b4d8f4-e5c0-4def-a31c-d067cb9d7f73	43	Carbon Void	22
a1501bb1-9588-4bd2-8ce1-ec7bcfd394ae	a6b4d8f4-e5c0-4def-a31c-d067cb9d7f73	44	Neon Breach	23
539c0f2c-2a18-43ba-b5f5-d26c837d9481	a6b4d8f4-e5c0-4def-a31c-d067cb9d7f73	44	Carbon Void	25
1756bd67-9268-47ca-9320-d27d3d72d4b9	a6b4d8f4-e5c0-4def-a31c-d067cb9d7f73	45	Neon Breach	17
7a8d32db-18ab-4776-b2d4-f325edcb9e16	a6b4d8f4-e5c0-4def-a31c-d067cb9d7f73	45	Carbon Void	17
852db90b-0551-4d7b-bcad-b98d4b201c39	23a58873-7c2a-4ada-82e1-68a4a9946c57	40	Neon Breach	10
6f629fda-3f48-43be-9ad6-08d1b605ba69	23a58873-7c2a-4ada-82e1-68a4a9946c57	40	Carbon Void	16
c398a155-672b-49c3-a405-968c968effe2	23a58873-7c2a-4ada-82e1-68a4a9946c57	41	Neon Breach	17
1d89a4ad-f278-44a8-8723-50fb3593ed7a	23a58873-7c2a-4ada-82e1-68a4a9946c57	41	Carbon Void	14
0cb7f7ca-4da2-448c-8e1a-350a9b6fa266	23a58873-7c2a-4ada-82e1-68a4a9946c57	42	Neon Breach	23
9e716ebb-3ae7-4df2-8176-016132280344	23a58873-7c2a-4ada-82e1-68a4a9946c57	42	Carbon Void	22
556b7107-20b8-40fb-af60-0d9f54e66658	23a58873-7c2a-4ada-82e1-68a4a9946c57	43	Neon Breach	23
0051b776-714a-4c5a-9e40-2abcd5c7a375	23a58873-7c2a-4ada-82e1-68a4a9946c57	43	Carbon Void	22
3da0ef7b-5777-4137-9553-6dcaa45e9faf	23a58873-7c2a-4ada-82e1-68a4a9946c57	44	Neon Breach	14
e2cff492-e976-4ae4-8970-c49edf44ac94	23a58873-7c2a-4ada-82e1-68a4a9946c57	44	Carbon Void	17
9926ae0b-5337-4282-bfb5-e055e1dfb982	23a58873-7c2a-4ada-82e1-68a4a9946c57	45	Neon Breach	29
39f75573-540a-4fc9-a1bd-d9e6161bfde8	23a58873-7c2a-4ada-82e1-68a4a9946c57	45	Carbon Void	17
d43be378-70be-4ff7-8292-492ecc0e26f7	8124a07b-0c78-4c11-af5a-e5eec773ec2b	S	Neon Breach	21
b8e96637-a30e-43d2-af4f-7b3acc8ff645	8124a07b-0c78-4c11-af5a-e5eec773ec2b	S	Carbon Void	24
7d1c9eb4-ac09-4e4e-951c-d251de90a629	8124a07b-0c78-4c11-af5a-e5eec773ec2b	M	Neon Breach	27
6a585fac-d1cb-4579-90bd-989dd67e7cf1	8124a07b-0c78-4c11-af5a-e5eec773ec2b	M	Carbon Void	28
82f77a33-e618-4ace-8308-41a6a0c45513	8124a07b-0c78-4c11-af5a-e5eec773ec2b	L	Neon Breach	29
7c3d08a4-93ee-4d13-8314-d86911ec3a4e	8124a07b-0c78-4c11-af5a-e5eec773ec2b	L	Carbon Void	17
8d42293d-3262-4e36-a034-781a52740f0b	8124a07b-0c78-4c11-af5a-e5eec773ec2b	XL	Neon Breach	24
c1cc45da-d974-41c9-a8f1-bccffdf010d8	8124a07b-0c78-4c11-af5a-e5eec773ec2b	XL	Carbon Void	22
07ff8b7f-6268-41c1-a281-b3527e069487	87e05854-8c3a-449f-89fd-6b586722fa50	S	Neon Breach	19
51772b00-a5b4-48ba-ae02-f637356a3539	87e05854-8c3a-449f-89fd-6b586722fa50	S	Carbon Void	10
db112e8c-322f-4491-ae2a-d319c734e37a	87e05854-8c3a-449f-89fd-6b586722fa50	M	Neon Breach	26
7f62d6b0-338c-4d3a-b837-5e437e7964b0	87e05854-8c3a-449f-89fd-6b586722fa50	M	Carbon Void	27
ab1114c8-174a-4fd4-ab90-a37ad246e272	87e05854-8c3a-449f-89fd-6b586722fa50	L	Neon Breach	28
608a3e4d-ab04-4de3-847e-633d243e0332	87e05854-8c3a-449f-89fd-6b586722fa50	L	Carbon Void	21
d217ebf8-9a4b-41c0-8310-11b60bc00cb3	87e05854-8c3a-449f-89fd-6b586722fa50	XL	Neon Breach	18
a0d99c16-828c-456c-b2cb-9a05f1e214ba	87e05854-8c3a-449f-89fd-6b586722fa50	XL	Carbon Void	13
ca5ee88e-9707-4072-bd6f-26deb9747afb	176b54ea-ef3a-4762-81ea-b1563e6f5666	S	Neon Breach	26
cdfd1408-19a8-4a0f-be2c-833821d3e867	176b54ea-ef3a-4762-81ea-b1563e6f5666	S	Carbon Void	24
cd21f0c3-8bbd-4585-b4cf-f8b47f7dbc78	176b54ea-ef3a-4762-81ea-b1563e6f5666	M	Neon Breach	28
9e12cf08-7b99-4de5-acc6-79a45de1965d	176b54ea-ef3a-4762-81ea-b1563e6f5666	M	Carbon Void	20
4e0e0c46-321b-4f30-ac63-d67e21d1b405	176b54ea-ef3a-4762-81ea-b1563e6f5666	L	Neon Breach	13
d949b0c4-ef63-4c97-8bdf-b278a1dadef5	176b54ea-ef3a-4762-81ea-b1563e6f5666	L	Carbon Void	14
68b057c3-6464-4306-b3cf-e846d88f2060	176b54ea-ef3a-4762-81ea-b1563e6f5666	XL	Neon Breach	10
f375d38c-7e37-4ad2-b49b-e2ac43ea474b	176b54ea-ef3a-4762-81ea-b1563e6f5666	XL	Carbon Void	11
32127404-8f6f-4b96-863e-7d10c219a7fc	ba9c48ec-bbf9-4e8b-bd95-57bdfc53071d	S	Neon Breach	13
5e33bfcb-de4e-42a7-86f7-fb745d45d274	ba9c48ec-bbf9-4e8b-bd95-57bdfc53071d	S	Carbon Void	11
07c8b84b-5484-4170-b743-faa1dce32e32	ba9c48ec-bbf9-4e8b-bd95-57bdfc53071d	M	Neon Breach	29
ea881aff-31a2-42e1-9b7b-5acbb70f0e8e	ba9c48ec-bbf9-4e8b-bd95-57bdfc53071d	M	Carbon Void	22
19b8f6fa-9d9b-4d31-80aa-763d58c27811	ba9c48ec-bbf9-4e8b-bd95-57bdfc53071d	L	Neon Breach	10
16ccd7b2-9b9b-4db5-b172-bed97557cdff	ba9c48ec-bbf9-4e8b-bd95-57bdfc53071d	L	Carbon Void	11
39ebb0a8-994d-4879-845e-4a1a695b2fb2	ba9c48ec-bbf9-4e8b-bd95-57bdfc53071d	XL	Neon Breach	13
00fae50f-4b0f-4f36-8041-3a28c7d18b39	ba9c48ec-bbf9-4e8b-bd95-57bdfc53071d	XL	Carbon Void	18
1df1ed60-5654-44e6-8a31-fa851ca91419	68bffdb1-45d7-44f2-ac51-970038af166a	30	Neon Breach	23
8f32f87c-e956-4a4d-ab4b-e780e75765a7	68bffdb1-45d7-44f2-ac51-970038af166a	30	Carbon Void	29
746e77ae-7e2e-4c5d-8282-cea71b07ad9c	68bffdb1-45d7-44f2-ac51-970038af166a	32	Neon Breach	22
ed191ccb-8508-49a2-8fda-23c547afc2a7	68bffdb1-45d7-44f2-ac51-970038af166a	32	Carbon Void	12
9affdb80-815a-4983-b6a4-2494cee55239	68bffdb1-45d7-44f2-ac51-970038af166a	34	Neon Breach	26
a9496a0a-75c6-4b16-836d-ec949e3bacd2	68bffdb1-45d7-44f2-ac51-970038af166a	34	Carbon Void	16
a65bf935-1e57-41a2-8665-6d86ba8b6f3e	68bffdb1-45d7-44f2-ac51-970038af166a	36	Neon Breach	28
f4aa90e8-93fd-4f0e-acd1-5b5c1f465364	68bffdb1-45d7-44f2-ac51-970038af166a	36	Carbon Void	13
8a22310f-fba1-4078-a06c-85ab52d56970	53377f73-01da-43ae-a9ca-24b4e86b1f43	S	Neon Breach	13
93ccf400-5d20-4cc4-a764-8d2104d730bf	53377f73-01da-43ae-a9ca-24b4e86b1f43	S	Carbon Void	11
f1e168e7-d354-4d0c-a7c5-ed4ef16c56dd	53377f73-01da-43ae-a9ca-24b4e86b1f43	M	Neon Breach	13
43bf643e-022e-4d8f-bf91-2e4c530a93f3	53377f73-01da-43ae-a9ca-24b4e86b1f43	M	Carbon Void	27
d46e01ff-d3d0-4df7-87d4-5fe138f4c0b7	53377f73-01da-43ae-a9ca-24b4e86b1f43	L	Neon Breach	20
e7a9f885-7ad2-4b10-bf51-4d9109c109b6	53377f73-01da-43ae-a9ca-24b4e86b1f43	L	Carbon Void	14
8c6b8613-2d7a-4d8f-8904-36da28efc847	53377f73-01da-43ae-a9ca-24b4e86b1f43	XL	Neon Breach	26
65f444c4-0ef2-41ee-a44b-612365b04969	53377f73-01da-43ae-a9ca-24b4e86b1f43	XL	Carbon Void	17
2b02d584-4776-40c1-882c-4674e9482e0c	790147d4-d151-4a18-b509-77ccf5077757	30	Neon Breach	16
7675356d-9bc1-4190-b1d2-30ddf17ee35a	790147d4-d151-4a18-b509-77ccf5077757	30	Carbon Void	16
844a521e-dc76-4a16-bc51-c4f279fdaaba	790147d4-d151-4a18-b509-77ccf5077757	32	Neon Breach	24
dbb79eca-88aa-4629-9315-e868d04c20e3	790147d4-d151-4a18-b509-77ccf5077757	32	Carbon Void	20
382e26f6-4aca-4539-9607-b5686f5ee324	790147d4-d151-4a18-b509-77ccf5077757	34	Neon Breach	24
3e8cc2ca-ff7e-4bea-8c50-5d13ba6561a3	790147d4-d151-4a18-b509-77ccf5077757	34	Carbon Void	12
06853855-6609-4624-927a-c5a4989c1a31	790147d4-d151-4a18-b509-77ccf5077757	36	Neon Breach	10
8bf5adeb-515a-47ea-8051-289db18dcbba	790147d4-d151-4a18-b509-77ccf5077757	36	Carbon Void	29
0b6cf748-35c4-423e-b858-9d78d50631ba	c08e79db-1d94-4d28-80a3-99e1935e6e63	30	Neon Breach	24
751258e8-906c-46d7-933f-2228b96359c0	c08e79db-1d94-4d28-80a3-99e1935e6e63	30	Carbon Void	20
bd311910-0dbe-4bf8-93e0-a740612f26e9	c08e79db-1d94-4d28-80a3-99e1935e6e63	32	Neon Breach	28
530c92b7-6dd1-4408-9ab4-f96569c3b5ec	c08e79db-1d94-4d28-80a3-99e1935e6e63	32	Carbon Void	13
a544b4ce-3851-4827-8220-2544b0eaf582	c08e79db-1d94-4d28-80a3-99e1935e6e63	34	Neon Breach	14
80f688de-2398-48d6-b372-d17d500dd780	c08e79db-1d94-4d28-80a3-99e1935e6e63	34	Carbon Void	20
b2b3869c-4b34-4acd-ad3e-bd1944ac2595	c08e79db-1d94-4d28-80a3-99e1935e6e63	36	Neon Breach	10
c2acb1be-cba9-4788-b53f-4e84c52fbfdb	c08e79db-1d94-4d28-80a3-99e1935e6e63	36	Carbon Void	18
08bf1f44-c63d-4dca-9701-c3ea6240ec87	46e57235-1478-4a50-9700-0161b1e4f555	30	Neon Breach	24
9b127438-8f9c-4665-958e-39825fc488b5	46e57235-1478-4a50-9700-0161b1e4f555	30	Carbon Void	17
11d82a80-08a3-44b8-9c4a-a474b5310b86	46e57235-1478-4a50-9700-0161b1e4f555	32	Neon Breach	27
328498b9-62a9-45df-a425-c70d983b4753	46e57235-1478-4a50-9700-0161b1e4f555	32	Carbon Void	22
c95cd4ac-a2ce-480f-b632-e9cda367cce0	46e57235-1478-4a50-9700-0161b1e4f555	34	Neon Breach	23
b8d693cc-3e5e-4eb4-a87f-1051708c1145	46e57235-1478-4a50-9700-0161b1e4f555	34	Carbon Void	28
82d6d8cf-8227-4926-a82c-3bc68621c646	46e57235-1478-4a50-9700-0161b1e4f555	36	Neon Breach	24
e5176135-859f-4790-9d22-ac728ff494bb	46e57235-1478-4a50-9700-0161b1e4f555	36	Carbon Void	14
c091c3ab-c424-4ea6-afcd-68dc466ab203	32ec3c35-1ced-418f-ab2f-3c060717d50d	S	Neon Breach	16
5a3f2e37-01a5-4962-bc2e-9bbf65f502cb	32ec3c35-1ced-418f-ab2f-3c060717d50d	S	Carbon Void	26
9e90a090-03cd-40bb-9dd5-24e302776542	32ec3c35-1ced-418f-ab2f-3c060717d50d	M	Neon Breach	22
2221d2e4-57ae-455d-8224-f6ee8246fa99	32ec3c35-1ced-418f-ab2f-3c060717d50d	M	Carbon Void	28
136eae6e-503a-42b1-b753-4099caff8f05	32ec3c35-1ced-418f-ab2f-3c060717d50d	L	Neon Breach	22
a28f4d49-5696-435b-bcd5-713cce581d28	32ec3c35-1ced-418f-ab2f-3c060717d50d	L	Carbon Void	24
ecf953aa-f6fd-4cff-8eec-7c491bede091	32ec3c35-1ced-418f-ab2f-3c060717d50d	XL	Neon Breach	23
43e0b24a-174c-476a-8d66-484b143fb1cb	32ec3c35-1ced-418f-ab2f-3c060717d50d	XL	Carbon Void	24
85de6591-2540-40f7-b9dd-007025972c7e	c6bd01f9-803e-4f2e-bfe2-cde2287dd2c3	S	Neon Breach	26
1d1772f7-e1b4-40c6-8913-0288c6dc54d5	c6bd01f9-803e-4f2e-bfe2-cde2287dd2c3	S	Carbon Void	11
6aa724ce-79b7-4cb0-9add-8203c591cd7c	c6bd01f9-803e-4f2e-bfe2-cde2287dd2c3	M	Neon Breach	22
3337336d-8147-4b1a-b46b-3377dcabb91b	c6bd01f9-803e-4f2e-bfe2-cde2287dd2c3	M	Carbon Void	29
9ba1112c-51ac-4724-918e-530f3a270e65	c6bd01f9-803e-4f2e-bfe2-cde2287dd2c3	L	Neon Breach	19
ca167f3a-4694-42eb-8e97-1f85cbdf7ca4	c6bd01f9-803e-4f2e-bfe2-cde2287dd2c3	L	Carbon Void	24
d8312df9-3637-409d-9a56-2434bfad4ef4	c6bd01f9-803e-4f2e-bfe2-cde2287dd2c3	XL	Neon Breach	11
4d17d999-cbb8-47b2-96d5-f618f4a6e37b	c6bd01f9-803e-4f2e-bfe2-cde2287dd2c3	XL	Carbon Void	15
aeb6f08f-986b-4ac4-80b9-133a4b7022d4	51e3305e-8e83-4428-ba8a-32a5febeb75d	S	Neon Breach	18
a3fbf065-1e17-4a65-9e25-86c09d4eee4a	51e3305e-8e83-4428-ba8a-32a5febeb75d	S	Carbon Void	10
42bdb4c9-0b1b-404b-8a49-52bebdf1958d	51e3305e-8e83-4428-ba8a-32a5febeb75d	M	Neon Breach	26
e05df1ab-f25d-4eea-8d01-69d4dad1ebe7	51e3305e-8e83-4428-ba8a-32a5febeb75d	M	Carbon Void	12
69410652-fe17-406d-a77f-556afb3d7313	51e3305e-8e83-4428-ba8a-32a5febeb75d	L	Neon Breach	18
a4683ac8-88f4-4fc2-be99-dc5cac87d821	51e3305e-8e83-4428-ba8a-32a5febeb75d	L	Carbon Void	28
9babb264-7a19-4078-8acc-d775543d4da2	51e3305e-8e83-4428-ba8a-32a5febeb75d	XL	Neon Breach	14
a2c50c1c-8150-48e0-a723-22dd0934f4a4	51e3305e-8e83-4428-ba8a-32a5febeb75d	XL	Carbon Void	27
3a61dd92-b18b-49ba-a280-eb76a4138429	20d4ae6d-6ba8-4b8f-9c4f-b77658565d7d	S	Neon Breach	15
59b6498b-b46f-47b9-ad07-360bfe5a81f4	20d4ae6d-6ba8-4b8f-9c4f-b77658565d7d	S	Carbon Void	17
f763268f-3d12-4f82-b32a-a2f6bb801c87	20d4ae6d-6ba8-4b8f-9c4f-b77658565d7d	M	Neon Breach	27
e1a991b1-4f91-4c81-9e9b-b0813cc994f6	20d4ae6d-6ba8-4b8f-9c4f-b77658565d7d	M	Carbon Void	22
8883ee86-db29-4099-8faa-15c6df4c9588	20d4ae6d-6ba8-4b8f-9c4f-b77658565d7d	L	Neon Breach	23
93d6ebe2-c1d1-4148-902d-72d498aed378	20d4ae6d-6ba8-4b8f-9c4f-b77658565d7d	L	Carbon Void	15
66574e15-1092-4a60-a412-a083c4da12ba	20d4ae6d-6ba8-4b8f-9c4f-b77658565d7d	XL	Neon Breach	17
cefc316f-b7ee-4e58-ab2b-c8ca73b4d6ea	20d4ae6d-6ba8-4b8f-9c4f-b77658565d7d	XL	Carbon Void	10
b826a992-369e-4727-979f-dbd60bd014e3	a8d98ad3-1bb9-4484-9d18-2e3e50d413b9	S	Neon Breach	12
ccd2c55d-2f42-4884-b468-fffa5d44728b	a8d98ad3-1bb9-4484-9d18-2e3e50d413b9	S	Carbon Void	26
9e1b517a-f823-4b1f-ae9d-005275759401	a8d98ad3-1bb9-4484-9d18-2e3e50d413b9	M	Neon Breach	26
38e1f1ec-5fec-42f8-ad2e-4fd649246918	a8d98ad3-1bb9-4484-9d18-2e3e50d413b9	M	Carbon Void	18
a7d7c976-a2a9-4cc9-8a1e-781e6630ee41	a8d98ad3-1bb9-4484-9d18-2e3e50d413b9	L	Neon Breach	14
93683b89-6859-4f26-9b72-98f93e1f6e2b	a8d98ad3-1bb9-4484-9d18-2e3e50d413b9	L	Carbon Void	18
a7d7e796-7967-4824-a171-233f7a19fb49	a8d98ad3-1bb9-4484-9d18-2e3e50d413b9	XL	Neon Breach	27
39534b76-7bac-4955-99db-4c35cf0a164b	a8d98ad3-1bb9-4484-9d18-2e3e50d413b9	XL	Carbon Void	11
c2c541db-c7e3-46eb-9379-e007daac9e96	dffd9841-3129-4782-8f53-c216e9e4f9eb	S/M	Neon Breach	15
7556e87f-d477-4550-8907-4aa96919ce80	dffd9841-3129-4782-8f53-c216e9e4f9eb	S/M	Carbon Void	27
79760ace-d37f-4ac7-8388-8fd20a639042	dffd9841-3129-4782-8f53-c216e9e4f9eb	L/XL	Neon Breach	21
09bd0efe-6761-490c-83a1-78a15006fb33	dffd9841-3129-4782-8f53-c216e9e4f9eb	L/XL	Carbon Void	21
d98f7613-f571-4800-b438-1cfedbb09a48	559414c9-a9f2-4d8c-a202-951f3f6c78a0	ONE SIZE	Neon Breach	10
a4c2401f-ccd3-40ca-b6f8-c0f3250c50e7	559414c9-a9f2-4d8c-a202-951f3f6c78a0	ONE SIZE	Carbon Void	16
dd2d5f2e-5fd8-46a9-be24-8b9bdc658d76	67f60475-f618-4857-a576-9e28333fd7a2	ONE SIZE	Neon Breach	13
df0d9387-b046-45df-a405-cd1a58b23f14	67f60475-f618-4857-a576-9e28333fd7a2	ONE SIZE	Carbon Void	13
ec5f27f3-492e-4a75-bb57-5adca6fcad8c	86fdbb4f-b7a1-410e-8879-1b4d154b0e1d	S/M	Neon Breach	27
aef89587-5b8b-4c89-b708-a417011db252	86fdbb4f-b7a1-410e-8879-1b4d154b0e1d	S/M	Carbon Void	18
8d941acb-99d7-45a8-b871-ce4e74600dfb	86fdbb4f-b7a1-410e-8879-1b4d154b0e1d	L/XL	Neon Breach	13
e8cbe3d4-edaa-474e-954f-6559cfb8807b	86fdbb4f-b7a1-410e-8879-1b4d154b0e1d	L/XL	Carbon Void	28
a887a39c-ef07-4291-b3dc-e335b04c089d	bf53dcd2-9628-491c-a557-e942610c7ab7	S	Neon Breach	29
1b632714-74b0-414f-bb24-f87ff1968b9d	bf53dcd2-9628-491c-a557-e942610c7ab7	S	Carbon Void	12
2a0b148f-d4ab-4229-be44-e06708bc8067	bf53dcd2-9628-491c-a557-e942610c7ab7	M	Neon Breach	14
d3f55127-b39d-401b-8338-1cb8605ade0c	bf53dcd2-9628-491c-a557-e942610c7ab7	M	Carbon Void	13
4a74fa5b-ec73-4765-9149-42c50a79a18f	bf53dcd2-9628-491c-a557-e942610c7ab7	L	Neon Breach	17
242bd63d-7d41-41ee-8298-74917ffce934	bf53dcd2-9628-491c-a557-e942610c7ab7	L	Carbon Void	20
fbe742f0-6f89-4a1b-8ca0-aa9b8ea41648	bf53dcd2-9628-491c-a557-e942610c7ab7	XL	Neon Breach	21
2b39a59c-7315-4a27-93e1-ad07c72c64e5	bf53dcd2-9628-491c-a557-e942610c7ab7	XL	Carbon Void	13
d3c510fa-cc15-48ff-939c-6c81bb5a2645	9a325d01-dfe8-457b-bb9c-1d7a6c3b6d4a	ONE SIZE	Neon Breach	28
ebc501a5-8009-43f2-b517-389fa39106d1	9a325d01-dfe8-457b-bb9c-1d7a6c3b6d4a	ONE SIZE	Carbon Void	25
60e72db1-85ad-4af5-aa8c-bd49839dda6f	ab64ef26-d9cb-45e4-9710-d8a684d8d9e1	ONE SIZE	Neon Breach	21
5ecb3825-2bdb-41ad-98ec-1bcdff728183	ab64ef26-d9cb-45e4-9710-d8a684d8d9e1	ONE SIZE	Carbon Void	23
3b7115e1-4b4f-4928-86cb-ee9965fc97a5	d1d2f329-e366-4587-a547-c6c4ecf8637d	ONE SIZE	Neon Breach	23
9efe1ed3-acb4-423e-8f7b-536e16d25b97	d1d2f329-e366-4587-a547-c6c4ecf8637d	ONE SIZE	Carbon Void	21
d1a30705-eb46-45bd-83b6-f98d3c5f0df2	2b2f4d03-570b-4806-ba7b-278d6cc085be	ONE SIZE	Neon Breach	28
e996e9f1-0936-4832-a8c3-fd5f5be0ff3e	2b2f4d03-570b-4806-ba7b-278d6cc085be	ONE SIZE	Carbon Void	22
5c308bf2-2816-4646-a7dc-6f141a70c448	aec88390-a2da-4ffa-af22-e00f09d7664a	S	Neon Breach	11
b40c361f-ad28-42e1-ad6c-13446caedf7b	aec88390-a2da-4ffa-af22-e00f09d7664a	S	Carbon Void	22
e013a305-e183-42b0-9c4b-5a3a3d80ed48	aec88390-a2da-4ffa-af22-e00f09d7664a	M	Neon Breach	20
cf37421c-9eb3-4c63-8958-9aac08d8d6aa	aec88390-a2da-4ffa-af22-e00f09d7664a	M	Carbon Void	15
93f81b06-c3a9-4336-9f4b-46ecbf4f6b5e	aec88390-a2da-4ffa-af22-e00f09d7664a	L	Neon Breach	23
ec1b5c85-25ed-4c79-8c94-7d96cf1b3a49	aec88390-a2da-4ffa-af22-e00f09d7664a	L	Carbon Void	26
b7497579-1df6-48b4-bae7-8dd078992822	aec88390-a2da-4ffa-af22-e00f09d7664a	XL	Neon Breach	19
104d6413-fd7b-4885-97c7-4a2d2858ab5a	aec88390-a2da-4ffa-af22-e00f09d7664a	XL	Carbon Void	19
6cf2f1b9-24ee-4142-8d8f-0bb531907758	13177363-1f33-4a9e-b9bf-717555eaa489	S	Neon Breach	24
78ddbaa1-174b-4145-9564-4f18ed44c234	13177363-1f33-4a9e-b9bf-717555eaa489	S	Carbon Void	22
6b64c4a5-c64b-4fd6-9631-8960fed518a3	13177363-1f33-4a9e-b9bf-717555eaa489	M	Neon Breach	22
31dc9f28-6035-482b-b6d2-a75b398d0a95	13177363-1f33-4a9e-b9bf-717555eaa489	M	Carbon Void	21
95372e8b-cf3b-4cdb-85be-58e70d642290	13177363-1f33-4a9e-b9bf-717555eaa489	L	Neon Breach	20
eb355d19-231b-41fe-b528-393d54f80050	13177363-1f33-4a9e-b9bf-717555eaa489	L	Carbon Void	23
1901eee4-7009-4855-84b5-cd36519362ce	13177363-1f33-4a9e-b9bf-717555eaa489	XL	Neon Breach	20
05525c52-de93-4a1a-a4e5-be1ab9f9775c	13177363-1f33-4a9e-b9bf-717555eaa489	XL	Carbon Void	17
228cbc98-8e3d-4f89-8d1d-a36d675b1450	ff55446a-1d6a-4fd8-96fa-3aa2ed583b49	S	Neon Breach	15
8e06ee73-1dc4-43bc-98bc-edc4d9729671	ff55446a-1d6a-4fd8-96fa-3aa2ed583b49	S	Carbon Void	21
34693e43-ffb2-4caa-92df-e012b128e4ae	ff55446a-1d6a-4fd8-96fa-3aa2ed583b49	M	Neon Breach	14
951e54fb-5c83-4277-aac6-9ba1a4d39391	ff55446a-1d6a-4fd8-96fa-3aa2ed583b49	M	Carbon Void	13
3a060702-d169-4fa7-8cb7-b180c9b1fb38	ff55446a-1d6a-4fd8-96fa-3aa2ed583b49	L	Neon Breach	17
e1ec3d15-11d2-4056-9d49-08ec3074b36d	ff55446a-1d6a-4fd8-96fa-3aa2ed583b49	L	Carbon Void	29
422ac47a-fb71-435e-a65a-577abb188731	ff55446a-1d6a-4fd8-96fa-3aa2ed583b49	XL	Neon Breach	10
b692bac4-c8aa-4e0f-914e-6e4a3e4bdcae	ff55446a-1d6a-4fd8-96fa-3aa2ed583b49	XL	Carbon Void	19
ba9f4ea5-461a-40ae-99d3-8673a1dba7b3	8e72f4c3-3399-48ad-ade6-65ef3d46b429	S	Neon Breach	29
f0f5fd1f-7961-4904-98fa-d93e52af514e	8e72f4c3-3399-48ad-ade6-65ef3d46b429	S	Carbon Void	10
8ac24f0a-471a-4ad9-8402-0bb483666cff	8e72f4c3-3399-48ad-ade6-65ef3d46b429	M	Neon Breach	15
86021816-2777-40e3-83e2-8fe93ee3fb15	8e72f4c3-3399-48ad-ade6-65ef3d46b429	M	Carbon Void	21
c930016a-cf6c-4efa-982d-d0ad873bd135	8e72f4c3-3399-48ad-ade6-65ef3d46b429	L	Neon Breach	12
e78aa259-94cf-4367-9bdf-dca50400053a	8e72f4c3-3399-48ad-ade6-65ef3d46b429	L	Carbon Void	27
96c973c8-d067-43c1-86c1-a8d51f909485	8e72f4c3-3399-48ad-ade6-65ef3d46b429	XL	Neon Breach	23
44cc8080-81fb-48d0-9220-f85c5a5831d7	8e72f4c3-3399-48ad-ade6-65ef3d46b429	XL	Carbon Void	26
111a688e-c070-4256-a859-e3ebf6f589ae	9e727aae-9047-4ae6-88c1-c496ef58106b	ONE SIZE	Neon Breach	20
67319cab-c3ed-4b88-95f1-1a6ff06a0f46	9e727aae-9047-4ae6-88c1-c496ef58106b	ONE SIZE	Carbon Void	25
ce46b919-2cc5-4bc0-bacb-5a560732ed35	89086dfe-37be-4adb-ac13-089341da3ca1	ONE SIZE	Neon Breach	29
e2c5736f-3316-480e-ad56-abfd726ab331	89086dfe-37be-4adb-ac13-089341da3ca1	ONE SIZE	Carbon Void	21
94e32b8b-d18f-4599-8ea9-5488fdbce899	4315de28-11b8-428d-9801-079eba9f9195	S/M	Neon Breach	13
f39f309f-428c-4d4e-a4f9-b598afabb774	4315de28-11b8-428d-9801-079eba9f9195	S/M	Carbon Void	27
46b05fd4-4922-4969-a4db-1a1bd340e08a	4315de28-11b8-428d-9801-079eba9f9195	L/XL	Neon Breach	13
b758679d-021b-4b56-b060-d610beaf8fc7	4315de28-11b8-428d-9801-079eba9f9195	L/XL	Carbon Void	13
ebc62cfb-6a77-4820-851b-1bc1b073c5b9	b0fe7016-4320-49ec-bff3-57d127bf2fd4	ONE SIZE	Neon Breach	14
d727a415-ae55-48c7-b94f-3e4ec2d64b10	b0fe7016-4320-49ec-bff3-57d127bf2fd4	ONE SIZE	Carbon Void	26
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
acdf97f2-3834-4157-a446-f049c1ac344a	2fff4bcdb9d60744c0c8613285fb208580a5c609f3a56ce3bbabcf48ea7352fd	2026-04-01 19:30:10.153102+00	20260112204748_init	\N	\N	2026-04-01 19:30:07.302761+00	1
6a43e796-d0ac-46b3-92fe-4ed505fcfb73	c2d310ad95c5d7e968f73f7923682f2ed2c4e0b8b6e4b3a1921ff32d57ff8ff7	2026-04-01 19:30:10.815271+00	20260113140905_init	\N	\N	2026-04-01 19:30:10.313439+00	1
2786a1de-ec57-44f5-8ce0-41b3c4ffe57e	4810760e97a3b3f3e616d3eb685002256f08c47c62d6a1b64a443896a901381f	2026-04-01 19:30:11.731644+00	20260113141444_init	\N	\N	2026-04-01 19:30:10.975773+00	1
42e842bb-f3d1-4491-a55c-5eee72aae2bb	76ff479fc5dce53a062fe76f2098074525eae77971df997230c3f7bc616422f9	2026-04-01 19:30:12.311166+00	20260113142921_init	\N	\N	2026-04-01 19:30:11.891103+00	1
89d71d72-477e-4c68-8114-f4e599f98808	bed0ff9c9e0efad2f31ba0ea6d0948799d347e632eb2f1f579777613e3a239c5	2026-04-01 19:30:12.887493+00	20260114151825_init	\N	\N	2026-04-01 19:30:12.477156+00	1
6d63e77b-a8e3-48d2-811f-86fd5594a53d	2e5858c42246cd9b6e9c8cdbc306a603555aaed8577e43f7948bbda0378c9957	2026-04-01 19:30:13.460492+00	20260114154842_init	\N	\N	2026-04-01 19:30:13.057142+00	1
84f74011-3d94-4229-a1d4-af4e911eeb00	c56bb402cf76ed858eebe435b08ef3cc9b7c42f4f563d541205d18fa6090b03f	2026-04-01 19:30:14.02486+00	20260217152546_add_product_metrics	\N	\N	2026-04-01 19:30:13.619675+00	1
b56906c5-aad9-4959-b3b9-38b8453b7cec	bd0a4f3abc16fb9030289c205af66abdd2b1d7f912bb03849aa75f3cde55c1ab	2026-04-01 19:30:14.599294+00	20260218123054_add_product_date_time	\N	\N	2026-04-01 19:30:14.184968+00	1
8ae11980-25f6-4e33-b0e7-a3f269a0566a	c283dc936692444fbc6b4dd56140989ac56013c1d59d376f50d6181ca106688d	2026-04-10 01:52:02.223214+00	20260410015201_added_otp_related_fields	\N	\N	2026-04-10 01:52:01.699635+00	1
011d09b0-5f96-4c5f-bfdb-85d3d5cbbfe9	d0b4539b594872958aa6f79c2c75bb25d53a26bc9ab2de1093075f54aef6e704	2026-04-13 17:01:37.166722+00	20260413170136_password_field_optional	\N	\N	2026-04-13 17:01:36.749059+00	1
01777e44-aaef-4871-929d-130d707c2a22	92bb278a53073bf4101b423a500ee4a50499ea669d586887ab8917591aa812be	2026-04-27 07:18:50.885404+00	20260427071849_add_coupon_and_user_field	\N	\N	2026-04-27 07:18:50.063274+00	1
\.


--
-- Data for Name: address; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.address (id, "userId", street, city, state, "zipCode", country, "createdAt") FROM stdin;
\.


--
-- Data for Name: category; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.category (id, name, slug, "createdAt") FROM stdin;
d4520e1f-15aa-45af-bd04-3124a94dc3bd	Footwear	footwear	2026-04-01 19:35:33.979
f9605ba9-dd8e-451a-8cb0-534b7135caf5	Tops	tops	2026-04-01 19:35:33.979
c87b8f8c-3c71-4ef3-95ac-91e897959daa	Bottoms	bottoms	2026-04-01 19:35:33.979
10ac8178-5979-436c-9f11-d8cd2a5c8cab	Outerwear	outerwear	2026-04-01 19:35:33.979
dc5171c8-a187-445e-9bc8-5657a12fffc5	Accessories	accessories	2026-04-01 19:35:33.979
ffab08f5-3d43-4b12-9e80-d18a62ef55ec	Bags	bags	2026-04-01 19:35:33.979
4deb160c-7b24-46b5-8206-f40f9cbfec51	Layering	layering	2026-04-01 19:35:33.979
95b09159-a59e-4076-9d7d-4e5bdaf968f1	Tech Gear	techgear	2026-04-01 19:35:33.979
\.


--
-- Data for Name: user; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."user" (id, name, email, password, role, "createdAt", "PhotoUrl", "isVerified", otp, "otpExpiry", "isNewUser") FROM stdin;
ace17ca6-7e8c-42d9-9e02-d0a22929ff5d	GS SHAYKOT	gsshaykot53@gmail.com	$argon2id$v=19$m=65536,t=3,p=4$iqxd3GtqVcrXWPMjqoUgXw$mA0lJtVAAEfrzwe4beAmfrsLGWCO5Cols83olQDjTvA	USER	2026-04-15 13:45:41.913	https://res.cloudinary.com/dloasaxt1/image/upload/e_background_removal/users/z1uzpuoo7budamnsoasf.png	t	252950	2026-04-15 14:19:56.587	t
\.


--
-- Name: CartItem CartItem_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."CartItem"
    ADD CONSTRAINT "CartItem_pkey" PRIMARY KEY (id);


--
-- Name: Cart Cart_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Cart"
    ADD CONSTRAINT "Cart_pkey" PRIMARY KEY (id);


--
-- Name: Coupon Coupon_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Coupon"
    ADD CONSTRAINT "Coupon_pkey" PRIMARY KEY (id);


--
-- Name: OrderItem OrderItem_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_pkey" PRIMARY KEY (id);


--
-- Name: Order Order_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_pkey" PRIMARY KEY (id);


--
-- Name: Payment Payment_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_pkey" PRIMARY KEY (id);


--
-- Name: ProductImage ProductImage_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."ProductImage"
    ADD CONSTRAINT "ProductImage_pkey" PRIMARY KEY (id);


--
-- Name: ProductVariant ProductVariant_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."ProductVariant"
    ADD CONSTRAINT "ProductVariant_pkey" PRIMARY KEY (id);


--
-- Name: Product Product_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: address address_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.address
    ADD CONSTRAINT address_pkey PRIMARY KEY (id);


--
-- Name: category category_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.category
    ADD CONSTRAINT category_pkey PRIMARY KEY (id);


--
-- Name: user user_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_pkey PRIMARY KEY (id);


--
-- Name: CartItem_cartId_variantId_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "CartItem_cartId_variantId_key" ON public."CartItem" USING btree ("cartId", "variantId");


--
-- Name: Cart_userId_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "Cart_userId_key" ON public."Cart" USING btree ("userId");


--
-- Name: Coupon_code_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "Coupon_code_key" ON public."Coupon" USING btree (code);


--
-- Name: ProductVariant_productId_size_color_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "ProductVariant_productId_size_color_key" ON public."ProductVariant" USING btree ("productId", size, color);


--
-- Name: category_name_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX category_name_key ON public.category USING btree (name);


--
-- Name: category_slug_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX category_slug_key ON public.category USING btree (slug);


--
-- Name: user_email_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX user_email_key ON public."user" USING btree (email);


--
-- Name: CartItem CartItem_cartId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."CartItem"
    ADD CONSTRAINT "CartItem_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES public."Cart"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: CartItem CartItem_variantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."CartItem"
    ADD CONSTRAINT "CartItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES public."ProductVariant"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Cart Cart_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Cart"
    ADD CONSTRAINT "Cart_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: OrderItem OrderItem_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: OrderItem OrderItem_variantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES public."ProductVariant"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Order Order_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Payment Payment_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ProductImage ProductImage_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."ProductImage"
    ADD CONSTRAINT "ProductImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ProductVariant ProductVariant_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."ProductVariant"
    ADD CONSTRAINT "ProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Product Product_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public.category(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: address address_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.address
    ADD CONSTRAINT "address_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: neondb_owner
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--

\unrestrict XzwB4fbh4xblc2K6CTxuMKQ7pSsdCBzgqVeke0f9xPaeFaTJwt0QphRvFxyEfJH

