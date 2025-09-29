ALTER TABLE "maintenanceRecord" ADD COLUMN "isDeleted" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "propertyInspection" ADD COLUMN "isDeleted" boolean DEFAULT false NOT NULL;--> statement-breakpoint
CREATE INDEX "maintenanceRecord_isDeleted_idx" ON "maintenanceRecord" USING btree ("isDeleted");--> statement-breakpoint
CREATE INDEX "propertyInspection_isDeleted_idx" ON "propertyInspection" USING btree ("isDeleted");