--
-- PostgreSQL database dump
--

\restrict AEpZRaazKRbRG73hgJo7rfe1EYOoAvTyvAC6W0YUGl9GU3sFwPST83yImgHJXPl

-- Dumped from database version 18.0
-- Dumped by pg_dump version 18.0

-- Started on 2026-02-27 13:55:31

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
-- TOC entry 5055 (class 0 OID 24859)
-- Dependencies: 224
-- Data for Name: promocodes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.promocodes (id, code, amount, created_at) FROM stdin;
1	JSPM-T6CV-II7X	1000.00	2026-02-25 18:32:12.025034
2	VECL-R3KU-I54H	300.00	2026-02-26 17:50:44.894123
3	3MMY-GWU4-QWG8	100.00	2026-02-27 15:26:23.905543
4	QK8U-RX74-99W7	150.00	2026-02-27 15:53:01.830016
\.


--
-- TOC entry 5053 (class 0 OID 24842)
-- Dependencies: 222
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (id, name) FROM stdin;
1	User
2	Admin
\.


--
-- TOC entry 5058 (class 0 OID 24902)
-- Dependencies: 227
-- Data for Name: used_promocodes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.used_promocodes (promoid, userid) FROM stdin;
3	9
3	10
4	9
4	10
\.


--
-- TOC entry 5057 (class 0 OID 24881)
-- Dependencies: 226
-- Data for Name: user_balance; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_balance (id, user_id, total_deposited, bonus_balance) FROM stdin;
1	9	0.00	150.00
2	10	0.00	150.00
\.


--
-- TOC entry 5050 (class 0 OID 24831)
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
10	user1@gmail.com	$2a$11$0218NTe4vaqLbPePVFJe9ONv13Ibn7qNFntCTtMQPMt0hQFAUQigu	Саша	t	1
\.


--
-- TOC entry 5068 (class 0 OID 0)
-- Dependencies: 223
-- Name: promocodes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.promocodes_id_seq', 4, true);


--
-- TOC entry 5069 (class 0 OID 0)
-- Dependencies: 221
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_id_seq', 2, true);


--
-- TOC entry 5070 (class 0 OID 0)
-- Dependencies: 225
-- Name: user_balance_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_balance_id_seq', 2, true);


--
-- TOC entry 5071 (class 0 OID 0)
-- Dependencies: 220
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 10, true);


-- Completed on 2026-02-27 13:55:31

--
-- PostgreSQL database dump complete
--

\unrestrict AEpZRaazKRbRG73hgJo7rfe1EYOoAvTyvAC6W0YUGl9GU3sFwPST83yImgHJXPl

