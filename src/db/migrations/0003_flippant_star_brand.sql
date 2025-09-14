ALTER TABLE "user" ADD COLUMN "isSuspended" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "suspensionReason" text;--> statement-breakpoint
CREATE INDEX "user_isSuspended_idx" ON "user" USING btree ("isSuspended");