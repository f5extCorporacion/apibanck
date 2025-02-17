/*
  Warnings:

  - You are about to alter the column `dineroCuenta` on the `Cuenta` table. The data in that column could be lost. The data in that column will be cast from `String` to `Float`.
  - You are about to alter the column `dineroTarjeta` on the `Tarjeta` table. The data in that column could be lost. The data in that column will be cast from `String` to `Float`.
  - You are about to drop the column `dineroenviado` on the `Transaccion` table. All the data in the column will be lost.
  - You are about to drop the column `dinerorecibido` on the `Transaccion` table. All the data in the column will be lost.
  - You are about to drop the column `numerocuenta` on the `Transaccion` table. All the data in the column will be lost.
  - Added the required column `cuentaDestinoId` to the `Transaccion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cuentaOrigenId` to the `Transaccion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `monto` to the `Transaccion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tipo` to the `Transaccion` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Cuenta" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "usuarioId" INTEGER NOT NULL,
    "numerocuenta" TEXT NOT NULL,
    "dineroCuenta" REAL NOT NULL DEFAULT 0,
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
    "dineroTarjeta" REAL NOT NULL DEFAULT 0,
    "cv" TEXT NOT NULL,
    "cuentaId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVO',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Tarjeta_cuentaId_fkey" FOREIGN KEY ("cuentaId") REFERENCES "Cuenta" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Tarjeta" ("created_at", "cuentaId", "cv", "dineroTarjeta", "id", "numeroTarjeta", "pin", "status") SELECT "created_at", "cuentaId", "cv", "dineroTarjeta", "id", "numeroTarjeta", "pin", "status" FROM "Tarjeta";
DROP TABLE "Tarjeta";
ALTER TABLE "new_Tarjeta" RENAME TO "Tarjeta";
CREATE TABLE "new_Transaccion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fecha" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "monto" REAL NOT NULL,
    "cuentaOrigenId" INTEGER NOT NULL,
    "cuentaDestinoId" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'COMPLETADA',
    "cuentaId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVO',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Transaccion_cuentaId_fkey" FOREIGN KEY ("cuentaId") REFERENCES "Cuenta" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Transaccion" ("created_at", "cuentaId", "id", "status") SELECT "created_at", "cuentaId", "id", "status" FROM "Transaccion";
DROP TABLE "Transaccion";
ALTER TABLE "new_Transaccion" RENAME TO "Transaccion";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
