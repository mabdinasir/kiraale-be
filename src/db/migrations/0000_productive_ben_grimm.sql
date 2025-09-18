CREATE TYPE "public"."agencyRole" AS ENUM('AGENCY_ADMIN', 'AGENT');--> statement-breakpoint
CREATE TYPE "public"."country" AS ENUM('SOMALIA', 'KENYA');--> statement-breakpoint
CREATE TYPE "public"."currency" AS ENUM('USD', 'KES', 'SOS');--> statement-breakpoint
CREATE TYPE "public"."listingType" AS ENUM('SALE', 'RENT');--> statement-breakpoint
CREATE TYPE "public"."mediaType" AS ENUM('IMAGE', 'VIDEO', 'VIRTUAL_TOUR', 'FLOOR_PLAN');--> statement-breakpoint
CREATE TYPE "public"."paymentMethod" AS ENUM('MPESA', 'EVC');--> statement-breakpoint
CREATE TYPE "public"."paymentStatus" AS ENUM('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."permission" AS ENUM('USER_READ', 'USER_WRITE', 'USER_DELETE', 'USER_ACTIVATE', 'USER_DEACTIVATE', 'PROPERTY_READ', 'PROPERTY_WRITE', 'PROPERTY_DELETE', 'PROPERTY_APPROVE', 'PROPERTY_REJECT', 'PROPERTY_FEATURE', 'PROPERTY_MODERATE', 'MEDIA_READ', 'MEDIA_WRITE', 'MEDIA_DELETE', 'AGENCY_READ', 'AGENCY_WRITE', 'AGENCY_DELETE', 'AGENCY_VERIFY', 'PAYMENT_READ', 'PAYMENT_PROCESS', 'PAYMENT_REFUND', 'CONTENT_MODERATE', 'CONTENT_DELETE', 'CONTENT_APPROVE', 'ANALYTICS_READ', 'REPORT_GENERATE', 'ADMIN_ACCESS', 'SYSTEM_CONFIG', 'AUDIT_LOG_READ');--> statement-breakpoint
CREATE TYPE "public"."priceType" AS ENUM('FIXED', 'NEGOTIABLE', 'AUCTION', 'FROM');--> statement-breakpoint
CREATE TYPE "public"."propertyStatus" AS ENUM('PENDING', 'AVAILABLE', 'REJECTED', 'SOLD', 'LEASED', 'EXPIRED');--> statement-breakpoint
CREATE TYPE "public"."propertyType" AS ENUM('HOUSE', 'APARTMENT', 'CONDO', 'TOWNHOUSE', 'VILLA', 'STUDIO', 'LAND', 'COMMERCIAL', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."rentFrequency" AS ENUM('DAILY', 'WEEKLY', 'FORTNIGHTLY', 'MONTHLY', 'YEARLY');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('USER', 'ADMIN');--> statement-breakpoint
CREATE TYPE "public"."serviceType" AS ENUM('PROPERTY_LISTING', 'HOTEL_LISTING', 'FEATURED_PROPERTY', 'URGENT_LISTING');--> statement-breakpoint
CREATE TABLE "agency" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(200) NOT NULL,
	"description" text,
	"country" "country" NOT NULL,
	"address" text NOT NULL,
	"phone" varchar(20),
	"email" varchar(100),
	"website" varchar(200),
	"licenseNumber" varchar(100),
	"isActive" boolean DEFAULT true NOT NULL,
	"isSuspended" boolean DEFAULT false NOT NULL,
	"suspendedAt" timestamp with time zone,
	"suspendedBy" uuid,
	"suspensionReason" text,
	"createdById" uuid NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "agencyAgent" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agencyId" uuid NOT NULL,
	"userId" uuid NOT NULL,
	"role" varchar(50) DEFAULT 'AGENT' NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"joinedAt" timestamp with time zone DEFAULT now() NOT NULL,
	"leftAt" timestamp with time zone,
	CONSTRAINT "unique_active_user_agency" UNIQUE("userId","isActive")
);
--> statement-breakpoint
CREATE TABLE "favorite" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"propertyId" uuid NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_user_property_favorite" UNIQUE("userId","propertyId")
);
--> statement-breakpoint
CREATE TABLE "media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"propertyId" uuid NOT NULL,
	"type" "mediaType" NOT NULL,
	"url" text NOT NULL,
	"fileName" text,
	"fileSize" integer,
	"displayOrder" integer DEFAULT 0 NOT NULL,
	"isPrimary" boolean DEFAULT false NOT NULL,
	"uploadedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
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
CREATE TABLE "property" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"propertyType" "propertyType" NOT NULL,
	"listingType" "listingType" NOT NULL,
	"bedrooms" integer DEFAULT 0,
	"bathrooms" integer DEFAULT 0,
	"parkingSpaces" integer DEFAULT 0,
	"landSize" integer DEFAULT 0,
	"floorArea" integer DEFAULT 0,
	"hasAirConditioning" boolean DEFAULT false,
	"address" text NOT NULL,
	"country" "country" NOT NULL,
	"price" numeric NOT NULL,
	"priceType" "priceType" NOT NULL,
	"rentFrequency" "rentFrequency",
	"status" "propertyStatus" DEFAULT 'PENDING' NOT NULL,
	"availableFrom" timestamp,
	"reviewedAt" timestamp,
	"reviewedBy" uuid,
	"rejectionReason" text,
	"adminNotes" text,
	"expiresAt" timestamp,
	"searchVector" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"deletedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "propertyView" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"propertyId" uuid NOT NULL,
	"userId" uuid,
	"sessionId" text,
	"ipAddress" text,
	"userAgent" text,
	"referrer" text,
	"viewedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "resetToken" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"token" text NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "resetToken_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "rolePermission" (
	"roleValue" "role" NOT NULL,
	"permissionValue" "permission" NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "rolePermission_roleValue_permissionValue_pk" PRIMARY KEY("roleValue","permissionValue")
);
--> statement-breakpoint
CREATE TABLE "tokenBlacklist" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token" text NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tokenBlacklist_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"firstName" text NOT NULL,
	"lastName" text NOT NULL,
	"email" text NOT NULL,
	"mobile" text,
	"password" text NOT NULL,
	"role" "role" DEFAULT 'USER' NOT NULL,
	"nationalId" text,
	"passportNumber" text,
	"hasAcceptedTnC" boolean DEFAULT false NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"isSuspended" boolean DEFAULT false NOT NULL,
	"suspensionReason" text,
	"isSignedIn" boolean DEFAULT false NOT NULL,
	"isDeleted" boolean DEFAULT false NOT NULL,
	"profilePicture" text,
	"bio" text,
	"address" text,
	"agentNumber" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"deletedAt" timestamp,
	CONSTRAINT "user_email_unique" UNIQUE("email"),
	CONSTRAINT "user_mobile_unique" UNIQUE("mobile")
);
--> statement-breakpoint
ALTER TABLE "agency" ADD CONSTRAINT "agency_suspendedBy_user_id_fk" FOREIGN KEY ("suspendedBy") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agency" ADD CONSTRAINT "agency_createdById_user_id_fk" FOREIGN KEY ("createdById") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agencyAgent" ADD CONSTRAINT "agencyAgent_agencyId_agency_id_fk" FOREIGN KEY ("agencyId") REFERENCES "public"."agency"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agencyAgent" ADD CONSTRAINT "agencyAgent_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorite" ADD CONSTRAINT "favorite_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorite" ADD CONSTRAINT "favorite_propertyId_property_id_fk" FOREIGN KEY ("propertyId") REFERENCES "public"."property"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media" ADD CONSTRAINT "media_propertyId_property_id_fk" FOREIGN KEY ("propertyId") REFERENCES "public"."property"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment" ADD CONSTRAINT "payment_propertyId_property_id_fk" FOREIGN KEY ("propertyId") REFERENCES "public"."property"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment" ADD CONSTRAINT "payment_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property" ADD CONSTRAINT "property_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property" ADD CONSTRAINT "property_reviewedBy_user_id_fk" FOREIGN KEY ("reviewedBy") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "propertyView" ADD CONSTRAINT "propertyView_propertyId_property_id_fk" FOREIGN KEY ("propertyId") REFERENCES "public"."property"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "propertyView" ADD CONSTRAINT "propertyView_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resetToken" ADD CONSTRAINT "resetToken_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "media_propertyId_idx" ON "media" USING btree ("propertyId");--> statement-breakpoint
CREATE INDEX "media_type_idx" ON "media" USING btree ("type");--> statement-breakpoint
CREATE INDEX "media_isPrimary_idx" ON "media" USING btree ("isPrimary");--> statement-breakpoint
CREATE INDEX "media_displayOrder_idx" ON "media" USING btree ("displayOrder");--> statement-breakpoint
CREATE INDEX "payment_userId_idx" ON "payment" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "payment_propertyId_idx" ON "payment" USING btree ("propertyId");--> statement-breakpoint
CREATE INDEX "payment_paymentStatus_idx" ON "payment" USING btree ("paymentStatus");--> statement-breakpoint
CREATE INDEX "payment_transactionDate_idx" ON "payment" USING btree ("transactionDate");--> statement-breakpoint
CREATE INDEX "service_pricing_service_type_idx" ON "servicePricing" USING btree ("serviceType");--> statement-breakpoint
CREATE INDEX "service_pricing_active_idx" ON "servicePricing" USING btree ("active");--> statement-breakpoint
CREATE INDEX "property_userId_idx" ON "property" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "property_propertyType_idx" ON "property" USING btree ("propertyType");--> statement-breakpoint
CREATE INDEX "property_listingType_idx" ON "property" USING btree ("listingType");--> statement-breakpoint
CREATE INDEX "property_status_idx" ON "property" USING btree ("status");--> statement-breakpoint
CREATE INDEX "property_country_idx" ON "property" USING btree ("country");--> statement-breakpoint
CREATE INDEX "property_price_idx" ON "property" USING btree ("price");--> statement-breakpoint
CREATE INDEX "property_bedrooms_idx" ON "property" USING btree ("bedrooms");--> statement-breakpoint
CREATE INDEX "property_bathrooms_idx" ON "property" USING btree ("bathrooms");--> statement-breakpoint
CREATE INDEX "property_createdAt_idx" ON "property" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "property_searchVector_idx" ON "property" USING gin (to_tsvector('english', "searchVector"));--> statement-breakpoint
CREATE INDEX "propertyView_propertyId_idx" ON "propertyView" USING btree ("propertyId");--> statement-breakpoint
CREATE INDEX "propertyView_userId_idx" ON "propertyView" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "propertyView_sessionId_idx" ON "propertyView" USING btree ("sessionId");--> statement-breakpoint
CREATE INDEX "propertyView_viewedAt_idx" ON "propertyView" USING btree ("viewedAt");--> statement-breakpoint
CREATE INDEX "propertyView_property_user_date_idx" ON "propertyView" USING btree ("propertyId","userId","viewedAt");--> statement-breakpoint
CREATE INDEX "propertyView_property_session_date_idx" ON "propertyView" USING btree ("propertyId","sessionId","viewedAt");--> statement-breakpoint
CREATE INDEX "user_email_idx" ON "user" USING btree ("email");--> statement-breakpoint
CREATE INDEX "user_mobile_idx" ON "user" USING btree ("mobile");--> statement-breakpoint
CREATE INDEX "user_role_idx" ON "user" USING btree ("role");--> statement-breakpoint
CREATE INDEX "user_isActive_idx" ON "user" USING btree ("isActive");--> statement-breakpoint
CREATE INDEX "user_isSuspended_idx" ON "user" USING btree ("isSuspended");--> statement-breakpoint
CREATE INDEX "user_isDeleted_idx" ON "user" USING btree ("isDeleted");--> statement-breakpoint
CREATE INDEX "user_createdAt_idx" ON "user" USING btree ("createdAt");