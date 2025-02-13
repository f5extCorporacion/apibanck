/*
  Warnings:

  - You are about to drop the column `tarjetaId` on the `Cuenta` table. All the data in the column will be lost.
  - You are about to drop the column `transaccionId` on the `Cuenta` table. All the data in the column will be lost.
  - Added the required column `cuentaId` to the `Tarjeta` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cuentaId` to the `Transaccion` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Cuenta" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "numerocuenta" TEXT NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "dineroCuenta" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVO',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Cuenta_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Cuenta" ("created_at", "dineroCuenta", "id", "numerocuenta", "status", "usuarioId") SELECT "created_at", "dineroCuenta", "id", "numerocuenta", "status", "usuarioId" FROM "Cuenta";
DROP TABLE "Cuenta";
ALTER TABLE "new_Cuenta" RENAME TO "Cuenta";
CREATE TABLE "new_Tarjeta" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "numeroTarjeta" TEXT NOT NULL,
    "pin" TEXT NOT NULL,
    "dineroTarjeta" TEXT NOT NULL,
    "cv" TEXT NOT NULL,
    "cuentaId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVO',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Tarjeta_cuentaId_fkey" FOREIGN KEY ("cuentaId") REFERENCES "Cuenta" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Tarjeta" ("created_at", "cv", "dineroTarjeta", "id", "numeroTarjeta", "pin", "status") SELECT "created_at", "cv", "dineroTarjeta", "id", "numeroTarjeta", "pin", "status" FROM "Tarjeta";
DROP TABLE "Tarjeta";
ALTER TABLE "new_Tarjeta" RENAME TO "Tarjeta";
CREATE TABLE "new_Transaccion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "numerocuenta" TEXT NOT NULL,
    "dineroenviado" TEXT NOT NULL,
    "dinerorecibido" TEXT NOT NULL,
    "cuentaId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVO',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Transaccion_cuentaId_fkey" FOREIGN KEY ("cuentaId") REFERENCES "Cuenta" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Transaccion" ("created_at", "dineroenviado", "dinerorecibido", "id", "numerocuenta", "status") SELECT "created_at", "dineroenviado", "dinerorecibido", "id", "numerocuenta", "status" FROM "Transaccion";
DROP TABLE "Transaccion";
ALTER TABLE "new_Transaccion" RENAME TO "Transaccion";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
