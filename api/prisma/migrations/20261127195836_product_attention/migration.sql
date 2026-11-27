-- DropForeignKey
ALTER TABLE "product" DROP CONSTRAINT "product_subcategoryId_fkey";

-- AlterTable
ALTER TABLE "product" ADD COLUMN     "attentionReason" TEXT,
ADD COLUMN     "categoryId" UUID,
ADD COLUMN     "needsAttention" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "subcategoryId" DROP NOT NULL,
ALTER COLUMN "dateAdded" DROP NOT NULL,
ALTER COLUMN "updatedDate" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "product_categoryId_idx" ON "product"("categoryId");

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_subcategoryId_fkey" FOREIGN KEY ("subcategoryId") REFERENCES "subcategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
