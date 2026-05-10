-- Add tracking code column for user-facing claim identification
ALTER TABLE "reclamos"
ADD COLUMN "codigo_seguimiento" TEXT;

-- Backfill existing rows with deterministic legacy code based on UUID
UPDATE "reclamos"
SET "codigo_seguimiento" = 'LEG-' || UPPER(REPLACE("id", '-', ''))
WHERE "codigo_seguimiento" IS NULL;

ALTER TABLE "reclamos"
ALTER COLUMN "codigo_seguimiento" SET NOT NULL;

CREATE UNIQUE INDEX "reclamos_codigo_seguimiento_key"
ON "reclamos"("codigo_seguimiento");
