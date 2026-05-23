export const role=["contributor","maintainer"] as const;
export type Role= typeof role[number];

export type User={
    id: number;
    email: string;
    name: string;
    role: Role;
    password: string;
    created_at: Date;
    updated_at: Date;
}
export type RUser= Omit<User,"id"|"created_at"|"updated_at"|"password">;

export const issueTypes = ["bug", "feature_request"] as const;
export type IssueType = typeof issueTypes[number];

export const issueStatuses = [
  "open",
  "in_progress",
  "resolved",
] as const;

export type IssueStatus = typeof issueStatuses[number];

export type Issue = {
  id: number;

  title: string;

  description: string;

  type: IssueType;

  status: IssueStatus;

  reporter_id: number;

  created_at: Date;
  
  updated_at: Date;
};

export type IssueWithReporter = Omit<Issue, 'reporter_id'> & {
  reporter: RUser & { id: number };
};
