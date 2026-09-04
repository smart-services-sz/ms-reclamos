-- CreateTable
CREATE TABLE "revisiones_resolucion" (
    "id" TEXT NOT NULL,
    "reclamo_id" TEXT NOT NULL,
    "resultado" TEXT NOT NULL,
    "actor_id" TEXT,
    "comentario" TEXT,
    "creada_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "revisiones_resolucion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nuevas_visitas" (
    "id" TEXT NOT NULL,
    "reclamo_id" TEXT NOT NULL,
    "actor_id" TEXT,
    "motivo" TEXT NOT NULL,
    "programada_en" TIMESTAMP(3),
    "estado" TEXT NOT NULL DEFAULT 'solicitada',
    "creada_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "nuevas_visitas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "revisiones_resolucion_reclamo_id_creada_en_idx" ON "revisiones_resolucion"("reclamo_id", "creada_en");
CREATE INDEX "nuevas_visitas_reclamo_id_creada_en_idx" ON "nuevas_visitas"("reclamo_id", "creada_en");

-- AddForeignKey
ALTER TABLE "revisiones_resolucion" ADD CONSTRAINT "revisiones_resolucion_reclamo_id_fkey" FOREIGN KEY ("reclamo_id") REFERENCES "reclamos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "nuevas_visitas" ADD CONSTRAINT "nuevas_visitas_reclamo_id_fkey" FOREIGN KEY ("reclamo_id") REFERENCES "reclamos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
