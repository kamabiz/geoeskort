-- Store selected gender identity to support user filtering in DM/member lists
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "gender" TEXT;
