/*
  Warnings:

  - You are about to drop the column `cuentaId` on the `Transaccion` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Transaccion` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Transaccion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fecha" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "monto" REAL NOT NULL,
    "cuentaOrigenId" INTEGER NOT NULL,
    "cuentaDestinoId" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'COMPLETADA',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Transaccion_cuentaOrigenId_fkey" FOREIGN KEY ("cuentaOrigenId") REFERENCES "Cuenta" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Transaccion_cuentaDestinoId_fkey" FOREIGN KEY ("cuentaDestinoId") REFERENCES "Cuenta" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Transaccion" ("created_at", "cuentaDestinoId", "cuentaOrigenId", "estado", "fecha", "id", "monto", "tipo") SELECT "created_at", "cuentaDestinoId", "cuentaOrigenId", "estado", "fecha", "id", "monto", "tipo" FROM "Transaccion";
DROP TABLE "Transaccion";
ALTER TABLE "new_Transaccion" RENAME TO "Transaccion";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
