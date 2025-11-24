import { relations } from "drizzle-orm/relations";
import { events, attendances, members, memberRefreshTokens, groups, userGroups } from "./schema";

export const attendancesRelations = relations(attendances, ({one}) => ({
	event: one(events, {
		fields: [attendances.eventId],
		references: [events.id]
	}),
	member: one(members, {
		fields: [attendances.memberId],
		references: [members.id]
	}),
}));

export const eventsRelations = relations(events, ({one, many}) => ({
	attendances: many(attendances),
	group: one(groups, {
		fields: [events.groupId],
		references: [groups.id]
	}),
}));

export const membersRelations = relations(members, ({many}) => ({
	attendances: many(attendances),
	memberRefreshTokens: many(memberRefreshTokens),
}));

export const memberRefreshTokensRelations = relations(memberRefreshTokens, ({one}) => ({
	member: one(members, {
		fields: [memberRefreshTokens.memberId],
		references: [members.id]
	}),
}));

export const groupsRelations = relations(groups, ({many}) => ({
	events: many(events),
	userGroups: many(userGroups),
}));

export const userGroupsRelations = relations(userGroups, ({one}) => ({
	group: one(groups, {
		fields: [userGroups.groupId],
		references: [groups.id]
	}),
}));