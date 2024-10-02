-- CreateEnum
CREATE TYPE "AssetType" AS ENUM ('House', 'Apartment', 'Land', 'Building', 'Other');

-- CreateEnum
CREATE TYPE "AssetStatus" AS ENUM ('Available', 'Occupied', 'ForSale', 'Rented');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('Created', 'Updated', 'Deleted', 'Acquired', 'ListedForSale', 'Sold', 'Leased', 'LeaseTerminated', 'MaintenanceScheduled', 'MaintenanceCompleted', 'ValuationUpdated', 'Decommissioned', 'DamageReported', 'InsuranceClaimFiled', 'RenovationStarted', 'RenovationCompleted');

-- CreateTable
CREATE TABLE "Asset" (
    "id" SERIAL NOT NULL,
    "assetId" TEXT NOT NULL,
    "assetType" "AssetType" NOT NULL,
    "address" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "acquisitionDate" TIMESTAMP(3),
    "rentalIncome" DOUBLE PRECISION,
    "ownerId" INTEGER NOT NULL,
    "areaSqm" DOUBLE PRECISION,
    "description" TEXT,
    "status" "AssetStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Owner" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "authId" TEXT NOT NULL,

    CONSTRAINT "Owner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssetEvent" (
    "id" SERIAL NOT NULL,
    "assetId" INTEGER NOT NULL,
    "assetEventId" TEXT NOT NULL,
    "eventType" "EventType" NOT NULL,
    "description" TEXT,
    "eventDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssetEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Asset_assetId_key" ON "Asset"("assetId");

-- CreateIndex
CREATE UNIQUE INDEX "AssetEvent_assetEventId_key" ON "AssetEvent"("assetEventId");

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Owner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetEvent" ADD CONSTRAINT "AssetEvent_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
