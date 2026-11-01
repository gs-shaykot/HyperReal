-- Return and refund foundation. No existing order/payment/inventory rows are modified.
CREATE TYPE "ReturnStatus" AS ENUM (
  'REQUESTED', 'APPROVED', 'REJECTED', 'IN_TRANSIT', 'RECEIVED',
  'INSPECTING', 'REFUND_APPROVED', 'REFUND_PROCESSING', 'REFUNDED',
  'CLOSED', 'CANCELLED'
);

CREATE TYPE "ReturnReason" AS ENUM (
  'WRONG_ITEM', 'DAMAGED', 'DEFECTIVE', 'SIZE_ISSUE',
  'NOT_AS_DESCRIBED', 'CHANGED_MIND', 'OTHER'
);

CREATE TYPE "ReturnItemCondition" AS ENUM (
  'UNINSPECTED', 'SEALED', 'GOOD', 'DAMAGED', 'DEFECTIVE', 'MISSING_PARTS'
);

CREATE TYPE "ReturnEventType" AS ENUM (
  'REQUESTED', 'APPROVED', 'REJECTED', 'CANCELLED', 'MARKED_IN_TRANSIT',
  'RECEIVED', 'INSPECTION_STARTED', 'INSPECTED', 'REFUND_APPROVED',
  'REFUND_INITIATED', 'REFUND_SUCCEEDED', 'REFUND_FAILED', 'NOTE_ADDED'
);

CREATE TYPE "RefundMethod" AS ENUM ('STRIPE', 'SSLC', 'COD_MANUAL');
CREATE TYPE "RefundStatus" AS ENUM (
  'PENDING', 'PROCESSING', 'SUCCEEDED', 'FAILED', 'REQUIRES_MANUAL_ACTION'
);

CREATE TABLE "ReturnRequest" (
  "id" TEXT NOT NULL,
  "returnCode" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "status" "ReturnStatus" NOT NULL DEFAULT 'REQUESTED',
  "reason" "ReturnReason" NOT NULL,
  "customerNote" TEXT,
  "adminNote" TEXT,
  "reviewedById" TEXT,
  "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "reviewedAt" TIMESTAMP(3),
  "receivedAt" TIMESTAMP(3),
  "inspectedAt" TIMESTAMP(3),
  "closedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ReturnRequest_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ReturnItem" (
  "id" TEXT NOT NULL,
  "returnRequestId" TEXT NOT NULL,
  "orderItemId" TEXT NOT NULL,
  "requestedQuantity" INTEGER NOT NULL,
  "approvedQuantity" INTEGER NOT NULL DEFAULT 0,
  "receivedQuantity" INTEGER NOT NULL DEFAULT 0,
  "restockQuantity" INTEGER NOT NULL DEFAULT 0,
  "condition" "ReturnItemCondition" NOT NULL DEFAULT 'UNINSPECTED',
  "inspectionNote" TEXT,
  "refundAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ReturnItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ReturnEvent" (
  "id" TEXT NOT NULL,
  "returnRequestId" TEXT NOT NULL,
  "actorId" TEXT,
  "type" "ReturnEventType" NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ReturnEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Refund" (
  "id" TEXT NOT NULL,
  "returnRequestId" TEXT NOT NULL,
  "method" "RefundMethod" NOT NULL,
  "status" "RefundStatus" NOT NULL DEFAULT 'PENDING',
  "amount" DECIMAL(12,2) NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "idempotencyKey" TEXT NOT NULL,
  "providerRefundId" TEXT,
  "failureReason" TEXT,
  "processedById" TEXT,
  "initiatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "processedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Refund_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ReturnRequest_returnCode_key" ON "ReturnRequest"("returnCode");
CREATE INDEX "ReturnRequest_userId_createdAt_idx" ON "ReturnRequest"("userId", "createdAt");
CREATE INDEX "ReturnRequest_orderId_status_idx" ON "ReturnRequest"("orderId", "status");
CREATE INDEX "ReturnRequest_status_createdAt_idx" ON "ReturnRequest"("status", "createdAt");

CREATE UNIQUE INDEX "ReturnItem_returnRequestId_orderItemId_key" ON "ReturnItem"("returnRequestId", "orderItemId");
CREATE INDEX "ReturnItem_orderItemId_idx" ON "ReturnItem"("orderItemId");

CREATE INDEX "ReturnEvent_returnRequestId_createdAt_idx" ON "ReturnEvent"("returnRequestId", "createdAt");

CREATE UNIQUE INDEX "Refund_returnRequestId_key" ON "Refund"("returnRequestId");
CREATE UNIQUE INDEX "Refund_idempotencyKey_key" ON "Refund"("idempotencyKey");
CREATE UNIQUE INDEX "Refund_providerRefundId_key" ON "Refund"("providerRefundId");
CREATE INDEX "Refund_status_createdAt_idx" ON "Refund"("status", "createdAt");

ALTER TABLE "ReturnRequest"
  ADD CONSTRAINT "ReturnRequest_orderId_fkey"
  FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ReturnRequest"
  ADD CONSTRAINT "ReturnRequest_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ReturnRequest"
  ADD CONSTRAINT "ReturnRequest_reviewedById_fkey"
  FOREIGN KEY ("reviewedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ReturnItem"
  ADD CONSTRAINT "ReturnItem_returnRequestId_fkey"
  FOREIGN KEY ("returnRequestId") REFERENCES "ReturnRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ReturnItem"
  ADD CONSTRAINT "ReturnItem_orderItemId_fkey"
  FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ReturnEvent"
  ADD CONSTRAINT "ReturnEvent_returnRequestId_fkey"
  FOREIGN KEY ("returnRequestId") REFERENCES "ReturnRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ReturnEvent"
  ADD CONSTRAINT "ReturnEvent_actorId_fkey"
  FOREIGN KEY ("actorId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Refund"
  ADD CONSTRAINT "Refund_returnRequestId_fkey"
  FOREIGN KEY ("returnRequestId") REFERENCES "ReturnRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Refund"
  ADD CONSTRAINT "Refund_processedById_fkey"
  FOREIGN KEY ("processedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
