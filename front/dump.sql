DROP TABLE IF EXISTS "users";
DROP SEQUENCE IF EXISTS users_id_seq;
CREATE SEQUENCE users_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 9223372036854775807 START 1 CACHE 1;

CREATE TABLE "public"."users" (
    "id" integer DEFAULT nextval('users_id_seq') NOT NULL,
    "username" varchar(255) NOT NULL,
    "password" varchar(255) NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
) WITH (oids = false);

INSERT INTO "users" ("id", "username", "password") VALUES
(1,	'bob', '$2a$12$9IOb9uQ9fWHq7drYZMD3QO0fVsLCfc5cDgVN2neG4ajS/3vBclsK2'),
(2,	'admin', '$2y$10$ZObcfS4SZYEOTU2.S8P1VOe6zRXg9W1XMhYLoc9iR7aXMAxlXkHfG');
(3,	'jean', '$2y$10$h4f1YqejORNFndeMEUB.uurIoOxJ5Vs9Kxi41W4WzIA9EzEo3LjaC');
(4,	'marc', '$2y$10$d0ZtEBDbEtCELnwu5uDsAOux0UVwP9A6w3C5KoN9t1chhbwSp/xTy');
(5,	'franck', '$2y$10$1KBHlYWG/aNwf27EQcKhWu2t2/GSakUNKE1axKiHdkTZpyIHVx27y');