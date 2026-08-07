/*
  Warnings:

  - You are about to drop the column `role` on the `Ledger` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Ledger" DROP COLUMN "role";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'ADMIN';
