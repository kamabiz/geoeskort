-- CreateTable
CREATE TABLE "DatingProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "genderBucket" TEXT NOT NULL,
    "presetCase" TEXT NOT NULL,
    "bio" TEXT NOT NULL DEFAULT '',
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DatingProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DatingPhoto" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DatingPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DatingProfile_userId_key" ON "DatingProfile"("userId");

-- CreateIndex
CREATE INDEX "DatingProfile_genderBucket_isVisible_updatedAt_idx" ON "DatingProfile"("genderBucket", "isVisible", "updatedAt" DESC);

-- CreateIndex
CREATE INDEX "DatingPhoto_profileId_sortOrder_idx" ON "DatingPhoto"("profileId", "sortOrder");

-- AddForeignKey
ALTER TABLE "DatingProfile" ADD CONSTRAINT "DatingProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DatingPhoto" ADD CONSTRAINT "DatingPhoto_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "DatingProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
