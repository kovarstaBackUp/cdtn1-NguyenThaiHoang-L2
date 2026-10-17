export type IssueCategory = {
  category_id: number;
  category_name: string;
  default_priority: string;
};

export type IssueCategoryList = {
  total: number;
  items: IssueCategory[];
};
