CREATE TYPE "public"."currency" AS ENUM('USD', 'KES', 'SOS');--> statement-breakpoint
CREATE TYPE "public"."paymentMethod" AS ENUM('MPESA', 'EVC');--> statement-breakpoint
CREATE TYPE "public"."paymentStatus" AS ENUM('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."serviceType" AS ENUM('PROPERTY_LISTING', 'HOTEL_LISTING', 'FEATURED_PROPERTY', 'URGENT_LISTING');--> statement-breakpoint
CREATE TABLE "payment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"transactionId" text NOT NULL,
	"amount" numeric NOT NULL,
	"receiptNumber" text NOT NULL,
	"transactionDate" timestamp NOT NULL,
	"phoneNumber" text NOT NULL,
	"paymentStatus" "paymentStatus" DEFAULT 'PENDING' NOT NULL,
	"paymentMethod" "paymentMethod" NOT NULL,
	"propertyId" uuid,
	"userId" uuid NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "payment_transactionId_unique" UNIQUE("transactionId")
);
--> statement-breakpoint
CREATE TABLE "servicePricing" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"serviceType" "serviceType" NOT NULL,
	"serviceName" text NOT NULL,
	"amount" numeric NOT NULL,
	"currency" "currency" DEFAULT 'USD' NOT NULL,
	"description" text,
	"active" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "payment" ADD CONSTRAINT "payment_propertyId_property_id_fk" FOREIGN KEY ("propertyId") REFERENCES "public"."property"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment" ADD CONSTRAINT "payment_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "payment_userId_idx" ON "payment" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "payment_propertyId_idx" ON "payment" USING btree ("propertyId");--> statement-breakpoint
CREATE INDEX "payment_paymentStatus_idx" ON "payment" USING btree ("paymentStatus");--> statement-breakpoint
CREATE INDEX "payment_transactionDate_idx" ON "payment" USING btree ("transactionDate");--> statement-breakpoint
CREATE INDEX "service_pricing_service_type_idx" ON "servicePricing" USING btree ("serviceType");--> statement-breakpoint
CREATE INDEX "service_pricing_active_idx" ON "servicePricing" USING btree ("active");