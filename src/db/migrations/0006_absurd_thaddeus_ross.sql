CREATE TABLE "contact" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"fullName" text NOT NULL,
	"mobile" text NOT NULL,
	"email" text NOT NULL,
	"subject" text,
	"message" text NOT NULL,
	"isResolved" boolean DEFAULT false NOT NULL,
	"resolvedById" uuid,
	"resolvedAt" timestamp,
	"adminNotes" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "contact" ADD CONSTRAINT "contact_resolvedById_user_id_fk" FOREIGN KEY ("resolvedById") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "contact_email_idx" ON "contact" USING btree ("email");--> statement-breakpoint
CREATE INDEX "contact_createdAt_idx" ON "contact" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "contact_isResolved_idx" ON "contact" USING btree ("isResolved");--> statement-breakpoint
CREATE INDEX "contact_resolvedById_idx" ON "contact" USING btree ("resolvedById");