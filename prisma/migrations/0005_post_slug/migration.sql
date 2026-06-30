-- Add SEO-friendly slug to community posts
ALTER TABLE "Post" ADD COLUMN "slug" TEXT;

UPDATE "Post" SET "slug" = "id" WHERE "slug" IS NULL;

ALTER TABLE "Post" ALTER COLUMN "slug" SET NOT NULL;

CREATE UNIQUE INDEX "Post_slug_key" ON "Post"("slug");
