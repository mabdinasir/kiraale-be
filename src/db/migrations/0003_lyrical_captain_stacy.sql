ALTER TABLE "rentPayment" ADD COLUMN "isDeleted" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "securityDeposit" ADD COLUMN "isDeleted" boolean DEFAULT false NOT NULL;--> statement-breakpoint
CREATE INDEX "rentPayment_isDeleted_idx" ON "rentPayment" USING btree ("isDeleted");--> statement-breakpoint
CREATE INDEX "securityDeposit_isDeleted_idx" ON "securityDeposit" USING btree ("isDeleted");