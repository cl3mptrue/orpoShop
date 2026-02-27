--
-- PostgreSQL database dump
--

\restrict iEnM7eyL0T946F0LE5bVKc582EbYfSfmiAwQWGhrgKWTS4Fhn4h5QqqgzGN22k5

-- Dumped from database version 18.0
-- Dumped by pg_dump version 18.0

-- Started on 2026-02-25 16:15:57

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


-- Completed on 2026-02-25 16:15:57

--
-- PostgreSQL database dump complete
--

\unrestrict iEnM7eyL0T946F0LE5bVKc582EbYfSfmiAwQWGhrgKWTS4Fhn4h5QqqgzGN22k5

