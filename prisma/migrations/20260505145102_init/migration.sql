-- CreateEnum
CREATE TYPE "Canal" AS ENUM ('whatsapp', 'web', 'email', 'instagram', 'facebook', 'manual', 'other');

-- CreateEnum
CREATE TYPE "ReclamoEstado" AS ENUM ('pendiente', 'en_proceso', 'resuelto', 'rechazado', 'cerrado');

-- CreateEnum
CREATE TYPE "ReclamoCategoria" AS ENUM ('agua_y_cloacas', 'alumbrado', 'baches_y_pavimento', 'arbolado', 'residuos', 'electricidad', 'gas', 'transporte', 'infraestructura', 'otros');

-- CreateEnum
CREATE TYPE "ReclamoPrioridad" AS ENUM ('alta', 'media', 'baja');

-- CreateEnum
CREATE TYPE "MensajeOrigen" AS ENUM ('usuario', 'asistente');

-- CreateTable
CREATE TABLE "reclamos" (
    "id" TEXT NOT NULL,
    "correlation_id" TEXT NOT NULL,
    "contact_key" TEXT NOT NULL,
    "canal" "Canal" NOT NULL,
    "correo" TEXT,
    "dni" TEXT,
    "problema" TEXT NOT NULL,
    "direccion" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "categoria" "ReclamoCategoria" NOT NULL,
    "prioridad" "ReclamoPrioridad" NOT NULL,
    "estado" "ReclamoEstado" NOT NULL DEFAULT 'pendiente',
    "observaciones" TEXT,
    "metadata" JSONB,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,
    "resolved_at" TIMESTAMP(3),

    CONSTRAINT "reclamos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mensajes_historial" (
    "id" TEXT NOT NULL,
    "reclamo_id" TEXT NOT NULL,
    "origen" "MensajeOrigen" NOT NULL,
    "texto" TEXT NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "mensajes_historial_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "reclamos_correlation_id_key" ON "reclamos"("correlation_id");

-- CreateIndex
CREATE INDEX "reclamos_contact_key_idx" ON "reclamos"("contact_key");

-- CreateIndex
CREATE INDEX "reclamos_estado_idx" ON "reclamos"("estado");

-- CreateIndex
CREATE INDEX "reclamos_categoria_idx" ON "reclamos"("categoria");

-- CreateIndex
CREATE INDEX "reclamos_prioridad_idx" ON "reclamos"("prioridad");

-- CreateIndex
CREATE INDEX "reclamos_creado_en_idx" ON "reclamos"("creado_en");

-- CreateIndex
CREATE INDEX "mensajes_historial_reclamo_id_idx" ON "mensajes_historial"("reclamo_id");

-- AddForeignKey
ALTER TABLE "mensajes_historial" ADD CONSTRAINT "mensajes_historial_reclamo_id_fkey" FOREIGN KEY ("reclamo_id") REFERENCES "reclamos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
