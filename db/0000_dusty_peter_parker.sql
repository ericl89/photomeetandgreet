CREATE TYPE "public"."attendee_role" AS ENUM('model', 'photographer');--> statement-breakpoint
CREATE TYPE "public"."event_status" AS ENUM('draft', 'published', 'canceled');--> statement-breakpoint
CREATE TYPE "public"."memberType" AS ENUM('MEMBER', 'SUPER_ADMIN', 'GROUP_ADMIN');--> statement-breakpoint
CREATE TABLE "attendances" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" integer NOT NULL,
	"member_id" integer NOT NULL,
	"signed_in_at" timestamp with time zone DEFAULT now() NOT NULL,
	"source" varchar(24) DEFAULT 'qr' NOT NULL,
	CONSTRAINT "uniq_event_member" UNIQUE("event_id","member_id")
);
--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"actor_user_id" integer,
	"action" varchar(80) NOT NULL,
	"subject_table" varchar(80),
	"subject_id" integer,
	"meta" jsonb,
	"ip_hash" varchar(128),
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" serial PRIMARY KEY NOT NULL,
	"group_id" integer NOT NULL,
	"title" varchar(200) NOT NULL,
	"address" varchar(255) NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone,
	"timezone" varchar(32) DEFAULT 'America/Chicago' NOT NULL,
	"status" "event_status" DEFAULT 'published' NOT NULL,
	"sign_in_slug" varchar(4) NOT NULL,
	"qr_secret" varchar(37) NOT NULL,
	"created_by" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "events_sign_in_slug_unique" UNIQUE("sign_in_slug"),
	CONSTRAINT "events_qr_secret_unique" UNIQUE("qr_secret")
);
--> statement-breakpoint
CREATE TABLE "groups" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(120) NOT NULL,
	"slug" varchar(140) NOT NULL,
	"timezone" varchar(64) DEFAULT 'America/Chicago' NOT NULL,
	"is_archived" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "groups_name_unique" UNIQUE("name"),
	CONSTRAINT "groups_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "member_refresh_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"member_id" integer NOT NULL,
	"hashed_token" varchar(255) NOT NULL,
	"user_agent" text,
	"ip_hash" varchar(128),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"last_used_at" timestamp with time zone,
	"revoked_at" timestamp with time zone,
	CONSTRAINT "uniq_member_refresh_hash" UNIQUE("hashed_token")
);
--> statement-breakpoint
CREATE TABLE "members" (
	"id" serial PRIMARY KEY NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"email" varchar(190) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"role" "attendee_role" NOT NULL,
	"working_name" varchar(150),
	"socials" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"email_verified_at" timestamp with time zone,
	"last_login_at" timestamp with time zone,
	"failed_logins" integer DEFAULT 0 NOT NULL,
	"locked_until" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"memberType" "memberType" DEFAULT 'MEMBER' NOT NULL,
	CONSTRAINT "uniq_members_email" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "user_groups" (
	"user_id" integer NOT NULL,
	"group_id" integer NOT NULL,
	CONSTRAINT "user_groups_user_id_group_id_pk" PRIMARY KEY("user_id","group_id")
);
--> statement-breakpoint
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_actor_user_id_members_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."members"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_created_by_members_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."members"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_refresh_tokens" ADD CONSTRAINT "member_refresh_tokens_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_groups" ADD CONSTRAINT "user_groups_user_id_members_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_groups" ADD CONSTRAINT "user_groups_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_events_group_time" ON "events" USING btree ("group_id","starts_at");--> statement-breakpoint
CREATE INDEX "idx_member_refresh_member" ON "member_refresh_tokens" USING btree ("member_id");