CREATE TABLE "respuestas_ciudadanas" (
  "id" TEXT NOT NULL,
  "reclamo_id" TEXT NOT NULL,
  "tipo" TEXT NOT NULL,
  "comentario" TEXT,
  "contact_key" TEXT,
  "creada_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "respuestas_ciudadanas_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "reaperturas" (
  "id" TEXT NOT NULL,
  "reclamo_id" TEXT NOT NULL,
  "actor_id" TEXT,
  "motivo" TEXT NOT NULL,
  "creada_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "reaperturas_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "respuestas_ciudadanas_reclamo_id_creada_en_idx" ON "respuestas_ciudadanas"("reclamo_id", "creada_en");
CREATE INDEX "reaperturas_reclamo_id_creada_en_idx" ON "reaperturas"("reclamo_id", "creada_en");

ALTER TABLE "respuestas_ciudadanas" ADD CONSTRAINT "respuestas_ciudadanas_reclamo_id_fkey" FOREIGN KEY ("reclamo_id") REFERENCES "reclamos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "reaperturas" ADD CONSTRAINT "reaperturas_reclamo_id_fkey" FOREIGN KEY ("reclamo_id") REFERENCES "reclamos"("id") ON DELETE CASCADE ON UPDATE CASCADE;