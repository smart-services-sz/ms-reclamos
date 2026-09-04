-- AlterTable
ALTER TABLE "reclamos"
ADD COLUMN "municipality_id" TEXT,
ADD COLUMN "area_id" TEXT;

-- CreateIndex
CREATE INDEX "reclamos_municipality_id_area_id_idx" ON "reclamos"("municipality_id", "area_id");
