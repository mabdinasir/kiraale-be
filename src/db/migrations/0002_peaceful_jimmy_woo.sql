ALTER TABLE "tenant" ADD COLUMN "leaseEndReason" text;--> statement-breakpoint
ALTER TABLE "tenant" ADD COLUMN "leaseEndNotes" text;--> statement-breakpoint
ALTER TABLE "tenant" DROP COLUMN "moveOutDate";--> statement-breakpoint
ALTER TABLE "tenant" DROP COLUMN "moveOutReason";