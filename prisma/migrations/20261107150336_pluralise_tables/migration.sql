-- Rename tables to the plural, lowercase convention declared via @@map().
--
-- Prisma's own `migrate diff` generates DROP TABLE + CREATE TABLE here, which
-- would destroy every row. A rename moves the table (and its data) in place,
-- so this migration is lossless.
--
-- Indexes, constraints and sequences are renamed too: ALTER TABLE ... RENAME TO
-- does NOT rename them in Postgres, and leaving them as "User_pkey" etc. would
-- make the live database drift from schema.prisma.

-- Tables
ALTER TABLE "User" RENAME TO "users";
ALTER TABLE "Post" RENAME TO "posts";
ALTER TABLE "Comment" RENAME TO "comments";

-- Primary key and unique indexes
ALTER INDEX "User_pkey" RENAME TO "users_pkey";
ALTER INDEX "User_email_key" RENAME TO "users_email_key";
ALTER INDEX "Post_pkey" RENAME TO "posts_pkey";
ALTER INDEX "Comment_pkey" RENAME TO "comments_pkey";

-- Foreign key constraints
ALTER TABLE "posts" RENAME CONSTRAINT "Post_authorId_fkey" TO "posts_authorId_fkey";
ALTER TABLE "comments" RENAME CONSTRAINT "Comment_authorId_fkey" TO "comments_authorId_fkey";
ALTER TABLE "comments" RENAME CONSTRAINT "Comment_postId_fkey" TO "comments_postId_fkey";

-- Sequences backing the autoincrement columns
ALTER SEQUENCE "User_id_seq" RENAME TO "users_id_seq";
ALTER SEQUENCE "Post_id_seq" RENAME TO "posts_id_seq";
ALTER SEQUENCE "Comment_id_seq" RENAME TO "comments_id_seq";
