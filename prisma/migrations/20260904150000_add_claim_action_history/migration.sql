-- CreateTable
CREATE TABLE "historial_acciones" (
    "id" TEXT NOT NULL,
    "reclamo_id" TEXT NOT NULL,
    "accion" TEXT NOT NULL,
    "origen" TEXT NOT NULL,
    "actor_id" TEXT,
    "estado_anterior" "ReclamoEstado",
    "estado_nuevo" "ReclamoEstado",
    "motivo" TEXT,
    "referencia_id" TEXT,
    "metadata" JSONB,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historial_acciones_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "historial_acciones_reclamo_id_creado_en_idx" ON "historial_acciones"("reclamo_id", "creado_en");

-- CreateIndex
CREATE INDEX "historial_acciones_origen_referencia_id_idx" ON "historial_acciones"("origen", "referencia_id");

-- AddForeignKey
ALTER TABLE "historial_acciones" ADD CONSTRAINT "historial_acciones_reclamo_id_fkey" FOREIGN KEY ("reclamo_id") REFERENCES "reclamos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
