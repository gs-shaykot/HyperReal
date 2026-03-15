--
-- PostgreSQL database dump
--

\restrict 09btnXdzrVm44E2QKpdiX0yqbzdBQh0072SY8GX2NmxAvJZ6AtSMmFXHLtNjLCF

-- Dumped from database version 18.1
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
-- Name: OrderStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."OrderStatus" AS ENUM (
    'PENDING',
    'PROCESSING',
    'SHIPPED',
    'COMPLETED'
);


ALTER TYPE public."OrderStatus" OWNER TO postgres;

--
-- Name: PaymentMethod; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PaymentMethod" AS ENUM (
    'CARD',
    'COD',
    'BKASH'
);


ALTER TYPE public."PaymentMethod" OWNER TO postgres;

--
-- Name: PaymentStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PaymentStatus" AS ENUM (
    'SUCCESS',
    'FAILED'
);


ALTER TYPE public."PaymentStatus" OWNER TO postgres;

--
-- Name: Role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Role" AS ENUM (
    'USER',
    'ADMIN'
);


ALTER TYPE public."Role" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Cart; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Cart" (
    id text NOT NULL,
    "userId" text NOT NULL
);


ALTER TABLE public."Cart" OWNER TO postgres;

--
-- Name: CartItem; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."CartItem" (
    id text NOT NULL,
    "cartId" text NOT NULL,
    "variantId" text NOT NULL,
    quantity integer NOT NULL
);


ALTER TABLE public."CartItem" OWNER TO postgres;

--
-- Name: Order; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Order" (
    id text NOT NULL,
    "userId" text NOT NULL,
    status public."OrderStatus" DEFAULT 'PENDING'::public."OrderStatus" NOT NULL,
    "totalAmount" double precision NOT NULL
);


ALTER TABLE public."Order" OWNER TO postgres;

--
-- Name: OrderItem; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."OrderItem" (
    id text NOT NULL,
    "orderId" text NOT NULL,
    "variantId" text NOT NULL,
    quantity integer NOT NULL,
    "priceAtPurchase" double precision NOT NULL
);


ALTER TABLE public."OrderItem" OWNER TO postgres;

--
-- Name: Payment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Payment" (
    id text NOT NULL,
    "orderId" text NOT NULL,
    method public."PaymentMethod" NOT NULL,
    status public."PaymentStatus" NOT NULL,
    "transactionId" text NOT NULL
);


ALTER TABLE public."Payment" OWNER TO postgres;

--
-- Name: Product; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public."Product" OWNER TO postgres;

--
-- Name: ProductImage; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ProductImage" (
    id text NOT NULL,
    "productId" text NOT NULL,
    "imageUrl" text NOT NULL,
    color text
);


ALTER TABLE public."ProductImage" OWNER TO postgres;

--
-- Name: ProductVariant; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ProductVariant" (
    id text NOT NULL,
    "productId" text NOT NULL,
    size text NOT NULL,
    color text NOT NULL,
    stock integer NOT NULL
);


ALTER TABLE public."ProductVariant" OWNER TO postgres;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: address; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.address OWNER TO postgres;

--
-- Name: category; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.category (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.category OWNER TO postgres;

--
-- Name: user; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."user" (
    id text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    role public."Role" DEFAULT 'USER'::public."Role" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "PhotoUrl" text
);


ALTER TABLE public."user" OWNER TO postgres;

--
-- Data for Name: Cart; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Cart" (id, "userId") FROM stdin;
\.


--
-- Data for Name: CartItem; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."CartItem" (id, "cartId", "variantId", quantity) FROM stdin;
\.


--
-- Data for Name: Order; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Order" (id, "userId", status, "totalAmount") FROM stdin;
\.


--
-- Data for Name: OrderItem; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."OrderItem" (id, "orderId", "variantId", quantity, "priceAtPurchase") FROM stdin;
\.


--
-- Data for Name: Payment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Payment" (id, "orderId", method, status, "transactionId") FROM stdin;
\.


--
-- Data for Name: Product; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Product" (id, name, description, price, "isAvailable", "categoryId", "totalLikes", "totalSold", "createdAt") FROM stdin;
bba3350b-11e5-470b-b9e1-f84be5e9acb0	CYBER WATCH	Futuristic timepiece with angular case and neon lime accents. Statement tech accessory.	285	t	c8	0	0	2026-02-10 12:30:54.622
1eb591e0-6f0c-4a7c-90de-83d1d3c58d47	TACTICAL SHADES	Angular tactical sunglasses with futuristic visor design. UV protection meets cyberpunk style.	145	t	c8	0	0	2026-02-10 12:30:54.622
c04832e9-1d37-45a6-8ad9-30a1fa31ff38	TECH MASK PRO	Advanced face mask with filtration system and angular design. Urban protection redefined.	95	t	c8	0	0	2026-02-10 12:30:54.622
fe7209bb-6a43-4d5f-84fb-ca2019d47c4b	UTILITY WAIST BAG	Utility waist bag with neon accent zippers and multiple pockets. Hands-free urban mobility.	75	t	c6	0	0	2026-02-10 12:30:54.622
381749e6-bdb1-46f1-9c59-b61e253105f4	BASE LAYER TOP	Compression base layer with seamless construction. Athletic fit for maximum performance layering.	65	t	c7	0	0	2026-02-10 12:30:54.622
0f52e776-fa72-4158-b627-05a6c6d02276	MID-LAYER FLEECE	Technical fleece jacket with angular seams and zippered pockets. Essential warmth layer.	125	t	c7	0	0	2026-02-10 12:30:54.622
cdba71d6-51cc-4138-8caf-3518be131cb1	THERMAL LEGGINGS	Compression thermal leggings with reflective seam details. Cold weather base layer essential.	55	t	c7	0	0	2026-02-10 12:30:54.622
4d0a9a6f-74a0-480d-a123-2f807ded6644	WIRELESS PODS	Premium wireless earbuds in angular case. Techwear audio essential with immersive sound.	175	t	c8	0	0	2026-02-10 12:30:54.622
03a5a7b6-239b-47f5-aaea-950b77ee8175	PLATFORM HIGH-X	High-top platform sneakers with neon accents and technical straps. Statement piece for the bold.	220	t	c1	6820	14200	2026-02-10 12:30:54.622
bfc851cd-81dd-40bb-b505-b502921271e0	STEALTH JOGGER	Tapered fit joggers with zippered pockets and elastic cuffs. Urban tactical comfort.	95	t	c4	2100	3200	2026-02-10 12:30:54.622
cf5ca13e-fb6b-48ed-b1d8-d46d26283eb0	TACTICAL UTILITY BELT	Utility belt with magnetic buckle and detachable pouches. Statement accessory.	65	t	c3	0	0	2026-02-17 18:30:54.622
a98a3e27-e9d6-4876-a2e8-6d779dc08a9b	TECH GLOVES	Touchscreen-compatible gloves with reinforced knuckles. Tactical protection meets everyday utility.	55	t	c3	0	0	2026-02-16 18:30:54.622
1e863612-621c-4855-80be-fd2de078126c	TACTICAL MESSENGER	Tactical messenger bag with MOLLE webbing and modular straps. Multiple compartments for urban carry.	145	t	c6	0	0	2026-02-15 18:30:54.622
71a9d5e3-a369-46a7-a42a-cdafb653f11c	STEALTH SLING	Minimalist sling bag with reflective details and waterproof fabric. Perfect for daily essentials.	95	t	c6	0	0	2026-02-14 18:30:54.622
p4	Data-Stream Cap	Structured 6-panel cap with embroidered data stream motif. Adjustable strap closure.	45	t	c3	0	0	2026-02-13 18:30:54.622
2d27688e-fe1b-4889-995c-da4bd24b088a	PUFFER LINER	Lightweight insulated puffer liner jacket. Quilted pattern with futuristic silhouette.	155	t	c7	3200	3300	2026-02-18 01:30:54.622
28d37f63-4da3-498b-a490-904791523737	MODULAR BACKPACK	Technical backpack with angular design and multiple compartments. Futuristic urban storage solution.	195	t	c6	0	4530	2026-02-10 12:30:54.622
p1	Void Runner V2	Technical running sneakers with adaptive cushioning system. Features mesh panels for breathability and angular design elements.	185	t	c1	4210	4300	2026-02-10 12:30:54.622
p2	Combat Boot MK-II	Futuristic combat boots with angular design and reflective panels. Chunky sole with advanced grip technology.	245	t	c1	0	0	2026-02-10 12:30:54.622
p3	Acid Wash Oversize Tee	Oversized silhouette with custom acid wash treatment. 100% organic cotton, heavyweight 280gsm fabric.	65	t	c2	0	0	2026-02-10 12:30:54.622
p5	STEALTH SLIP-ON	Minimalist slip-on sneakers with mesh panels and sleek silhouette. Perfect for urban mobility.	135	t	c1	0	0	2026-02-10 12:30:54.622
c945f8a2-947a-4965-a2f4-8762b34213b4	TERRAIN RUNNER GTX	Technical trail running shoes with reflective details and aggressive tread for all-terrain performance.	195	t	c1	0	0	2026-02-10 12:30:54.622
a5ed8852-0b32-4867-8505-fe99d065364a	NEURAL LINK HOODIE	Premium heavyweight hoodie with circuit-inspired embroidery.	110	t	c2	0	0	2026-02-10 12:30:54.622
d26084be-f48f-4405-9cc8-d317bed0f0ee	GEO-CUT LONGSLEEVE	Oversized long sleeve with geometric seam details.	85	t	c2	0	0	2026-02-10 12:30:54.622
64fb31e5-c7e9-4e52-9443-4ef1957f4c3f	TACTICAL MESH TANK	Breathable mesh tank with utility straps and cyberpunk graphics. Layering essential.	55	t	c2	0	0	2026-02-10 12:30:54.622
15087434-f62d-4153-9a0c-10e963602797	TECH-ZIP POLO	Technical polo with concealed zipper and moisture-wicking fabric. Minimal techwear aesthetic.	75	t	c2	0	0	2026-02-10 12:30:54.622
da4d949f-41b4-47b7-9159-a78cb6adc5f4	TECH-CARGO PANT	Water-resistant nylon ripstop cargo pants featuring 8 articulated pockets and magnetic fidlock buckle closures.	120	t	c4	0	0	2026-02-10 12:30:54.622
ce2fcb1f-1f25-439e-98cc-58d5563d3011	WIDE CARGO TROUSER	Wide-leg trousers with adjustable straps and oversized cargo pockets. Avant-garde proportions.	135	t	c4	0	0	2026-02-10 12:30:54.622
44992573-5da5-47ee-adf6-bd53bdc99111	UTILITY SHORTS	Technical shorts with utility belt and multiple cargo pockets. Summer tactical essential.	75	t	c4	0	0	2026-02-10 12:30:54.622
503a86ac-2ce8-41c3-9820-69268ebb0f18	ARTICULATED PANT	Slim-fit pants with articulated knees and reflective piping. Designed for maximum mobility.	145	t	c4	0	0	2026-02-10 12:30:54.622
ec291c1c-396e-4ae1-a2a1-c2a3e69298d2	CYBER-SHELL PARKA	Waterproof technical parka with sealed seams and modular hood system. DWR-coated ripstop shell.	250	t	c5	0	0	2026-02-10 12:30:54.622
9f4e8591-3237-43e9-a56b-e711d574aa69	TACTICAL VEST	Modular tactical vest with MOLLE webbing system. Multiple attachment points for accessories.	140	t	c5	0	0	2026-02-10 12:30:54.622
cef1dd08-e266-4421-81c4-bf782c9c4e62	STEALTH BOMBER	Lightweight bomber jacket with minimal design and hidden utility pockets. Classic redefined.	180	t	c5	0	0	2026-02-10 12:30:54.622
75cbceb1-accf-4309-afcf-53e05999bf15	ASYMM WINDBREAKER	Packable windbreaker with asymmetric zipper and integrated hood. Weather-ready design.	165	t	c5	0	0	2026-02-10 12:30:54.622
6b23846b-05b4-4595-be15-b4fba5452ba0	INSULATED GILET	Insulated vest with high collar and multiple utility pockets. Layering essential for cold days.	155	t	c5	0	0	2026-02-10 12:30:54.622
b3906d4b-077a-4545-8f17-4a5672b3456e	PROTOCOL SOCKS	Technical performance socks with reinforced heel and toe. Moisture-wicking fabric blend.	25	t	c3	0	0	2026-02-10 12:30:54.622
5a31d121-94b1-4365-a9f5-ae861d7a6905	MODULAR CROSSBODY	Crossbody bag with modular attachment system and MOLLE webbing. Urban carry essential.	85	t	c3	0	0	2026-02-10 12:30:54.622
fc69e5d3-4aa8-46b6-b6b3-a0a1cf583ad5	RIBBED BEANIE	Ribbed texture beanie with subtle logo embroidery. Minimalist winter essential.	35	t	c3	0	0	2026-02-10 12:30:54.622
\.


--
-- Data for Name: ProductImage; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ProductImage" (id, "productId", "imageUrl", color) FROM stdin;
pi1	p1	https://res.cloudinary.com/dloasaxt1/image/upload/v1768386382/void-runner_xdimb1.jpg	Neon Breach
pi2	p1	https://res.cloudinary.com/dloasaxt1/image/upload/v1769943837/void-runner-variant_ib3tz1.jpg	Carbon Void
pi3	p2	https://res.cloudinary.com/dloasaxt1/image/upload/v1769944945/combat-boot-lime_q3jz5o.png	Neon Breach
pi4	p2	https://res.cloudinary.com/dloasaxt1/image/upload/v1768386382/combat-boot_cwokdb.jpg	Carbon Void
pi5	p3	https://res.cloudinary.com/dloasaxt1/image/upload/v1769944947/acid-wash-tee-lime_jzqkfr.png	Neon Breach
pi6	p3	https://res.cloudinary.com/dloasaxt1/image/upload/v1770664518/acid-wash-tee_qniu6z.jpg	Carbon Void
pi7	p4	https://res.cloudinary.com/dloasaxt1/image/upload/v1769944926/data-cap-lime_bpjksp.png	Neon Breach
pi8	p4	https://res.cloudinary.com/dloasaxt1/image/upload/v1768386382/data-cap_aniz7p.jpg	Carbon Void
pi9	p5	https://res.cloudinary.com/dloasaxt1/image/upload/v1771323374/stealth-slip-lime_qswb2t.png	Neon Breach
pi10	p5	https://res.cloudinary.com/dloasaxt1/image/upload/v1771323360/stealth-slip_gkngrw.jpg	Carbon Void
98de628a-5799-4957-a2ea-57876d0cb374	03a5a7b6-239b-47f5-aaea-950b77ee8175	https://res.cloudinary.com/dloasaxt1/image/upload/v1771322470/platform-high_qf1uqv.jpg	Neon Breach
71000acd-439f-4394-a72d-b2e9029758e5	03a5a7b6-239b-47f5-aaea-950b77ee8175	https://res.cloudinary.com/dloasaxt1/image/upload/v1771322483/platform-high-black_ulpyj5.png	Carbon Void
c2f68540-3252-432f-a5d2-f12fbae35f0e	c945f8a2-947a-4965-a2f4-8762b34213b4	https://res.cloudinary.com/dloasaxt1/image/upload/v1771323373/trail-runner_if8jhy.jpg	Neon Breach
0efa9133-3f28-4d5e-9352-7aa8396388c2	c945f8a2-947a-4965-a2f4-8762b34213b4	https://res.cloudinary.com/dloasaxt1/image/upload/v1771323385/trail-runner-variant_n285lr.jpg	Carbon Void
1ec5d93c-3f3c-44fd-be17-31c51e439a28	a5ed8852-0b32-4867-8505-fe99d065364a	https://res.cloudinary.com/dloasaxt1/image/upload/v1771322472/neural-hoodie-lime_ln9lmt.png	Neon Breach
fc362044-6a03-4644-acf9-933cc937ab6b	a5ed8852-0b32-4867-8505-fe99d065364a	https://res.cloudinary.com/dloasaxt1/image/upload/v1771322469/neural-hoodie_br294l.jpg	Carbon Void
5e30d9b8-c7ba-467e-a924-b937fa39eb9e	d26084be-f48f-4405-9cc8-d317bed0f0ee	https://res.cloudinary.com/dloasaxt1/image/upload/v1771322463/geo-longsleeve-lime_lpv4gm.png	Neon Breach
e26794e4-674a-4f02-984e-095753fa99d6	d26084be-f48f-4405-9cc8-d317bed0f0ee	https://res.cloudinary.com/dloasaxt1/image/upload/v1771322507/geo-longsleeve_qdmr7a.jpg	Carbon Void
d1138d37-793a-4cb8-adcd-537bbd0c9128	64fb31e5-c7e9-4e52-9443-4ef1957f4c3f	https://res.cloudinary.com/dloasaxt1/image/upload/v1771322484/mesh-tank-lime_be5rbr.png	Neon Breach
c92d705b-3ac0-4c44-a600-5fa5f8617eb1	64fb31e5-c7e9-4e52-9443-4ef1957f4c3f	https://res.cloudinary.com/dloasaxt1/image/upload/v1771322463/mesh-tank_npmise.jpg	Carbon Void
3fe07430-403c-4c16-b607-f22bf180c577	15087434-f62d-4153-9a0c-10e963602797	https://res.cloudinary.com/dloasaxt1/image/upload/v1771323383/tech-polo-lime_bxg42j.png	Neon Breach
7f7309fc-f0a4-4a65-a7e8-0716ab938332	15087434-f62d-4153-9a0c-10e963602797	https://res.cloudinary.com/dloasaxt1/image/upload/v1771323367/tech-polo_ifo8xt.jpg	Carbon Void
7ef5e8f0-2044-4b67-a906-e68db8d01934	da4d949f-41b4-47b7-9159-a78cb6adc5f4	https://res.cloudinary.com/dloasaxt1/image/upload/v1771322050/cargo-pant-lime_ocdnah.png	Neon Breach
df6c2543-b2ea-4833-b2e3-0f37a3153f2b	da4d949f-41b4-47b7-9159-a78cb6adc5f4	https://res.cloudinary.com/dloasaxt1/image/upload/v1771322049/cargo-pant_nkdlt8.jpg	Carbon Void
6afe6a9b-12b4-4d7e-9b29-570f73184354	bfc851cd-81dd-40bb-b505-b502921271e0	https://res.cloudinary.com/dloasaxt1/image/upload/v1771323380/stealth-jogger-lime_q4iox7.png	Neon Breach
7ffb5da1-ff4c-4b77-9bc5-cb520c23b37a	bfc851cd-81dd-40bb-b505-b502921271e0	https://res.cloudinary.com/dloasaxt1/image/upload/v1771323353/stealth-jogger_kh38nn.jpg	Carbon Void
da0e19f7-b840-421b-b422-6bff8eb2c5cb	ce2fcb1f-1f25-439e-98cc-58d5563d3011	https://res.cloudinary.com/dloasaxt1/image/upload/v1771323807/wide-trouser-green_iv2ici.png	Neon Breach
5b90d67e-112e-4c07-a34e-834942a355ea	ce2fcb1f-1f25-439e-98cc-58d5563d3011	https://res.cloudinary.com/dloasaxt1/image/upload/v1771323776/wide-trouser_nrxuco.jpg	Carbon Void
21df334f-a69d-45b1-8d9e-13f0f21b6bf0	44992573-5da5-47ee-adf6-bd53bdc99111	https://res.cloudinary.com/dloasaxt1/image/upload/v1771323784/utility-shorts-variant_gos7qt.jpg	Neon Breach
b7625900-f3ee-4c40-8676-041d2cdba57d	44992573-5da5-47ee-adf6-bd53bdc99111	https://res.cloudinary.com/dloasaxt1/image/upload/v1771323776/utility-shorts_sfzerw.jpg	Carbon Void
95282224-f2ac-4c6d-b6e3-0107881efb76	503a86ac-2ce8-41c3-9820-69268ebb0f18	https://res.cloudinary.com/dloasaxt1/image/upload/v1771322051/articulated-pant-lime_a87yhc.png	Neon Breach
83733362-3763-4c19-b3e0-8fc1b01c76fa	503a86ac-2ce8-41c3-9820-69268ebb0f18	https://res.cloudinary.com/dloasaxt1/image/upload/v1771322049/articulated-pant_wpq7de.jpg	Carbon Void
ea95582f-3c63-49f3-8c92-f361f4a489c3	ec291c1c-396e-4ae1-a2a1-c2a3e69298d2	https://res.cloudinary.com/dloasaxt1/image/upload/v1771322327/cyber-parka-lime_di6fnp.png	Neon Breach
4d9ef1d2-3f5b-4a24-acab-6cb70c372d89	ec291c1c-396e-4ae1-a2a1-c2a3e69298d2	https://res.cloudinary.com/dloasaxt1/image/upload/v1771322253/cyber-parka_dknatu.jpg	Carbon Void
3e18eccf-89f6-43d2-9807-933aa5f089e2	9f4e8591-3237-43e9-a56b-e711d574aa69	https://res.cloudinary.com/dloasaxt1/image/upload/v1771323395/tactical-vest-lime_lnuwpf.png	Neon Breach
0c1ca929-3585-4a24-9ab7-da78ebf650a8	9f4e8591-3237-43e9-a56b-e711d574aa69	https://res.cloudinary.com/dloasaxt1/image/upload/v1771323362/tactical-vest_l1il3e.jpg	Carbon Void
0d6747cf-a25a-4298-8c7d-54ff0e3152e1	cef1dd08-e266-4421-81c4-bf782c9c4e62	https://res.cloudinary.com/dloasaxt1/image/upload/v1771323380/stealth-bomber-lime_xdsxit.png	Neon Breach
32f5b539-7ff7-4a13-a03f-6ba5b31e587c	cef1dd08-e266-4421-81c4-bf782c9c4e62	https://res.cloudinary.com/dloasaxt1/image/upload/v1771323353/stealth-bomber_xztrub.jpg	Carbon Void
f8974f6d-7707-4775-b930-ab9c287ab2c3	75cbceb1-accf-4309-afcf-53e05999bf15	https://res.cloudinary.com/dloasaxt1/image/upload/v1771322051/asymm-windbreaker-lime_mtv4pc.png	Neon Breach
ec141d07-dce6-441b-ba57-ad9db44bfcc8	75cbceb1-accf-4309-afcf-53e05999bf15	https://res.cloudinary.com/dloasaxt1/image/upload/v1771322049/asymm-windbreaker_pdligf.jpg	Carbon Void
6fe21513-495b-4e7f-a8de-feaa38069c4e	6b23846b-05b4-4595-be15-b4fba5452ba0	https://res.cloudinary.com/dloasaxt1/image/upload/v1771322474/insulated-gilet-lime_zh7c5i.png	Neon Breach
25a0531b-ad9a-4750-a84d-8548b07101e1	6b23846b-05b4-4595-be15-b4fba5452ba0	https://res.cloudinary.com/dloasaxt1/image/upload/v1771322462/insulated-gilet_cbwj0p.jpg	Carbon Void
7c870e00-a0c4-4361-b968-fa4f637efabc	b3906d4b-077a-4545-8f17-4a5672b3456e	https://res.cloudinary.com/dloasaxt1/image/upload/v1771322464/protocol-socks-lime_wv4jna.png	Neon Breach
e78c6543-d7b5-4282-a15b-9460a421a1e7	b3906d4b-077a-4545-8f17-4a5672b3456e	https://res.cloudinary.com/dloasaxt1/image/upload/v1771322470/protocol-socks_xkggnb.jpg	Carbon Void
377facef-a9a0-42cb-b911-2b6a6df4fbad	5a31d121-94b1-4365-a9f5-ae861d7a6905	https://res.cloudinary.com/dloasaxt1/image/upload/v1771322254/crossbody-bag-lime_ozargd.png	Neon Breach
4cab7e02-ebc8-4a29-86d9-fa8d6507ad81	5a31d121-94b1-4365-a9f5-ae861d7a6905	https://res.cloudinary.com/dloasaxt1/image/upload/v1771322252/crossbody-bag_u8fzhj.jpg	Carbon Void
96b76918-14e4-41e3-9540-12a7abec6d42	fc69e5d3-4aa8-46b6-b6b3-a0a1cf583ad5	https://res.cloudinary.com/dloasaxt1/image/upload/v1771323389/ribbed-beanie-lime_fq8hsj.png	Neon Breach
5c15b8cf-bae5-4426-b365-012d3150afa6	fc69e5d3-4aa8-46b6-b6b3-a0a1cf583ad5	https://res.cloudinary.com/dloasaxt1/image/upload/v1771323353/ribbed-beanie_whgeeq.jpg	Carbon Void
dc118830-9756-4131-bea3-608f5e496f66	cf5ca13e-fb6b-48ed-b1d8-d46d26283eb0	https://res.cloudinary.com/dloasaxt1/image/upload/v1771323384/utility-belt-variant_yi1pu7.jpg	Neon Breach
a8bea5f7-45aa-43a9-ba67-40585b134aab	cf5ca13e-fb6b-48ed-b1d8-d46d26283eb0	https://res.cloudinary.com/dloasaxt1/image/upload/v1771323370/utility-belt_whv3ee.jpg	Carbon Void
4309380a-d10f-410c-8bb4-7d5ac987cfb0	a98a3e27-e9d6-4876-a2e8-6d779dc08a9b	https://res.cloudinary.com/dloasaxt1/image/upload/v1771323394/tech-gloves-lime_pi8ny6.png	Neon Breach
9cb21dc6-0349-4fc1-a2a9-e4d759a86be5	a98a3e27-e9d6-4876-a2e8-6d779dc08a9b	https://res.cloudinary.com/dloasaxt1/image/upload/v1771323372/tech-gloves_smubib.jpg	Carbon Void
ec3b7c72-6ed0-4703-9273-2079a4000194	1e863612-621c-4855-80be-fd2de078126c	https://res.cloudinary.com/dloasaxt1/image/upload/v1771323386/tactical-messenger-lime_axexm3.png	Neon Breach
d3537afd-6831-4cd8-9364-a0e8336121af	1e863612-621c-4855-80be-fd2de078126c	https://res.cloudinary.com/dloasaxt1/image/upload/v1771323360/tactical-messenger_zijh8y.jpg	Carbon Void
d413a847-ab99-4732-8253-6b7ef81250ef	71a9d5e3-a369-46a7-a42a-cdafb653f11c	https://res.cloudinary.com/dloasaxt1/image/upload/v1771323390/stealth-sling-lime_q5ozoa.png	Neon Breach
9a11b257-ba7a-4233-9af3-0a9fc4dae9bf	71a9d5e3-a369-46a7-a42a-cdafb653f11c	https://res.cloudinary.com/dloasaxt1/image/upload/v1771323354/stealth-sling_bc6vn3.jpg	Carbon Void
e5a3046d-b596-4e6d-9f2d-b4e96c7b6e3e	28d37f63-4da3-498b-a490-904791523737	https://res.cloudinary.com/dloasaxt1/image/upload/v1771322483/modular-backpack-lime_vimqir.png	Neon Breach
ca7cf379-103c-4700-8d79-b3fcf34ddb16	28d37f63-4da3-498b-a490-904791523737	https://res.cloudinary.com/dloasaxt1/image/upload/v1771322465/modular-backpack_jruyp6.jpg	Carbon Void
d3b32c23-c00a-41c9-9c87-f809882d5ef6	fe7209bb-6a43-4d5f-84fb-ca2019d47c4b	https://res.cloudinary.com/dloasaxt1/image/upload/v1771323783/utility-waist-bag-variant_zouhbm.jpg	Neon Breach
b7815554-9018-4db6-b07b-5fc6fcf731ad	fe7209bb-6a43-4d5f-84fb-ca2019d47c4b	https://res.cloudinary.com/dloasaxt1/image/upload/v1771323776/utility-waist-bag_jwwqbj.jpg	Carbon Void
5ea333ec-cba1-4223-9be8-2afd257beeac	381749e6-bdb1-46f1-9c59-b61e253105f4	https://res.cloudinary.com/dloasaxt1/image/upload/v1771322049/base-layer-top_kqhm7b.jpg	Neon Breach
4f9ff231-6932-4c0c-8f94-ac433a434c9a	381749e6-bdb1-46f1-9c59-b61e253105f4	https://res.cloudinary.com/dloasaxt1/image/upload/v1771322050/base-layer-top-black_scs4mv.png	Carbon Void
3ba965e3-3fbc-43f0-aa8c-0cc630896449	0f52e776-fa72-4158-b627-05a6c6d02276	https://res.cloudinary.com/dloasaxt1/image/upload/v1771322482/mid-layer-fleece-lime_jgux3b.png	Neon Breach
1e2a8e57-b662-4357-9fc1-7c306b3338a8	0f52e776-fa72-4158-b627-05a6c6d02276	https://res.cloudinary.com/dloasaxt1/image/upload/v1771322464/mid-layer-fleece_icvilm.jpg	Carbon Void
1b5f5b07-33cb-4312-8419-91facb78d162	cdba71d6-51cc-4138-8caf-3518be131cb1	https://res.cloudinary.com/dloasaxt1/image/upload/v1771323378/thermal-leggings-lime_rdpmt9.png	Neon Breach
80ead058-f589-4be5-ba30-e988c636acf3	cdba71d6-51cc-4138-8caf-3518be131cb1	https://res.cloudinary.com/dloasaxt1/image/upload/v1771323368/thermal-leggings_kjccgv.jpg	Carbon Void
d0da00f5-6e13-4e60-add3-e08385fd32c5	2d27688e-fe1b-4889-995c-da4bd24b088a	https://res.cloudinary.com/dloasaxt1/image/upload/v1771323353/puffer-liner-lime_jd61rn.png	Neon Breach
9f5f5c50-ce98-4316-b1c7-ad9fd38f14f1	2d27688e-fe1b-4889-995c-da4bd24b088a	https://res.cloudinary.com/dloasaxt1/image/upload/v1771323353/puffer-liner_zdm1op.jpg	Carbon Void
93487993-7964-4e28-9351-8846f2794354	bba3350b-11e5-470b-b9e1-f84be5e9acb0	https://res.cloudinary.com/dloasaxt1/image/upload/v1771322260/cyber-watch_jprgyn.jpg	Neon Breach
da8412d7-9b32-4eac-b1df-013091d2c48b	bba3350b-11e5-470b-b9e1-f84be5e9acb0	https://res.cloudinary.com/dloasaxt1/image/upload/v1771322253/cyber-watch-black_mx2g0c.png	Carbon Void
0e061959-6071-4c62-83a4-756a6722f38a	1eb591e0-6f0c-4a7c-90de-83d1d3c58d47	https://res.cloudinary.com/dloasaxt1/image/upload/v1771323375/tactical-shades-lime_ae2b0u.png	Neon Breach
e1ef827e-85fe-45ed-9f32-ee40f3020db8	1eb591e0-6f0c-4a7c-90de-83d1d3c58d47	https://res.cloudinary.com/dloasaxt1/image/upload/v1771323361/tactical-shades_cndopx.jpg	Carbon Void
e545c466-f288-4084-91c7-18574c2363a3	c04832e9-1d37-45a6-8ad9-30a1fa31ff38	https://res.cloudinary.com/dloasaxt1/image/upload/v1771323392/tech-mask-lime_h9jf0g.png	Neon Breach
3d6bed1a-0d11-447b-ad92-436e69cd5f4a	c04832e9-1d37-45a6-8ad9-30a1fa31ff38	https://res.cloudinary.com/dloasaxt1/image/upload/v1771323366/tech-mask_j219wm.jpg	Carbon Void
e0f8b886-923f-425a-b1fa-53442764c3f1	4d0a9a6f-74a0-480d-a123-2f807ded6644	https://res.cloudinary.com/dloasaxt1/image/upload/v1771323840/wireless-pods-green_ii4gjm.png	Neon Breach
22ce9b52-9b7d-410f-ad11-ac91edfbb50f	4d0a9a6f-74a0-480d-a123-2f807ded6644	https://res.cloudinary.com/dloasaxt1/image/upload/v1771323781/wireless-pods_cphprn.jpg	Carbon Void
\.


--
-- Data for Name: ProductVariant; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ProductVariant" (id, "productId", size, color, stock) FROM stdin;
pv1	p1	40	Neon Breach	12
pv2	p1	42	Neon Breach	18
pv3	p1	43	Neon Breach	9
pv4	p1	44	Neon Breach	25
pv5	p1	45	Neon Breach	14
pv6	p1	40	Carbon Void	20
pv7	p1	41	Carbon Void	7
pv8	p1	42	Carbon Void	29
pv9	p1	43	Carbon Void	11
pv10	p1	45	Carbon Void	16
pv11	p2	40	Neon Breach	8
pv12	p2	41	Neon Breach	15
pv13	p2	42	Neon Breach	21
pv14	p2	43	Neon Breach	10
pv15	p2	44	Neon Breach	27
pv16	p2	41	Carbon Void	6
pv17	p2	42	Carbon Void	18
pv18	p2	43	Carbon Void	13
pv19	p2	44	Carbon Void	24
pv20	p2	45	Carbon Void	9
pv21	p3	S	Neon Breach	22
pv22	p3	M	Neon Breach	17
pv23	p3	L	Neon Breach	26
pv24	p3	M	Carbon Void	19
pv25	p3	L	Carbon Void	12
pv26	p3	XL	Carbon Void	28
pv27	p4	M	Neon Breach	14
pv28	p4	L	Neon Breach	23
pv29	p4	XL	Neon Breach	8
pv30	p4	S	Carbon Void	16
pv31	p4	M	Carbon Void	30
pv32	p4	L	Carbon Void	11
pv33	p5	40	Neon Breach	18
pv34	p5	41	Neon Breach	24
pv35	p5	42	Neon Breach	16
pv36	p5	43	Neon Breach	22
pv37	p5	44	Neon Breach	14
pv38	p5	45	Neon Breach	27
pv39	p5	40	Carbon Void	20
pv40	p5	41	Carbon Void	11
pv41	p5	42	Carbon Void	29
pv42	p5	43	Carbon Void	15
pv43	p5	44	Carbon Void	17
pv44	p5	45	Carbon Void	23
7c15af6a-e437-407e-865c-e1d75fd45b6d	03a5a7b6-239b-47f5-aaea-950b77ee8175	40	Neon Breach	29
538e71c2-0450-407d-b3c6-bd31093340c5	03a5a7b6-239b-47f5-aaea-950b77ee8175	40	Carbon Void	10
9fbb05d4-63c1-4590-ae7e-bca5230e2243	03a5a7b6-239b-47f5-aaea-950b77ee8175	41	Neon Breach	10
f408c868-376b-4fdd-8984-42d1d947b104	03a5a7b6-239b-47f5-aaea-950b77ee8175	41	Carbon Void	14
bea18a78-a5b3-42c3-89d2-8aed76c782f6	03a5a7b6-239b-47f5-aaea-950b77ee8175	42	Neon Breach	24
fa037f8b-4653-4401-bddd-b35666217f12	03a5a7b6-239b-47f5-aaea-950b77ee8175	42	Carbon Void	13
b80daef9-b590-47ab-8b22-343e0f3b46a0	03a5a7b6-239b-47f5-aaea-950b77ee8175	43	Neon Breach	16
d316fe62-fdb6-44ac-bfca-0a2b263fd623	03a5a7b6-239b-47f5-aaea-950b77ee8175	43	Carbon Void	12
f046bf41-a5d7-44fa-839f-5ab4467b44c4	03a5a7b6-239b-47f5-aaea-950b77ee8175	44	Neon Breach	29
2a7e8bab-7744-4594-a90a-08fde78495b9	03a5a7b6-239b-47f5-aaea-950b77ee8175	44	Carbon Void	22
178f6b5a-d682-46eb-a26f-aedf389a6aeb	03a5a7b6-239b-47f5-aaea-950b77ee8175	45	Neon Breach	12
f34161a3-79a4-4d6e-b51c-e9f10f172133	03a5a7b6-239b-47f5-aaea-950b77ee8175	45	Carbon Void	25
ea6a38ef-3851-4ecf-b4a6-522542aae270	c945f8a2-947a-4965-a2f4-8762b34213b4	40	Neon Breach	22
d36176ef-daec-4a28-ab7a-a50cc0946a4d	c945f8a2-947a-4965-a2f4-8762b34213b4	40	Carbon Void	25
9f30daa6-3076-4568-bd43-a4c749e5e624	c945f8a2-947a-4965-a2f4-8762b34213b4	41	Neon Breach	28
5e5cd53c-b667-49eb-bb00-4caa33f0ac8c	c945f8a2-947a-4965-a2f4-8762b34213b4	41	Carbon Void	17
38f7590d-e17a-4cb3-b219-bbc53c671706	c945f8a2-947a-4965-a2f4-8762b34213b4	42	Neon Breach	20
1e619b99-4027-436b-b66e-967eece87104	c945f8a2-947a-4965-a2f4-8762b34213b4	42	Carbon Void	17
6dbd324b-2abc-49ca-a55a-f576373e0388	c945f8a2-947a-4965-a2f4-8762b34213b4	43	Neon Breach	29
bc5f405c-9927-45b3-a2b9-ca4a4a3a0d63	c945f8a2-947a-4965-a2f4-8762b34213b4	43	Carbon Void	16
d4b8a80d-642d-4afd-be75-893466c3f637	c945f8a2-947a-4965-a2f4-8762b34213b4	44	Neon Breach	10
406a8778-c8ef-40bb-a9ee-82284b5bdb55	c945f8a2-947a-4965-a2f4-8762b34213b4	44	Carbon Void	10
14fce036-0def-48f3-8ef8-2def418c7444	c945f8a2-947a-4965-a2f4-8762b34213b4	45	Neon Breach	13
0190740b-1c4b-4fe1-860f-f17a213b533f	c945f8a2-947a-4965-a2f4-8762b34213b4	45	Carbon Void	15
cfaa98bd-c556-4324-950b-8c1c3f82e719	a5ed8852-0b32-4867-8505-fe99d065364a	S	Neon Breach	25
8e43b88b-18d3-4c56-a11b-e3fe6d552c01	a5ed8852-0b32-4867-8505-fe99d065364a	S	Carbon Void	27
a1474674-aa23-477f-a500-7827a0d7c170	a5ed8852-0b32-4867-8505-fe99d065364a	M	Neon Breach	19
69414904-019e-4380-9d51-5672356fbb35	a5ed8852-0b32-4867-8505-fe99d065364a	M	Carbon Void	14
85c17a47-df63-40e3-bc17-7461012f2ae4	a5ed8852-0b32-4867-8505-fe99d065364a	L	Neon Breach	23
103751c2-df3d-44ba-8fc9-715682a4af93	a5ed8852-0b32-4867-8505-fe99d065364a	L	Carbon Void	27
501fbcc7-b9a7-42c9-bb61-eecd53c8b0d3	a5ed8852-0b32-4867-8505-fe99d065364a	XL	Neon Breach	21
17080bbb-b8b7-40be-a30e-b6340708886d	a5ed8852-0b32-4867-8505-fe99d065364a	XL	Carbon Void	15
deaf83d0-4061-4b99-8259-a820387a0693	d26084be-f48f-4405-9cc8-d317bed0f0ee	S	Neon Breach	16
efd74d4c-b59d-415f-91d8-4e2debb9a178	d26084be-f48f-4405-9cc8-d317bed0f0ee	S	Carbon Void	17
eefc1483-e372-41aa-9097-f25b83e6e741	d26084be-f48f-4405-9cc8-d317bed0f0ee	M	Neon Breach	24
fec76151-4cc7-4d62-89b3-5e879acf9112	d26084be-f48f-4405-9cc8-d317bed0f0ee	M	Carbon Void	13
57b26267-60ee-4d4a-bc33-7c6b5ef7d444	d26084be-f48f-4405-9cc8-d317bed0f0ee	L	Neon Breach	10
bcbc1637-cb66-40c0-8f7b-558fefb28107	d26084be-f48f-4405-9cc8-d317bed0f0ee	L	Carbon Void	11
7158fe05-9b17-4c1d-9795-f81377875165	d26084be-f48f-4405-9cc8-d317bed0f0ee	XL	Neon Breach	26
159c588e-8c15-4047-9b8f-ef7c585e9b4d	d26084be-f48f-4405-9cc8-d317bed0f0ee	XL	Carbon Void	12
02a0481d-ce4d-4c39-87cf-11255ecb7c53	64fb31e5-c7e9-4e52-9443-4ef1957f4c3f	S	Neon Breach	11
6c36b080-770b-4212-b155-6252c3c79003	64fb31e5-c7e9-4e52-9443-4ef1957f4c3f	S	Carbon Void	10
057ed37b-2d0b-40be-bf37-ef94ff494c75	64fb31e5-c7e9-4e52-9443-4ef1957f4c3f	M	Neon Breach	29
dd2fa195-917a-44c1-8e3b-2bb6fbd91970	64fb31e5-c7e9-4e52-9443-4ef1957f4c3f	M	Carbon Void	24
f126b3cf-29f7-46a5-97a0-dad8b52b0a65	64fb31e5-c7e9-4e52-9443-4ef1957f4c3f	L	Neon Breach	27
b7896124-c539-445c-8617-b6acca811fad	64fb31e5-c7e9-4e52-9443-4ef1957f4c3f	L	Carbon Void	12
6da00cc2-dee4-4637-8680-7616bf56a8ab	64fb31e5-c7e9-4e52-9443-4ef1957f4c3f	XL	Neon Breach	18
b5d20a5f-0232-460c-8514-402eb60bfd2c	64fb31e5-c7e9-4e52-9443-4ef1957f4c3f	XL	Carbon Void	21
d0c143be-a12e-4c2f-a06b-ca5e5f1439d7	15087434-f62d-4153-9a0c-10e963602797	S	Neon Breach	17
c414d11d-bd1d-4c73-a49e-d0b1befff335	15087434-f62d-4153-9a0c-10e963602797	S	Carbon Void	26
45d8c05f-76f9-4dd4-99c1-d09ebbcc7151	15087434-f62d-4153-9a0c-10e963602797	M	Neon Breach	22
2374c71b-12bb-4be2-a9cb-c915a5404831	15087434-f62d-4153-9a0c-10e963602797	M	Carbon Void	20
96d0abf2-7b2e-46b5-88be-7ca05b057bcf	15087434-f62d-4153-9a0c-10e963602797	L	Neon Breach	24
a5943c79-6918-4390-af6f-dbb8eecc7778	15087434-f62d-4153-9a0c-10e963602797	L	Carbon Void	27
284d59e7-7f10-4839-a460-e37b0d909055	15087434-f62d-4153-9a0c-10e963602797	XL	Neon Breach	23
604c59ba-1905-4654-b1f9-702f53ed38c0	15087434-f62d-4153-9a0c-10e963602797	XL	Carbon Void	15
fa8c96df-33dd-4425-a889-00eb1d3eb9e7	da4d949f-41b4-47b7-9159-a78cb6adc5f4	30	Neon Breach	13
1bd1a8ba-7d5a-45b6-bc3a-1079e0940198	da4d949f-41b4-47b7-9159-a78cb6adc5f4	30	Carbon Void	18
c60e4aae-e447-4114-ba79-eda5b0242e45	da4d949f-41b4-47b7-9159-a78cb6adc5f4	32	Neon Breach	16
36034f5a-56e8-4767-b793-2c2c58a6fb1a	da4d949f-41b4-47b7-9159-a78cb6adc5f4	32	Carbon Void	11
203651f9-03fa-4527-b767-ea5aa21e3e37	da4d949f-41b4-47b7-9159-a78cb6adc5f4	34	Neon Breach	11
4acb792c-7b76-4ed7-ba59-fe391f323010	da4d949f-41b4-47b7-9159-a78cb6adc5f4	34	Carbon Void	19
c3cc75ec-afc5-4b40-aaa8-50a3095115e7	da4d949f-41b4-47b7-9159-a78cb6adc5f4	36	Neon Breach	10
9304c65d-f6f0-4264-a6b2-7632014a0d27	da4d949f-41b4-47b7-9159-a78cb6adc5f4	36	Carbon Void	29
e0ab1115-0ff1-4c9d-adae-fe0a6c02d9bc	bfc851cd-81dd-40bb-b505-b502921271e0	S	Neon Breach	27
76207de4-44f7-470e-b019-968604e21f25	bfc851cd-81dd-40bb-b505-b502921271e0	S	Carbon Void	11
76892a7f-6f87-4ede-8a57-01f19c03fed8	bfc851cd-81dd-40bb-b505-b502921271e0	M	Neon Breach	13
7c94c845-e534-4088-8f19-d1a129b9470d	bfc851cd-81dd-40bb-b505-b502921271e0	M	Carbon Void	10
11be62d4-fc14-4aef-b8d2-d476f7051445	bfc851cd-81dd-40bb-b505-b502921271e0	L	Neon Breach	29
b555a790-ba72-4123-a0ea-19f128f6b528	bfc851cd-81dd-40bb-b505-b502921271e0	L	Carbon Void	18
7ff9a2a9-d338-40f7-935e-55ca76bdffe3	bfc851cd-81dd-40bb-b505-b502921271e0	XL	Neon Breach	24
0e70dc6a-edc6-41c3-b49d-0ba7df74b16a	bfc851cd-81dd-40bb-b505-b502921271e0	XL	Carbon Void	26
20f2bdef-f208-4b1d-bf72-626536e9b3b9	ce2fcb1f-1f25-439e-98cc-58d5563d3011	30	Neon Breach	16
65841874-3494-43c3-b6bc-210ce36435b2	ce2fcb1f-1f25-439e-98cc-58d5563d3011	30	Carbon Void	29
d8eadebd-5b59-41a7-91c9-63bdf0614ec6	ce2fcb1f-1f25-439e-98cc-58d5563d3011	32	Neon Breach	17
fe010e75-9c02-43a4-b606-3abbb14edfe8	ce2fcb1f-1f25-439e-98cc-58d5563d3011	32	Carbon Void	11
44048a34-e14f-48f9-a2b1-a853ce1320f1	ce2fcb1f-1f25-439e-98cc-58d5563d3011	34	Neon Breach	21
3b477a58-b4e6-481a-ad28-7043d0a197b6	ce2fcb1f-1f25-439e-98cc-58d5563d3011	34	Carbon Void	29
e1e2bf9e-f105-488f-9788-fc8679d7efcd	ce2fcb1f-1f25-439e-98cc-58d5563d3011	36	Neon Breach	20
b6764780-1d06-4fac-8c96-c72002da49d5	ce2fcb1f-1f25-439e-98cc-58d5563d3011	36	Carbon Void	10
9b15f538-7b79-4f48-b012-c92080fb5fec	44992573-5da5-47ee-adf6-bd53bdc99111	30	Neon Breach	18
9f185f83-76e0-47f7-b4ba-d397388a97e9	44992573-5da5-47ee-adf6-bd53bdc99111	30	Carbon Void	27
77229897-0833-47d8-9aaf-17eb2882fa22	44992573-5da5-47ee-adf6-bd53bdc99111	32	Neon Breach	14
26693aea-f67f-4868-a7f8-f92f3c803ac4	44992573-5da5-47ee-adf6-bd53bdc99111	32	Carbon Void	18
cf711e2a-9723-4c4b-afbd-f5201020cba8	44992573-5da5-47ee-adf6-bd53bdc99111	34	Neon Breach	10
b9338aaf-be09-4f4e-80e3-b29844228239	44992573-5da5-47ee-adf6-bd53bdc99111	34	Carbon Void	18
b3f82c80-c2e1-4e8c-8bc6-5e4208c99257	44992573-5da5-47ee-adf6-bd53bdc99111	36	Neon Breach	11
b3dfbfa5-70f3-40f6-a5f9-e39653d7b449	44992573-5da5-47ee-adf6-bd53bdc99111	36	Carbon Void	18
b87dcef7-946d-426c-bffa-05841feb9393	503a86ac-2ce8-41c3-9820-69268ebb0f18	30	Neon Breach	25
43332cac-a5da-4c8b-bbb1-da5f0e5ec121	503a86ac-2ce8-41c3-9820-69268ebb0f18	30	Carbon Void	12
8afb76ae-43bb-43e7-aa1b-06e7e0646fb6	503a86ac-2ce8-41c3-9820-69268ebb0f18	32	Neon Breach	23
6e6df7b8-3bd9-471d-a746-2bf932c28c23	503a86ac-2ce8-41c3-9820-69268ebb0f18	32	Carbon Void	19
fbf1542c-8779-4f4b-ad26-8c4dd9c0b151	503a86ac-2ce8-41c3-9820-69268ebb0f18	34	Neon Breach	17
ea2f655a-11b3-4f2c-b607-d066e8db3b01	503a86ac-2ce8-41c3-9820-69268ebb0f18	34	Carbon Void	29
856b8393-2679-4ce4-b8c5-72fe7e981146	503a86ac-2ce8-41c3-9820-69268ebb0f18	36	Neon Breach	27
143984b4-123e-4a95-8612-2339fb63b88d	503a86ac-2ce8-41c3-9820-69268ebb0f18	36	Carbon Void	22
ce182649-df08-4250-9e9d-cd081a633d9c	ec291c1c-396e-4ae1-a2a1-c2a3e69298d2	S	Neon Breach	23
c588b6f3-d2b7-46b7-89c6-e3d5dbfec9e0	ec291c1c-396e-4ae1-a2a1-c2a3e69298d2	S	Carbon Void	24
02847038-83f1-42ab-bdcf-ee6330b4b8da	ec291c1c-396e-4ae1-a2a1-c2a3e69298d2	M	Neon Breach	25
d89164f5-7830-475e-bc0f-92c33c23c60c	ec291c1c-396e-4ae1-a2a1-c2a3e69298d2	M	Carbon Void	24
cdaf769e-3b8f-4ccd-b313-35a7782c3d47	ec291c1c-396e-4ae1-a2a1-c2a3e69298d2	L	Neon Breach	12
7d08ce64-fae1-4a51-a173-20a909dd1db5	ec291c1c-396e-4ae1-a2a1-c2a3e69298d2	L	Carbon Void	15
61e54f67-0904-4ab5-a2ff-8e369f9521c3	ec291c1c-396e-4ae1-a2a1-c2a3e69298d2	XL	Neon Breach	25
1c340af8-23c1-4cc2-8039-f49ec440a730	ec291c1c-396e-4ae1-a2a1-c2a3e69298d2	XL	Carbon Void	22
aa060dca-ecc4-4179-9108-f9f70d3eed23	9f4e8591-3237-43e9-a56b-e711d574aa69	S	Neon Breach	22
dfbd5eb7-f1b7-4191-8576-1eee2c89aafa	9f4e8591-3237-43e9-a56b-e711d574aa69	S	Carbon Void	16
cb34a50c-9b7b-43d8-a253-0be4aadacfa8	9f4e8591-3237-43e9-a56b-e711d574aa69	M	Neon Breach	26
00a0dd26-a48b-4d55-b61d-9d4a35000e68	9f4e8591-3237-43e9-a56b-e711d574aa69	M	Carbon Void	29
19900d1f-3d92-4968-b8b4-652b114f7cc0	9f4e8591-3237-43e9-a56b-e711d574aa69	L	Neon Breach	24
b43e885e-ee1b-4e64-812a-18f5c947396b	9f4e8591-3237-43e9-a56b-e711d574aa69	L	Carbon Void	16
68a21689-acc4-40d3-a131-4478cd466aa5	9f4e8591-3237-43e9-a56b-e711d574aa69	XL	Neon Breach	15
dc0feb20-9980-4704-9d6d-0e50c99ef876	9f4e8591-3237-43e9-a56b-e711d574aa69	XL	Carbon Void	28
dace4ea0-07df-4c25-bf0e-b48b437039cd	cef1dd08-e266-4421-81c4-bf782c9c4e62	S	Neon Breach	25
17e73dc5-7ac4-431b-acc0-e2456773cfde	cef1dd08-e266-4421-81c4-bf782c9c4e62	S	Carbon Void	27
aa44f0fb-717d-4c2f-bda5-eb01f8266463	cef1dd08-e266-4421-81c4-bf782c9c4e62	M	Neon Breach	27
c28a76e5-718c-46b2-9332-50d5df88d6cb	cef1dd08-e266-4421-81c4-bf782c9c4e62	M	Carbon Void	24
3350656a-31c2-4da8-9fbb-14c64056316d	cef1dd08-e266-4421-81c4-bf782c9c4e62	L	Neon Breach	20
a692be38-0fca-49a7-a062-d51f2ce4e165	cef1dd08-e266-4421-81c4-bf782c9c4e62	L	Carbon Void	19
4fa1ffaa-0fa2-446a-ab33-68a83f572014	cef1dd08-e266-4421-81c4-bf782c9c4e62	XL	Neon Breach	27
6d53ae67-8849-4ffe-a29a-03d0cc01cea5	cef1dd08-e266-4421-81c4-bf782c9c4e62	XL	Carbon Void	14
1a3fc7c0-01b2-4b54-8091-0665146af61b	75cbceb1-accf-4309-afcf-53e05999bf15	S	Neon Breach	29
97870e02-8120-4624-9747-7d4d487cccb5	75cbceb1-accf-4309-afcf-53e05999bf15	S	Carbon Void	16
7434d7df-7d73-4724-830a-d82407b90b8c	75cbceb1-accf-4309-afcf-53e05999bf15	M	Neon Breach	24
d12d327e-ee6e-4354-a6c6-4f5dca1f2905	75cbceb1-accf-4309-afcf-53e05999bf15	M	Carbon Void	24
b00c2b12-0cd1-47cb-b6a4-3f07611eac59	75cbceb1-accf-4309-afcf-53e05999bf15	L	Neon Breach	27
2f56a334-9df2-4eca-87ec-045c3ad9fee7	75cbceb1-accf-4309-afcf-53e05999bf15	L	Carbon Void	27
28bc1e06-3fe3-4c0f-9455-78c27206fe05	75cbceb1-accf-4309-afcf-53e05999bf15	XL	Neon Breach	26
98fc17d2-61ed-48d8-b579-2878b05bbb32	75cbceb1-accf-4309-afcf-53e05999bf15	XL	Carbon Void	11
9614ac5a-0394-4e63-8d12-bde6d1bb547a	6b23846b-05b4-4595-be15-b4fba5452ba0	S	Neon Breach	22
a0fcdb48-3ac6-4b73-8585-ea0971dc3b60	6b23846b-05b4-4595-be15-b4fba5452ba0	S	Carbon Void	11
18d32507-feae-47d7-a721-1551fbf50485	6b23846b-05b4-4595-be15-b4fba5452ba0	M	Neon Breach	15
730724b8-8d54-4719-863a-cdd2285fa2d0	6b23846b-05b4-4595-be15-b4fba5452ba0	M	Carbon Void	17
7b30831e-01de-4b1a-abbf-b8191b273c5f	6b23846b-05b4-4595-be15-b4fba5452ba0	L	Neon Breach	11
4c14f7cc-6ea1-4a63-87a6-c76d2a4820e8	6b23846b-05b4-4595-be15-b4fba5452ba0	L	Carbon Void	14
5540315a-2d8e-4f66-8b86-b108ebb73570	6b23846b-05b4-4595-be15-b4fba5452ba0	XL	Neon Breach	24
bb0d5561-d652-46c1-95a7-5dd14592ee63	6b23846b-05b4-4595-be15-b4fba5452ba0	XL	Carbon Void	16
989b9744-42d0-4702-aca1-569b8f2a8534	b3906d4b-077a-4545-8f17-4a5672b3456e	S/M	Neon Breach	16
93354458-e247-43d9-9ba7-ccfc3759597a	b3906d4b-077a-4545-8f17-4a5672b3456e	S/M	Carbon Void	25
078563af-55bc-49b4-a70b-1357171335dd	b3906d4b-077a-4545-8f17-4a5672b3456e	L/XL	Neon Breach	24
e29c0e39-3911-4a09-b116-21fa4ed22540	b3906d4b-077a-4545-8f17-4a5672b3456e	L/XL	Carbon Void	11
fede7419-e5d8-408e-aa4f-9a5c77ca7ff5	5a31d121-94b1-4365-a9f5-ae861d7a6905	ONE SIZE	Neon Breach	14
70328ade-67c4-4a8e-b2bd-49eab367ca10	5a31d121-94b1-4365-a9f5-ae861d7a6905	ONE SIZE	Carbon Void	14
fd68e53d-85df-47c8-b4fe-aec1c76d1795	fc69e5d3-4aa8-46b6-b6b3-a0a1cf583ad5	ONE SIZE	Neon Breach	13
50349309-4c8a-4648-9d88-a2166f4c89e0	fc69e5d3-4aa8-46b6-b6b3-a0a1cf583ad5	ONE SIZE	Carbon Void	15
ef250b61-8b25-49f9-8d16-8a8348747b92	cf5ca13e-fb6b-48ed-b1d8-d46d26283eb0	S/M	Neon Breach	26
9b7cd90e-6b1f-4473-9850-5a356efe193e	cf5ca13e-fb6b-48ed-b1d8-d46d26283eb0	S/M	Carbon Void	11
7a308e8a-5a83-4dba-95d3-9140cc0b8cf1	cf5ca13e-fb6b-48ed-b1d8-d46d26283eb0	L/XL	Neon Breach	10
b4fb4112-d751-4422-a9b5-f9783915e341	cf5ca13e-fb6b-48ed-b1d8-d46d26283eb0	L/XL	Carbon Void	28
d91f3f14-6552-4130-bfed-b2b3873342a2	a98a3e27-e9d6-4876-a2e8-6d779dc08a9b	S	Neon Breach	25
9316fdb1-fdab-4d72-9e5a-d79218dc1972	a98a3e27-e9d6-4876-a2e8-6d779dc08a9b	S	Carbon Void	24
7d4c7af7-25c7-495e-95b7-757ff1ba8dfa	a98a3e27-e9d6-4876-a2e8-6d779dc08a9b	M	Neon Breach	28
19f81d86-c626-475c-9f2b-43d3994c181e	a98a3e27-e9d6-4876-a2e8-6d779dc08a9b	M	Carbon Void	13
c7d83908-7c4f-427d-aa61-e750e15ca7d0	a98a3e27-e9d6-4876-a2e8-6d779dc08a9b	L	Neon Breach	28
600198f3-6639-4815-ae00-98e2d059bbe2	a98a3e27-e9d6-4876-a2e8-6d779dc08a9b	L	Carbon Void	22
ca7f8e07-15ba-4405-b059-fd7710562f17	a98a3e27-e9d6-4876-a2e8-6d779dc08a9b	XL	Neon Breach	22
159bb64f-ca73-4449-8ce4-a0dabf7d112d	a98a3e27-e9d6-4876-a2e8-6d779dc08a9b	XL	Carbon Void	21
744cd780-9dad-43de-9f54-6902fb99cc0d	1e863612-621c-4855-80be-fd2de078126c	ONE SIZE	Neon Breach	16
89bfe740-394d-42ac-bda1-05783b3a8d49	1e863612-621c-4855-80be-fd2de078126c	ONE SIZE	Carbon Void	17
7f23ba81-a6c0-4c11-8ff8-841a57c87633	71a9d5e3-a369-46a7-a42a-cdafb653f11c	ONE SIZE	Neon Breach	10
e64ef309-8c29-492f-ba26-26b7aba0bce4	71a9d5e3-a369-46a7-a42a-cdafb653f11c	ONE SIZE	Carbon Void	20
040bf49e-e1f3-4b1f-9909-081ed6241a92	28d37f63-4da3-498b-a490-904791523737	ONE SIZE	Neon Breach	20
92aa9ed1-fb55-49c3-96ab-6cd21b00d4df	28d37f63-4da3-498b-a490-904791523737	ONE SIZE	Carbon Void	17
e6a3d9a1-b3a9-4132-be8f-67c6b1299282	fe7209bb-6a43-4d5f-84fb-ca2019d47c4b	ONE SIZE	Neon Breach	13
ea404990-59f6-4b77-b093-e2df5bb8a750	fe7209bb-6a43-4d5f-84fb-ca2019d47c4b	ONE SIZE	Carbon Void	17
e7efd202-c9ce-4665-8c26-a6efe889ad3c	381749e6-bdb1-46f1-9c59-b61e253105f4	S	Neon Breach	13
4b826f4a-baac-4b0e-a15b-ceb3522755dc	381749e6-bdb1-46f1-9c59-b61e253105f4	S	Carbon Void	10
4ef7b524-22fd-4303-8ed8-322bec195da2	381749e6-bdb1-46f1-9c59-b61e253105f4	M	Neon Breach	21
174cf22a-abac-4f3d-9419-38b11bee2266	381749e6-bdb1-46f1-9c59-b61e253105f4	M	Carbon Void	20
97a50c36-6b3f-45bb-acd7-2e869d98dbb2	381749e6-bdb1-46f1-9c59-b61e253105f4	L	Neon Breach	14
7b329180-d4c8-499c-a576-d554e87c2be1	381749e6-bdb1-46f1-9c59-b61e253105f4	L	Carbon Void	22
f27903c9-ce03-4312-a9b0-0497fb7ae6b4	381749e6-bdb1-46f1-9c59-b61e253105f4	XL	Neon Breach	10
6207faf4-eae8-4c1c-8b67-9c7596ae85b5	381749e6-bdb1-46f1-9c59-b61e253105f4	XL	Carbon Void	19
ac270aff-5ce0-4d67-ba60-1235eb1ee672	0f52e776-fa72-4158-b627-05a6c6d02276	S	Neon Breach	16
3a64d210-61c6-4f65-a535-d506a058c610	0f52e776-fa72-4158-b627-05a6c6d02276	S	Carbon Void	24
b87cb6fc-8478-449e-8151-7f445cd6f0f7	0f52e776-fa72-4158-b627-05a6c6d02276	M	Neon Breach	15
96a5733d-c3b9-4729-954b-c6aa81fe8959	0f52e776-fa72-4158-b627-05a6c6d02276	M	Carbon Void	23
07074984-17ac-4783-94a9-ae7192c16098	0f52e776-fa72-4158-b627-05a6c6d02276	L	Neon Breach	26
4d67875e-88db-4c0c-9e17-3b220d2222ea	0f52e776-fa72-4158-b627-05a6c6d02276	L	Carbon Void	26
f3161c21-80fa-4ed7-9272-8e66582ebb54	0f52e776-fa72-4158-b627-05a6c6d02276	XL	Neon Breach	20
b6d291d7-5bc5-40f9-a34c-2671f6e3d237	0f52e776-fa72-4158-b627-05a6c6d02276	XL	Carbon Void	26
b1e7b8a2-c238-4065-9de5-45ab46ceba7a	cdba71d6-51cc-4138-8caf-3518be131cb1	S	Neon Breach	17
5f5bda17-8e65-4fc4-b51f-492678f8a904	cdba71d6-51cc-4138-8caf-3518be131cb1	S	Carbon Void	10
95878ba6-2cd0-43cc-9496-50b2d5089e62	cdba71d6-51cc-4138-8caf-3518be131cb1	M	Neon Breach	24
1702bd77-d7ed-4890-aaf3-a970bed66ce9	cdba71d6-51cc-4138-8caf-3518be131cb1	M	Carbon Void	27
02f6e620-409e-4d9d-8239-dda74981c0ff	cdba71d6-51cc-4138-8caf-3518be131cb1	L	Neon Breach	17
03f70d8c-59ad-4672-9e2c-720a785055ed	cdba71d6-51cc-4138-8caf-3518be131cb1	L	Carbon Void	16
101e30c6-e954-4b97-a571-6625bbde989c	cdba71d6-51cc-4138-8caf-3518be131cb1	XL	Neon Breach	16
b335abef-92e1-40f7-934b-dea4278957ab	cdba71d6-51cc-4138-8caf-3518be131cb1	XL	Carbon Void	11
b4b99b95-b78c-4b08-a71e-f3e2a8081d10	2d27688e-fe1b-4889-995c-da4bd24b088a	S	Neon Breach	26
5edfcf65-9b45-41e5-81e9-1f0a168ed535	2d27688e-fe1b-4889-995c-da4bd24b088a	S	Carbon Void	29
ce52ae24-722b-496b-b68e-2e051f4c7a36	2d27688e-fe1b-4889-995c-da4bd24b088a	M	Neon Breach	15
1b1832fd-6d2c-4ecc-9bdd-3c7d6c6521e1	2d27688e-fe1b-4889-995c-da4bd24b088a	M	Carbon Void	29
2acd4593-6100-4e47-8c09-6ec3abb38503	2d27688e-fe1b-4889-995c-da4bd24b088a	L	Neon Breach	26
ddd48128-6fdb-47a6-bcfa-6be491e543b3	2d27688e-fe1b-4889-995c-da4bd24b088a	L	Carbon Void	21
98efb2d5-7391-416d-b6b8-ae8b2b0b0c09	2d27688e-fe1b-4889-995c-da4bd24b088a	XL	Neon Breach	17
3b19537a-091f-4610-9e37-d217ca6dfcbd	2d27688e-fe1b-4889-995c-da4bd24b088a	XL	Carbon Void	16
1dc33074-3b98-4675-a0bf-8c52206d2591	bba3350b-11e5-470b-b9e1-f84be5e9acb0	ONE SIZE	Neon Breach	28
8e58e1d9-53d4-4f10-987e-f08c69e90ab2	bba3350b-11e5-470b-b9e1-f84be5e9acb0	ONE SIZE	Carbon Void	29
3880e431-f741-4648-84ff-29596ecbf20b	1eb591e0-6f0c-4a7c-90de-83d1d3c58d47	ONE SIZE	Neon Breach	19
f758acd1-25e8-4ecf-8c06-83f7745a78dd	1eb591e0-6f0c-4a7c-90de-83d1d3c58d47	ONE SIZE	Carbon Void	23
5fb4df48-ea1c-42b0-9f84-e22f6b368f9d	c04832e9-1d37-45a6-8ad9-30a1fa31ff38	S/M	Neon Breach	13
ed5f5f56-612f-4961-89f4-0b6d231d9514	c04832e9-1d37-45a6-8ad9-30a1fa31ff38	S/M	Carbon Void	15
1bae607b-9dd5-4092-bd7d-840dba2c1d9e	c04832e9-1d37-45a6-8ad9-30a1fa31ff38	L/XL	Neon Breach	21
74832b7c-1d8b-4829-b404-8ec8b2a6a910	c04832e9-1d37-45a6-8ad9-30a1fa31ff38	L/XL	Carbon Void	26
b771951a-7c46-46fb-a2ef-329120bb5cef	4d0a9a6f-74a0-480d-a123-2f807ded6644	ONE SIZE	Neon Breach	21
2f8b5911-c51e-44d9-82a5-57d7728e7262	4d0a9a6f-74a0-480d-a123-2f807ded6644	ONE SIZE	Carbon Void	23
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
8d702c3d-ea3a-45bc-8e95-b1f873e3feaa	2fff4bcdb9d60744c0c8613285fb208580a5c609f3a56ce3bbabcf48ea7352fd	2026-01-13 02:47:48.81145+06	20260112204748_init	\N	\N	2026-01-13 02:47:48.721537+06	1
8a232c2e-a784-40d3-893b-13c2b9671f74	c2d310ad95c5d7e968f73f7923682f2ed2c4e0b8b6e4b3a1921ff32d57ff8ff7	2026-01-13 20:09:05.545914+06	20260113140905_init	\N	\N	2026-01-13 20:09:05.525618+06	1
8b0924b2-e0c8-4c4f-9ca1-239d92e8e0c5	4810760e97a3b3f3e616d3eb685002256f08c47c62d6a1b64a443896a901381f	2026-01-13 20:14:44.708866+06	20260113141444_init	\N	\N	2026-01-13 20:14:44.671527+06	1
b10f98f3-f367-480a-b2de-da70eb2bb6f9	76ff479fc5dce53a062fe76f2098074525eae77971df997230c3f7bc616422f9	2026-01-13 20:29:21.705686+06	20260113142921_init	\N	\N	2026-01-13 20:29:21.700872+06	1
da13e0b5-c208-4765-9677-78817c3efeec	bed0ff9c9e0efad2f31ba0ea6d0948799d347e632eb2f1f579777613e3a239c5	2026-01-14 21:18:25.667845+06	20260114151825_init	\N	\N	2026-01-14 21:18:25.659846+06	1
4171d646-419b-4d95-8dcf-99b45301c84a	2e5858c42246cd9b6e9c8cdbc306a603555aaed8577e43f7948bbda0378c9957	2026-01-14 21:48:42.331365+06	20260114154842_init	\N	\N	2026-01-14 21:48:42.324545+06	1
38894301-9a27-4ddf-aa6b-f577339e033b	c56bb402cf76ed858eebe435b08ef3cc9b7c42f4f563d541205d18fa6090b03f	2026-02-17 21:25:46.755173+06	20260217152546_add_product_metrics	\N	\N	2026-02-17 21:25:46.661549+06	1
3bb37509-c2c1-4591-9b51-7b2d05317a30	bd0a4f3abc16fb9030289c205af66abdd2b1d7f912bb03849aa75f3cde55c1ab	2026-02-18 18:30:54.698603+06	20260218123054_add_product_date_time	\N	\N	2026-02-18 18:30:54.619791+06	1
\.


--
-- Data for Name: address; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.address (id, "userId", street, city, state, "zipCode", country, "createdAt") FROM stdin;
\.


--
-- Data for Name: category; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.category (id, name, slug, "createdAt") FROM stdin;
c1	Footwear	footwear	2026-01-14 16:09:49.033
c2	Tops	tops	2026-01-14 16:09:49.033
c3	Accessories	accessories	2026-01-14 16:09:49.033
c4	BOTTOMS	bottoms	2026-02-17 16:41:24.471
c5	OUTERWEAR	outerwear	2026-02-17 16:41:24.471
c6	BAGS	bags	2026-02-17 16:41:24.471
c7	LAYERING	layering	2026-02-17 16:41:24.471
c8	TECH GEAR	techgear	2026-02-17 16:41:24.471
\.


--
-- Data for Name: user; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."user" (id, name, email, password, role, "createdAt", "PhotoUrl") FROM stdin;
492d24a4-fb4e-41e7-bb4d-2c316f833765	GS SHAYKOT	gsshaykot53@gmail.com	$argon2id$v=19$m=65536,t=3,p=4$E/Ts/hZf44zerCGU1spPtA$SG6g6htlo+kUmbwqsLoLN91tFYKfRlzvyxVjo/Yt4Jo	USER	2026-01-14 17:36:47.921	https://res.cloudinary.com/dskgvk9km/image/upload/v1768412208/users/bxedbzmqgltnbru1ov2f.jpg
90306131-0f9a-4eed-9bb0-61e8b39f2c00	SHAYKOT 	gsshaykot55@gmail.com	$argon2id$v=19$m=65536,t=3,p=4$7sOD7c/rGdZjrqAqMWWrIA$J0dp1aA2ihfulJwJpCBJpfrHbs0VYvLRBHLDtGwniTI	USER	2026-01-14 19:29:17.522	https://res.cloudinary.com/dskgvk9km/image/upload/v1768418957/users/f7lzgwqxtyzcfc4binur.png
108da14e-cd75-4c73-a895-5b794cd0b03c	SADIA JAFRIN	jafrin8772@gmail.com	$argon2id$v=19$m=65536,t=3,p=4$ra7KHYGaBfJs9Levz2IHow$RsM/+VovJ2kwGxozBTOceg4APVmEePQk1X/32jFxDTY	USER	2026-01-14 19:32:07.896	https://res.cloudinary.com/dskgvk9km/image/upload/v1767725926/user_bvoihx.png
c6a3e373-6112-4e03-88a8-dd493d237017	SIAM	siamahmed892@gmail.com	$argon2id$v=19$m=65536,t=3,p=4$dO/qUbjXkef9oGUZGKRMLg$Aykt/d3hqBnYzprIjSbMy6bej1tsv8zyJ2ilPSMIElA	USER	2026-01-14 19:35:05.285	https://res.cloudinary.com/dskgvk9km/image/upload/v1767725926/user_bvoihx.png
\.


--
-- Name: CartItem CartItem_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CartItem"
    ADD CONSTRAINT "CartItem_pkey" PRIMARY KEY (id);


--
-- Name: Cart Cart_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Cart"
    ADD CONSTRAINT "Cart_pkey" PRIMARY KEY (id);


--
-- Name: OrderItem OrderItem_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_pkey" PRIMARY KEY (id);


--
-- Name: Order Order_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_pkey" PRIMARY KEY (id);


--
-- Name: Payment Payment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_pkey" PRIMARY KEY (id);


--
-- Name: ProductImage ProductImage_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductImage"
    ADD CONSTRAINT "ProductImage_pkey" PRIMARY KEY (id);


--
-- Name: ProductVariant ProductVariant_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductVariant"
    ADD CONSTRAINT "ProductVariant_pkey" PRIMARY KEY (id);


--
-- Name: Product Product_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: address address_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.address
    ADD CONSTRAINT address_pkey PRIMARY KEY (id);


--
-- Name: category category_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.category
    ADD CONSTRAINT category_pkey PRIMARY KEY (id);


--
-- Name: user user_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_pkey PRIMARY KEY (id);


--
-- Name: CartItem_cartId_variantId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "CartItem_cartId_variantId_key" ON public."CartItem" USING btree ("cartId", "variantId");


--
-- Name: Cart_userId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Cart_userId_key" ON public."Cart" USING btree ("userId");


--
-- Name: ProductVariant_productId_size_color_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "ProductVariant_productId_size_color_key" ON public."ProductVariant" USING btree ("productId", size, color);


--
-- Name: category_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX category_name_key ON public.category USING btree (name);


--
-- Name: category_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX category_slug_key ON public.category USING btree (slug);


--
-- Name: user_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX user_email_key ON public."user" USING btree (email);


--
-- Name: CartItem CartItem_cartId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CartItem"
    ADD CONSTRAINT "CartItem_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES public."Cart"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: CartItem CartItem_variantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CartItem"
    ADD CONSTRAINT "CartItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES public."ProductVariant"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Cart Cart_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Cart"
    ADD CONSTRAINT "Cart_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: OrderItem OrderItem_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: OrderItem OrderItem_variantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES public."ProductVariant"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Order Order_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Payment Payment_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ProductImage ProductImage_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductImage"
    ADD CONSTRAINT "ProductImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ProductVariant ProductVariant_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductVariant"
    ADD CONSTRAINT "ProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Product Product_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public.category(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: address address_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.address
    ADD CONSTRAINT "address_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict 09btnXdzrVm44E2QKpdiX0yqbzdBQh0072SY8GX2NmxAvJZ6AtSMmFXHLtNjLCF

