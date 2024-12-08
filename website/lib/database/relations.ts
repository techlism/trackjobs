import { relations } from 'drizzle-orm';
import {
    resumeTable,
    resumeSectionTable,
    resumeSectionFieldTable,
    resumeSectionItemTable,
    resumeSectionFieldValueTable,
} from './schema';

// Resume Table Relations
export const resumeRelations = relations(resumeTable, ({ many }) => ({
    sections: many(resumeSectionTable),
}));

// Resume Section Table Relations
export const resumeSectionRelations = relations(resumeSectionTable, ({ one, many }) => ({
    resume: one(resumeTable, {
        fields: [resumeSectionTable.resumeId],
        references: [resumeTable.id],
    }),
    fields: many(resumeSectionFieldTable),
    items: many(resumeSectionItemTable),
}));

// Resume Section Field Table Relations
export const resumeSectionFieldRelations = relations(resumeSectionFieldTable, ({ one, many }) => ({
    section: one(resumeSectionTable, {
        fields: [resumeSectionFieldTable.sectionId],
        references: [resumeSectionTable.id],
    }),
    fieldValues: many(resumeSectionFieldValueTable),
}));

// Resume Section Item Table Relations
export const resumeSectionItemRelations = relations(resumeSectionItemTable, ({ one, many }) => ({
    section: one(resumeSectionTable, {
        fields: [resumeSectionItemTable.sectionId],
        references: [resumeSectionTable.id],
    }),
    fieldValues: many(resumeSectionFieldValueTable),
}));

// Resume Section Field Value Table Relations
export const resumeSectionFieldValueRelations = relations(resumeSectionFieldValueTable, ({ one }) => ({
    sectionItem: one(resumeSectionItemTable, {
        fields: [resumeSectionFieldValueTable.sectionItemId],
        references: [resumeSectionItemTable.id],
    }),
    field: one(resumeSectionFieldTable, {
        fields: [resumeSectionFieldValueTable.fieldId],
        references: [resumeSectionFieldTable.id],
    }),
}));
