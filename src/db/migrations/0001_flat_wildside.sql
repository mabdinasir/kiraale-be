CREATE TYPE "public"."documentType" AS ENUM('ID_CARD', 'PASSPORT', 'LEASE_AGREEMENT', 'EMPLOYMENT_LETTER');--> statement-breakpoint
CREATE TYPE "public"."familyRelationship" AS ENUM('SPOUSE', 'CHILD', 'PARENT', 'SIBLING', 'FRIEND', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."inspectionType" AS ENUM('MOVE_IN', 'ROUTINE', 'MOVE_OUT', 'EMERGENCY');--> statement-breakpoint
CREATE TYPE "public"."leaseFrequency" AS ENUM('MONTHLY', 'QUARTERLY', 'YEARLY', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."leaseType" AS ENUM('FIXED_TERM', 'PERIODIC', 'MONTH_TO_MONTH');--> statement-breakpoint
CREATE TYPE "public"."maintenanceUrgency" AS ENUM('LOW', 'MEDIUM', 'HIGH', 'EMERGENCY');--> statement-breakpoint
CREATE TABLE "maintenanceRecord" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"propertyId" uuid NOT NULL,
	"tenantId" uuid,
	"issue" text NOT NULL,
	"description" text NOT NULL,
	"urgency" "maintenanceUrgency" NOT NULL,
	"reportedDate" timestamp with time zone NOT NULL,
	"assignedTo" text,
	"startedDate" timestamp with time zone,
	"completedDate" timestamp with time zone,
	"cost" numeric(12, 2),
	"isFixed" boolean DEFAULT false NOT NULL,
	"warrantyExpiry" timestamp with time zone,
	"contractorName" text,
	"contractorPhone" text,
	"notes" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "propertyInspection" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"propertyId" uuid NOT NULL,
	"tenantId" uuid,
	"inspectionDate" timestamp with time zone NOT NULL,
	"inspectionType" "inspectionType" NOT NULL,
	"notes" text NOT NULL,
	"overallRating" integer NOT NULL,
	"inspectedBy" text NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rentPayment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenantId" uuid NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"paidDate" timestamp with time zone NOT NULL,
	"receiptNumber" text NOT NULL,
	"paymentMethod" text NOT NULL,
	"receivedBy" uuid NOT NULL,
	"paymentPeriodStart" timestamp with time zone NOT NULL,
	"paymentPeriodEnd" timestamp with time zone NOT NULL,
	"isPaid" boolean DEFAULT true NOT NULL,
	"notes" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "securityDeposit" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenantId" uuid NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"paidDate" timestamp with time zone NOT NULL,
	"receiptNumber" text NOT NULL,
	"refundAmount" numeric(12, 2),
	"refundDate" timestamp with time zone,
	"refundReason" text,
	"refundedBy" uuid,
	"isRefunded" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tenant" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"propertyId" uuid NOT NULL,
	"firstName" text NOT NULL,
	"lastName" text NOT NULL,
	"email" text NOT NULL,
	"mobile" text NOT NULL,
	"nationalId" text,
	"passportNumber" text,
	"emergencyContactName" text NOT NULL,
	"emergencyContactPhone" text NOT NULL,
	"leaseType" "leaseType" NOT NULL,
	"leaseFrequency" "leaseFrequency" NOT NULL,
	"rentAmount" numeric(12, 2) NOT NULL,
	"leaseStartDate" timestamp with time zone NOT NULL,
	"leaseEndDate" timestamp with time zone,
	"isActive" boolean DEFAULT true NOT NULL,
	"moveOutDate" timestamp with time zone,
	"moveOutReason" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tenantDocument" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenantId" uuid NOT NULL,
	"documentType" "documentType" NOT NULL,
	"url" text NOT NULL,
	"fileName" text NOT NULL,
	"fileSize" integer NOT NULL,
	"mimeType" text NOT NULL,
	"uploadedBy" uuid NOT NULL,
	"uploadedAt" timestamp with time zone DEFAULT now() NOT NULL,
	"expiryDate" timestamp with time zone,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tenantFamilyMember" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenantId" uuid NOT NULL,
	"firstName" text NOT NULL,
	"lastName" text NOT NULL,
	"email" text,
	"mobile" text,
	"relationship" "familyRelationship" NOT NULL,
	"age" integer NOT NULL,
	"nationalId" text,
	"isMinor" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "maintenanceRecord" ADD CONSTRAINT "maintenanceRecord_propertyId_property_id_fk" FOREIGN KEY ("propertyId") REFERENCES "public"."property"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maintenanceRecord" ADD CONSTRAINT "maintenanceRecord_tenantId_tenant_id_fk" FOREIGN KEY ("tenantId") REFERENCES "public"."tenant"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "propertyInspection" ADD CONSTRAINT "propertyInspection_propertyId_property_id_fk" FOREIGN KEY ("propertyId") REFERENCES "public"."property"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "propertyInspection" ADD CONSTRAINT "propertyInspection_tenantId_tenant_id_fk" FOREIGN KEY ("tenantId") REFERENCES "public"."tenant"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rentPayment" ADD CONSTRAINT "rentPayment_tenantId_tenant_id_fk" FOREIGN KEY ("tenantId") REFERENCES "public"."tenant"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rentPayment" ADD CONSTRAINT "rentPayment_receivedBy_user_id_fk" FOREIGN KEY ("receivedBy") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "securityDeposit" ADD CONSTRAINT "securityDeposit_tenantId_tenant_id_fk" FOREIGN KEY ("tenantId") REFERENCES "public"."tenant"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "securityDeposit" ADD CONSTRAINT "securityDeposit_refundedBy_user_id_fk" FOREIGN KEY ("refundedBy") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenant" ADD CONSTRAINT "tenant_propertyId_property_id_fk" FOREIGN KEY ("propertyId") REFERENCES "public"."property"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenantDocument" ADD CONSTRAINT "tenantDocument_tenantId_tenant_id_fk" FOREIGN KEY ("tenantId") REFERENCES "public"."tenant"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenantDocument" ADD CONSTRAINT "tenantDocument_uploadedBy_user_id_fk" FOREIGN KEY ("uploadedBy") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenantFamilyMember" ADD CONSTRAINT "tenantFamilyMember_tenantId_tenant_id_fk" FOREIGN KEY ("tenantId") REFERENCES "public"."tenant"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "maintenanceRecord_propertyId_idx" ON "maintenanceRecord" USING btree ("propertyId");--> statement-breakpoint
CREATE INDEX "maintenanceRecord_tenantId_idx" ON "maintenanceRecord" USING btree ("tenantId");--> statement-breakpoint
CREATE INDEX "maintenanceRecord_urgency_idx" ON "maintenanceRecord" USING btree ("urgency");--> statement-breakpoint
CREATE INDEX "maintenanceRecord_isFixed_idx" ON "maintenanceRecord" USING btree ("isFixed");--> statement-breakpoint
CREATE INDEX "maintenanceRecord_reportedDate_idx" ON "maintenanceRecord" USING btree ("reportedDate");--> statement-breakpoint
CREATE INDEX "propertyInspection_propertyId_idx" ON "propertyInspection" USING btree ("propertyId");--> statement-breakpoint
CREATE INDEX "propertyInspection_tenantId_idx" ON "propertyInspection" USING btree ("tenantId");--> statement-breakpoint
CREATE INDEX "propertyInspection_inspectionDate_idx" ON "propertyInspection" USING btree ("inspectionDate");--> statement-breakpoint
CREATE INDEX "propertyInspection_inspectionType_idx" ON "propertyInspection" USING btree ("inspectionType");--> statement-breakpoint
CREATE INDEX "rentPayment_tenantId_idx" ON "rentPayment" USING btree ("tenantId");--> statement-breakpoint
CREATE INDEX "rentPayment_paidDate_idx" ON "rentPayment" USING btree ("paidDate");--> statement-breakpoint
CREATE INDEX "rentPayment_receivedBy_idx" ON "rentPayment" USING btree ("receivedBy");--> statement-breakpoint
CREATE INDEX "rentPayment_isPaid_idx" ON "rentPayment" USING btree ("isPaid");--> statement-breakpoint
CREATE INDEX "securityDeposit_tenantId_idx" ON "securityDeposit" USING btree ("tenantId");--> statement-breakpoint
CREATE INDEX "securityDeposit_isRefunded_idx" ON "securityDeposit" USING btree ("isRefunded");--> statement-breakpoint
CREATE INDEX "tenant_propertyId_idx" ON "tenant" USING btree ("propertyId");--> statement-breakpoint
CREATE INDEX "tenant_email_idx" ON "tenant" USING btree ("email");--> statement-breakpoint
CREATE INDEX "tenant_isActive_idx" ON "tenant" USING btree ("isActive");--> statement-breakpoint
CREATE INDEX "tenant_leaseStartDate_idx" ON "tenant" USING btree ("leaseStartDate");--> statement-breakpoint
CREATE INDEX "tenant_createdAt_idx" ON "tenant" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "tenantDocument_tenantId_idx" ON "tenantDocument" USING btree ("tenantId");--> statement-breakpoint
CREATE INDEX "tenantDocument_documentType_idx" ON "tenantDocument" USING btree ("documentType");--> statement-breakpoint
CREATE INDEX "tenantDocument_uploadedBy_idx" ON "tenantDocument" USING btree ("uploadedBy");--> statement-breakpoint
CREATE INDEX "tenantFamilyMember_tenantId_idx" ON "tenantFamilyMember" USING btree ("tenantId");--> statement-breakpoint
CREATE INDEX "tenantFamilyMember_relationship_idx" ON "tenantFamilyMember" USING btree ("relationship");