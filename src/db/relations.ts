import * as schema from './schema.ts';
import { defineRelations } from 'drizzle-orm';

export const relations = defineRelations(schema, (r) => ({
  users: {
    habits: r.many.habits(),
  },
  habits: {
    user: r.one.users({
      from: r.habits.userId,
      to: r.users.id,
    }),
    entries: r.many.entries(),
    habitTags: r.many.habitTags(),
  },
  entries: {
    habit: r.one.habits({
      from: r.entries.habitId,
      to: r.habits.id,
    }),
  },
  tags: {
    habitTags: r.many.habitTags(),
  },
  habitTags: {
    habit: r.one.habits({
      from: r.habitTags.habitId,
      to: r.habits.id,
    }),
    tag: r.one.tags({
      from: r.habitTags.tagId,
      to: r.tags.id,
    }),
  },
}));
