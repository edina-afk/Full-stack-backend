ALTER TABLE "Ledger"
ADD COLUMN "receiptNo" TEXT;

UPDATE "Ledger"
SET "receiptNo" = 'REC-' || id
WHERE "receiptNo" IS NULL;

ALTER TABLE "Ledger"
ALTER COLUMN "receiptNo" SET NOT NULL;

CREATE UNIQUE INDEX "Ledger_receiptNo_key"
ON "Ledger"("receiptNo");