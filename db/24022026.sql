--
-- PostgreSQL database dump
--

\restrict KCtElwv1Zn5sju6Eilyx3RPIwsbt79njrmRnycRw2R3ICKjcht8RizjadZwWbOb

-- Dumped from database version 18.0
-- Dumped by pg_dump version 18.0

-- Started on 2026-02-24 18:55:39

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 224 (class 1259 OID 24859)
-- Name: promocodes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.promocodes (
    id integer NOT NULL,
    code character varying(14) NOT NULL,
    amount numeric(12,2) NOT NULL,
    is_used boolean DEFAULT false NOT NULL,
    used_by_user_id integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT promocodes_amount_check CHECK ((amount > (0)::numeric))
);


ALTER TABLE public.promocodes OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 24858)
-- Name: promocodes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.promocodes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.promocodes_id_seq OWNER TO postgres;

--
-- TOC entry 5059 (class 0 OID 0)
-- Dependencies: 223
-- Name: promocodes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.promocodes_id_seq OWNED BY public.promocodes.id;


--
-- TOC entry 222 (class 1259 OID 24842)
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    name character varying(50) NOT NULL
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 24841)
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.roles_id_seq OWNER TO postgres;

--
-- TOC entry 5060 (class 0 OID 0)
-- Dependencies: 221
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- TOC entry 226 (class 1259 OID 24881)
-- Name: user_balance; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_balance (
    id integer NOT NULL,
    user_id integer NOT NULL,
    total_deposited numeric(14,2) DEFAULT 0 NOT NULL,
    bonus_balance numeric(14,2) DEFAULT 0 NOT NULL,
    CONSTRAINT user_balance_bonus_balance_check CHECK ((bonus_balance >= (0)::numeric)),
    CONSTRAINT user_balance_total_deposited_check CHECK ((total_deposited >= (0)::numeric))
);


ALTER TABLE public.user_balance OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 24880)
-- Name: user_balance_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_balance_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_balance_id_seq OWNER TO postgres;

--
-- TOC entry 5061 (class 0 OID 0)
-- Dependencies: 225
-- Name: user_balance_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_balance_id_seq OWNED BY public.user_balance.id;


--
-- TOC entry 219 (class 1259 OID 24831)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying(255),
    password character varying(255),
    fio character varying(255),
    isactive boolean,
    roleid integer NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 24837)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- TOC entry 5062 (class 0 OID 0)
-- Dependencies: 220
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 4873 (class 2604 OID 24862)
-- Name: promocodes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promocodes ALTER COLUMN id SET DEFAULT nextval('public.promocodes_id_seq'::regclass);


--
-- TOC entry 4872 (class 2604 OID 24845)
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- TOC entry 4876 (class 2604 OID 24884)
-- Name: user_balance id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_balance ALTER COLUMN id SET DEFAULT nextval('public.user_balance_id_seq'::regclass);


--
-- TOC entry 4871 (class 2604 OID 24838)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 5051 (class 0 OID 24859)
-- Dependencies: 224
-- Data for Name: promocodes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.promocodes (id, code, amount, is_used, used_by_user_id, created_at) FROM stdin;
\.


--
-- TOC entry 5049 (class 0 OID 24842)
-- Dependencies: 222
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (id, name) FROM stdin;
1	User
2	Admin
\.


--
-- TOC entry 5053 (class 0 OID 24881)
-- Dependencies: 226
-- Data for Name: user_balance; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_balance (id, user_id, total_deposited, bonus_balance) FROM stdin;
\.


--
-- TOC entry 5046 (class 0 OID 24831)
-- Dependencies: 219
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, password, fio, isactive, roleid) FROM stdin;
1	asdqwe@gmail.com	$2a$11$iso2YHcvMmIwNNfjsanfre5/kLapo1MvMDeFcTdewRD/hgRXLZB5q	Михаил	t	1
2	abcd@gmail.com	$2a$11$.MHHxC/zsASSVexJ68B7mOFffzGXOcYAmqeFEbaO18OBJuAmEgRtu	Влад	t	1
3	bcde@gmail.com	$2a$11$HaGz7tn791VCJGd3tA.jdenZcMRqMGX7XjgZyeayfTfrthlgonXOq	Иван	t	1
5	asdfg@gmail.com	$2a$11$cgGeSmq2wbRdO19aUmI.ZOzBg87faViqro2BmAMC4t09a0FSt3c3W	Владимир	t	1
4	qwerty@gmail.com	$2a$11$zw51/ZKn0DXjFhMwSOhtzue7rYxn6DfVsG461kTx/HN6Iqjb2IkK.	Коля	t	2
7	test@gmail.com	$2a$11$NIjHc.E3EonpuISBhEAVxuIqqTfeHLmZC4RMAQe9su34fdtkEB/Ii	Антон	t	1
8	user@gmail.com	$2a$11$HkzZrrNaN/dXCm.K3iD96OedNqF2nqcVoMHn2yzgdH2Y7mZ5ZLcXa	Костя	t	1
9	admin@gmail.com	$2a$11$OLThS0N4HOL47MaKR280t.G81jBREC4xrZ2GOCb0Ucx1/z0gBA7pG	Максим	t	2
\.


--
-- TOC entry 5063 (class 0 OID 0)
-- Dependencies: 223
-- Name: promocodes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.promocodes_id_seq', 1, false);


--
-- TOC entry 5064 (class 0 OID 0)
-- Dependencies: 221
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_id_seq', 2, true);


--
-- TOC entry 5065 (class 0 OID 0)
-- Dependencies: 225
-- Name: user_balance_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_balance_id_seq', 1, false);


--
-- TOC entry 5066 (class 0 OID 0)
-- Dependencies: 220
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 9, true);


--
-- TOC entry 4889 (class 2606 OID 24874)
-- Name: promocodes promocodes_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promocodes
    ADD CONSTRAINT promocodes_code_key UNIQUE (code);


--
-- TOC entry 4891 (class 2606 OID 24872)
-- Name: promocodes promocodes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promocodes
    ADD CONSTRAINT promocodes_pkey PRIMARY KEY (id);


--
-- TOC entry 4885 (class 2606 OID 24851)
-- Name: roles roles_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_name_key UNIQUE (name);


--
-- TOC entry 4887 (class 2606 OID 24849)
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- TOC entry 4893 (class 2606 OID 24894)
-- Name: user_balance user_balance_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_balance
    ADD CONSTRAINT user_balance_pkey PRIMARY KEY (id);


--
-- TOC entry 4895 (class 2606 OID 24896)
-- Name: user_balance user_balance_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_balance
    ADD CONSTRAINT user_balance_user_id_key UNIQUE (user_id);


--
-- TOC entry 4883 (class 2606 OID 24840)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4898 (class 2606 OID 24897)
-- Name: user_balance fk_balance_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_balance
    ADD CONSTRAINT fk_balance_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4897 (class 2606 OID 24875)
-- Name: promocodes fk_promocode_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promocodes
    ADD CONSTRAINT fk_promocode_user FOREIGN KEY (used_by_user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 4896 (class 2606 OID 24853)
-- Name: users fk_users_roles; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT fk_users_roles FOREIGN KEY (roleid) REFERENCES public.roles(id) ON DELETE RESTRICT;


-- Completed on 2026-02-24 18:55:39

--
-- PostgreSQL database dump complete
--

\unrestrict KCtElwv1Zn5sju6Eilyx3RPIwsbt79njrmRnycRw2R3ICKjcht8RizjadZwWbOb

