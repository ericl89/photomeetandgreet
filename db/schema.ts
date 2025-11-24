import {
    pgTable, serial, integer, varchar, text, timestamp, boolean,
    pgEnum, jsonb, primaryKey, unique, index
} from "drizzle-orm/pg-core";

/* ============================
   Enums
============================ */
//export const roleEnum = pgEnum("role", ["SUPER_ADMIN", "GROUP_ADMIN"]);
export const memberTypeEnum = pgEnum("memberType", ["MEMBER", "SUPER_ADMIN", "GROUP_ADMIN"]);
export const attendeeRoleEnum = pgEnum("attendee_role", ["model", "photographer", "both", "other"]);
export const eventStatusEnum = pgEnum("event_status", ["draft", "published", "canceled"]);

/* ============================
   Groups
============================ */
export const groups = pgTable("groups", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 120 }).notNull().unique(),
    slug: varchar("slug", { length: 140 }).notNull().unique(),
    timezone: varchar("timezone", { length: 64 }).default("America/Chicago").notNull(),
    isArchived: boolean("is_archived").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});


/* ============================
   Members
============================ */
export const members = pgTable("members", {
    id: serial("id").primaryKey(),
    firstName: varchar("first_name", { length: 100 }).notNull(),
    lastName: varchar("last_name", { length: 100 }).notNull(),
    email: varchar("email", { length: 190 }).notNull(),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    role: attendeeRoleEnum("role").notNull(), // model | photographer
    memberType: memberTypeEnum("memberType").default("MEMBER").notNull(),
    workingName: varchar("working_name", { length: 150 }),
    socials: jsonb("socials").$type<Record<string, string>>().default({}).notNull(), // flexible socials
    emailVerifiedAt: timestamp("email_verified_at", { withTimezone: true }),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    failedLogins: integer("failed_logins").default(0).notNull(),
    lockedUntil: timestamp("locked_until", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
    uniqEmail: unique("uniq_members_email").on(t.email),
}));

// Refresh Tokens
export const memberRefreshTokens = pgTable("member_refresh_tokens", {
    id: serial("id").primaryKey(),
    memberId: integer("member_id").references(() => members.id, { onDelete: "cascade" }).notNull(),
    hashedToken: varchar("hashed_token", { length: 255 }).notNull(),
    userAgent: text("user_agent"),
    ipHash: varchar("ip_hash", { length: 128 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
}, (t) => ({
    uniqHash: unique("uniq_member_refresh_hash").on(t.hashedToken),
    idxMember: index("idx_member_refresh_member").on(t.memberId),
}));

// Permission groups
export const userGroups = pgTable("user_groups", {
    userId: integer("user_id").references(() => members.id, { onDelete: "cascade" }).notNull(),
    groupId: integer("group_id").references(() => groups.id, { onDelete: "cascade" }).notNull(),
}, (t) => ({
    pk: primaryKey({ columns: [t.userId, t.groupId] }),
}));

/* ============================
   Events
============================ */
export const events = pgTable("events", {
    id: serial("id").primaryKey(),
    groupId: integer("group_id").references(() => groups.id, { onDelete: "restrict" }).notNull(),
    title: varchar("title", { length: 200 }).notNull(),
    address: varchar("address", { length: 255 }).notNull(),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    endsAt: timestamp("ends_at", { withTimezone: true }),
    timezone: varchar("timezone", { length: 32 }).default("America/Chicago").notNull(),
    status: eventStatusEnum("status").default("published").notNull(),
    signInSlug: varchar("sign_in_slug", { length: 4 }).notNull().unique(),
    qrSecret: varchar("qr_secret", { length: 37 }).notNull().unique(),
    createdBy: integer("created_by").references(() => members.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
    idxGroupTime: index("idx_events_group_time").on(t.groupId, t.startsAt),
}));

/* ============================
   Attendance
============================ */
export const attendances = pgTable("attendances", {
    id: serial("id").primaryKey(),
    eventId: integer("event_id").references(() => events.id, { onDelete: "cascade" }).notNull(),
    memberId: integer("member_id").references(() => members.id, { onDelete: "cascade" }).notNull(),
    signedInAt: timestamp("signed_in_at", { withTimezone: true }).defaultNow().notNull(),
    source: varchar("source", { length: 24 }).default("qr").notNull(), // qr | manual, etc.
}, (t) => ({
    uniqEventMember: unique("uniq_event_member").on(t.eventId, t.memberId),
}));

/* ============================
   Audit Log (admin & sensitive actions)
============================ */
export const auditLog = pgTable("audit_log", {
    id: serial("id").primaryKey(),
    actorUserId: integer("actor_user_id").references(() => members.id, { onDelete: "set null" }),
    action: varchar("action", { length: 80 }).notNull(),
    subjectTable: varchar("subject_table", { length: 80 }),
    subjectId: integer("subject_id"),
    meta: jsonb("meta"),
    ipHash: varchar("ip_hash", { length: 128 }),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});