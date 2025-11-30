import { pgTable, text, timestamp, integer, varchar, uuid, serial } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 50 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Locations table
export const locations = pgTable('locations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  address: text('address').notNull(),
  latitude: text('latitude'),
  longitude: text('longitude'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Trackings table
export const trackings = pgTable('trackings', {
  id: varchar('id', { length: 50 }).primaryKey(), // Custom tracking ID like TRK123456789
  name: text('name').notNull(),
  userId: uuid('user_id').notNull().references(() => users.id),
  startLocationId: uuid('start_location_id').notNull().references(() => locations.id),
  endLocationId: uuid('end_location_id').notNull().references(() => locations.id),
  status: varchar('status', { length: 50 }).notNull().default('pending'), // pending, in-progress, completed, cancelled
  currentLocationIndex: integer('current_location_index').notNull().default(0),
  estimatedDelivery: timestamp('estimated_delivery'),
  imageUrl: text('image_url'), // Cloudinary URL to the product image
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Tracking stopovers table (many-to-many relationship)
export const trackingStopovers = pgTable('tracking_stopovers', {
  id: uuid('id').primaryKey().defaultRandom(),
  trackingId: varchar('tracking_id', { length: 50 }).notNull().references(() => trackings.id, { onDelete: 'cascade' }),
  locationId: uuid('location_id').notNull().references(() => locations.id),
  order: integer('order').notNull(), // Order of the stopover in the route
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Admins table
export const admins = pgTable('admins', {
  id: uuid('id').primaryKey().defaultRandom(),
  username: varchar('username', { length: 100 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(), // In production, this should be hashed
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  trackings: many(trackings),
}));

export const locationsRelations = relations(locations, ({ many }) => ({
  startTrackings: many(trackings, { relationName: 'startLocation' }),
  endTrackings: many(trackings, { relationName: 'endLocation' }),
  stopovers: many(trackingStopovers),
}));

export const trackingsRelations = relations(trackings, ({ one, many }) => ({
  user: one(users, {
    fields: [trackings.userId],
    references: [users.id],
  }),
  startLocation: one(locations, {
    fields: [trackings.startLocationId],
    references: [locations.id],
    relationName: 'startLocation',
  }),
  endLocation: one(locations, {
    fields: [trackings.endLocationId],
    references: [locations.id],
    relationName: 'endLocation',
  }),
  stopovers: many(trackingStopovers),
}));

export const trackingStopoverRelations = relations(trackingStopovers, ({ one }) => ({
  tracking: one(trackings, {
    fields: [trackingStopovers.trackingId],
    references: [trackings.id],
  }),
  location: one(locations, {
    fields: [trackingStopovers.locationId],
    references: [locations.id],
  }),
}));

// Export types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Location = typeof locations.$inferSelect;
export type NewLocation = typeof locations.$inferInsert;

export type Tracking = typeof trackings.$inferSelect;
export type NewTracking = typeof trackings.$inferInsert;

export type TrackingStopover = typeof trackingStopovers.$inferSelect;
export type NewTrackingStopover = typeof trackingStopovers.$inferInsert;

export type Admin = typeof admins.$inferSelect;
export type NewAdmin = typeof admins.$inferInsert;
