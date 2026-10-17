import { db } from '#prisma/db';

export type CategoryRecord = {
  categoryId: number;
  categoryName: string;
  defaultPriority: string;
};

export type CategoryRepository = {
  findById(categoryId: number): Promise<CategoryRecord | null>;
  findByIds(categoryIds: number[]): Promise<CategoryRecord[]>;
  list(): Promise<CategoryRecord[]>;
};

type CategoryRow = {
  categoryId: number;
  categoryName: string;
  defaultPriority: string;
};

const FIELDS = ['categoryId', 'categoryName', 'defaultPriority'] as const;

function toRecord(row: CategoryRow): CategoryRecord {
  return {
    categoryId: row.categoryId,
    categoryName: String(row.categoryName),
    defaultPriority: String(row.defaultPriority),
  };
}

export function createCategoryRepository(orm = db.orm.public): CategoryRepository {
  return {
    async findById(categoryId) {
      const row = await orm.IssueCategory.where({ categoryId }).select(...FIELDS).first();

      return row === null ? null : toRecord(row);
    },

    async findByIds(categoryIds) {
      if (categoryIds.length === 0) return [];

      const rows = await orm.IssueCategory.select(...FIELDS)
        .where((category) => category.categoryId.in(categoryIds))
        .all();

      return rows.map(toRecord);
    },

    async list() {
      const rows = await orm.IssueCategory.select(...FIELDS).all();

      return rows.map(toRecord);
    },
  };
}
