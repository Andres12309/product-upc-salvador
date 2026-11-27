-- CreateEnum
CREATE TYPE "Role" AS ENUM ('admin', 'manager');

-- CreateTable
CREATE TABLE "user" (
    "id" UUID NOT NULL,
    "username" VARCHAR(255) NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "category" (
    "id" UUID NOT NULL,
    "code" VARCHAR(32) NOT NULL,

    CONSTRAINT "category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subcategory" (
    "id" UUID NOT NULL,
    "code" VARCHAR(32) NOT NULL,
    "categoryId" UUID NOT NULL,

    CONSTRAINT "subcategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product" (
    "id" UUID NOT NULL,
    "upcCode" VARCHAR(12) NOT NULL,
    "upcDescription" TEXT NOT NULL,
    "subcategoryId" UUID NOT NULL,
    "dateAdded" TIMESTAMPTZ(6) NOT NULL,
    "updatedDate" TIMESTAMPTZ(6) NOT NULL,
    "addedBy" VARCHAR(255) NOT NULL,
    "modifiedBy" VARCHAR(255) NOT NULL,

    CONSTRAINT "product_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_username_key" ON "user"("username");

-- CreateIndex
CREATE UNIQUE INDEX "category_code_key" ON "category"("code");

-- CreateIndex
CREATE UNIQUE INDEX "subcategory_code_key" ON "subcategory"("code");

-- CreateIndex
CREATE INDEX "subcategory_categoryId_idx" ON "subcategory"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "product_upcCode_key" ON "product"("upcCode");

-- CreateIndex
CREATE INDEX "product_subcategoryId_idx" ON "product"("subcategoryId");

-- AddForeignKey
ALTER TABLE "subcategory" ADD CONSTRAINT "subcategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_subcategoryId_fkey" FOREIGN KEY ("subcategoryId") REFERENCES "subcategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
