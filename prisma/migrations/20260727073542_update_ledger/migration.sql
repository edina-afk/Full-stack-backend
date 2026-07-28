/*
  Warnings:

  - You are about to drop the column `amount` on the `Ledger` table. All the data in the column will be lost.
  - You are about to drop the column `balance` on the `Ledger` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Ledger` table. All the data in the column will be lost.
  - You are about to drop the column `voucherNumber` on the `Ledger` table. All the data in the column will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `itemName` to the `Ledger` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paidAmount` to the `Ledger` table without a default value. This is not possible if the table is not empty.
  - Added the required column `remaining` to the `Ledger` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalPrice` to the `Ledger` table without a default value. This is not possible if the table is not empty.
  - Made the column `quantity` on table `Ledger` required. This step will fail if there are existing NULL values in that column.
  - Made the column `unitPrice` on table `Ledger` required. This step will fail if there are existing NULL values in that column.
  - Made the column `phone` on table `Member` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Ledger" DROP COLUMN "amount",
DROP COLUMN "balance",
DROP COLUMN "description",
DROP COLUMN "voucherNumber",
ADD COLUMN     "itemName" TEXT NOT NULL,
ADD COLUMN     "paidAmount" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "remaining" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "totalPrice" DECIMAL(10,2) NOT NULL,
ALTER COLUMN "quantity" SET NOT NULL,
ALTER COLUMN "unitPrice" SET NOT NULL;

-- AlterTable
ALTER TABLE "Member" ALTER COLUMN "phone" SET NOT NULL;

-- DropTable
DROP TABLE "User";
