-- Add archive support for community moderation
ALTER TYPE "PostStatus" ADD VALUE IF NOT EXISTS 'ARCHIVED';

ALTER TABLE "Comment" ADD COLUMN IF NOT EXISTS "archivedAt" TIMESTAMP(3);
ALTER TABLE "Message" ADD COLUMN IF NOT EXISTS "archivedAt" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "Comment_postId_archivedAt_createdAt_idx" ON "Comment"("postId", "archivedAt", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "Message_roomId_archivedAt_createdAt_idx" ON "Message"("roomId", "archivedAt", "createdAt" DESC);
