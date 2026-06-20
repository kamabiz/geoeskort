-- SEO blog articles (admin CMS) — stored in Neon alongside community data
CREATE TYPE "BlogArticleStatus" AS ENUM ('DRAFT', 'PUBLISHED');

CREATE TABLE "BlogArticle" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "publishedAt" TEXT NOT NULL,
    "status" "BlogArticleStatus" NOT NULL DEFAULT 'PUBLISHED',
    "coverImage" TEXT,
    "title" TEXT NOT NULL,
    "seoTitle" TEXT NOT NULL DEFAULT '',
    "excerpt" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "focusKeyword" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlogArticle_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "BlogArticle_slug_key" ON "BlogArticle"("slug");
CREATE INDEX "BlogArticle_status_publishedAt_idx" ON "BlogArticle"("status", "publishedAt" DESC);
CREATE INDEX "BlogArticle_category_status_idx" ON "BlogArticle"("category", "status");
