CREATE TYPE "public"."permission" AS ENUM('USER_READ', 'USER_WRITE', 'USER_DELETE', 'USER_ACTIVATE', 'USER_DEACTIVATE', 'PROPERTY_READ', 'PROPERTY_WRITE', 'PROPERTY_DELETE', 'PROPERTY_APPROVE', 'PROPERTY_REJECT', 'PROPERTY_FEATURE', 'PROPERTY_MODERATE', 'MEDIA_READ', 'MEDIA_WRITE', 'MEDIA_DELETE', 'AGENCY_READ', 'AGENCY_WRITE', 'AGENCY_DELETE', 'AGENCY_VERIFY', 'PAYMENT_READ', 'PAYMENT_PROCESS', 'PAYMENT_REFUND', 'CONTENT_MODERATE', 'CONTENT_DELETE', 'CONTENT_APPROVE', 'ANALYTICS_READ', 'REPORT_GENERATE', 'ADMIN_ACCESS', 'SYSTEM_CONFIG', 'AUDIT_LOG_READ');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('USER', 'AGENT', 'ADMIN');--> statement-breakpoint
CREATE TABLE "media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"propertyId" uuid NOT NULL,
	"type" text NOT NULL,
	"url" text NOT NULL,
	"fileName" text,
	"fileSize" integer,
	"displayOrder" integer DEFAULT 0 NOT NULL,
	"isPrimary" boolean DEFAULT false NOT NULL,
	"uploadedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "property" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"propertyType" text NOT NULL,
	"listingType" text NOT NULL,
	"bedrooms" integer,
	"bathrooms" integer,
	"parkingSpaces" integer,
	"landSize" numeric,
	"floorArea" numeric,
	"hasAirConditioning" boolean DEFAULT false,
	"address" text NOT NULL,
	"country" text NOT NULL,
	"price" numeric NOT NULL,
	"priceType" text NOT NULL,
	"rentFrequency" text,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"availableFrom" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"deletedAt" timestamp
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
	"isSignedIn" boolean DEFAULT false NOT NULL,
	"isDeleted" boolean DEFAULT false NOT NULL,
	"profilePicture" text,
	"bio" text,
	"address" text,
	"agentNumber" text,
	"agencyName" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"deletedAt" timestamp,
	CONSTRAINT "user_email_unique" UNIQUE("email"),
	CONSTRAINT "user_mobile_unique" UNIQUE("mobile")
);
--> statement-breakpoint
ALTER TABLE "media" ADD CONSTRAINT "media_propertyId_property_id_fk" FOREIGN KEY ("propertyId") REFERENCES "public"."property"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property" ADD CONSTRAINT "property_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resetToken" ADD CONSTRAINT "resetToken_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "media_propertyId_idx" ON "media" USING btree ("propertyId");--> statement-breakpoint
CREATE INDEX "media_type_idx" ON "media" USING btree ("type");--> statement-breakpoint
CREATE INDEX "media_isPrimary_idx" ON "media" USING btree ("isPrimary");--> statement-breakpoint
CREATE INDEX "media_displayOrder_idx" ON "media" USING btree ("displayOrder");--> statement-breakpoint
CREATE INDEX "property_userId_idx" ON "property" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "property_propertyType_idx" ON "property" USING btree ("propertyType");--> statement-breakpoint
CREATE INDEX "property_listingType_idx" ON "property" USING btree ("listingType");--> statement-breakpoint
CREATE INDEX "property_status_idx" ON "property" USING btree ("status");--> statement-breakpoint
CREATE INDEX "property_country_idx" ON "property" USING btree ("country");--> statement-breakpoint
CREATE INDEX "property_price_idx" ON "property" USING btree ("price");--> statement-breakpoint
CREATE INDEX "property_bedrooms_idx" ON "property" USING btree ("bedrooms");--> statement-breakpoint
CREATE INDEX "property_bathrooms_idx" ON "property" USING btree ("bathrooms");--> statement-breakpoint
CREATE INDEX "property_createdAt_idx" ON "property" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "user_email_idx" ON "user" USING btree ("email");--> statement-breakpoint
CREATE INDEX "user_mobile_idx" ON "user" USING btree ("mobile");--> statement-breakpoint
CREATE INDEX "user_role_idx" ON "user" USING btree ("role");--> statement-breakpoint
CREATE INDEX "user_isActive_idx" ON "user" USING btree ("isActive");--> statement-breakpoint
CREATE INDEX "user_isDeleted_idx" ON "user" USING btree ("isDeleted");--> statement-breakpoint
CREATE INDEX "user_createdAt_idx" ON "user" USING btree ("createdAt");