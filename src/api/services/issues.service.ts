import { sql } from "../../db/db";
import type { Issue, IssueStatus, IssueType, RUser } from "../../types";

class IssueService {
  // Create a new issue
  async createIssue(data: {
    title: string;
    description: string;
    type: IssueType;
    reporter_id: number;
  }) {
    const { title, description, type, reporter_id } = data;

    const result = await sql`
      INSERT INTO issues (title, description, type, reporter_id)
      VALUES (${title}, ${description}, ${type}, ${reporter_id})
      RETURNING id, title, description, type, status, reporter_id, created_at, updated_at
    `;

    return result[0] as Issue;
  }

  // Get all issues with filtering and sorting
  async getAllIssues(filters?: {
    sort?: "newest" | "oldest";
    type?: IssueType;
    status?: IssueStatus;
  }) {
    try {
      // Start with base query
      let issues: Issue[] = [];

      // Build WHERE clause conditions
      if (filters?.type && filters?.status) {
        issues = await sql`
          SELECT id, title, description, type, status, reporter_id, created_at, updated_at 
          FROM issues 
          WHERE type = ${filters.type} AND status = ${filters.status}
          ORDER BY created_at ${filters?.sort === "oldest" ? sql`ASC` : sql`DESC`}
        `;
      } else if (filters?.type) {
        issues = await sql`
          SELECT id, title, description, type, status, reporter_id, created_at, updated_at 
          FROM issues 
          WHERE type = ${filters.type}
          ORDER BY created_at ${filters?.sort === "oldest" ? sql`ASC` : sql`DESC`}
        `;
      } else if (filters?.status) {
        issues = await sql`
          SELECT id, title, description, type, status, reporter_id, created_at, updated_at 
          FROM issues 
          WHERE status = ${filters.status}
          ORDER BY created_at ${filters?.sort === "oldest" ? sql`ASC` : sql`DESC`}
        `;
      } else {
        issues = await sql`
          SELECT id, title, description, type, status, reporter_id, created_at, updated_at 
          FROM issues 
          ORDER BY created_at ${filters?.sort === "oldest" ? sql`ASC` : sql`DESC`}
        `;
      }

      // Ensure issues is an array
      const issuesArray = Array.isArray(issues) ? issues : [];

      // Fetch reporter details for each issue
      const issuesWithReporters = await Promise.all(
        issuesArray.map(async (issue: Issue) => {
          const reporterResult = await sql`
            SELECT id, name, email, role FROM users WHERE id = ${issue.reporter_id}
          `;
          const reporter = reporterResult[0] as RUser & { id: number };
          return {
            id: issue.id,
            title: issue.title,
            description: issue.description,
            type: issue.type,
            status: issue.status,
            reporter: {
              id: reporter.id,
              name: reporter.name,
              role: reporter.role,
            },
            created_at: issue.created_at,
            updated_at: issue.updated_at,
          };
        })
      );

      return issuesWithReporters;
    } catch (error) {
      console.error("Error fetching issues:", error);
      return [];
    }
  }

  // Get single issue by ID
  async getIssueById(id: number) {
    const result = await sql`
      SELECT id, title, description, type, status, reporter_id, created_at, updated_at
      FROM issues WHERE id = ${id}
    `;

    if (!result.length) {
      return null;
    }

    const issue = result[0] as Issue;

    // Fetch reporter details
    const reporterResult = await sql`
      SELECT id, name, email, role FROM users WHERE id = ${issue.reporter_id}
    `;

    const reporter = reporterResult[0] as RUser & { id: number };

    return {
      id: issue.id,
      title: issue.title,
      description: issue.description,
      type: issue.type,
      status: issue.status,
      reporter: {
        id: reporter.id,
        name: reporter.name,
        role: reporter.role,
      },
      created_at: issue.created_at,
      updated_at: issue.updated_at,
    };
  }

  // Update issue (title, description, type, and status)
  async updateIssue(
    id: number,
    data: {
      title?: string;
      description?: string;
      type?: IssueType;
      status?: IssueStatus;
    }
  ) {
    try {
      let result: Issue[] = [];

      // Handle all possible combinations of updates
      if (data.title !== undefined && data.description !== undefined && data.type !== undefined && data.status !== undefined) {
        result = await sql`
          UPDATE issues 
          SET title = ${data.title}, description = ${data.description}, type = ${data.type}, status = ${data.status}, updated_at = NOW()
          WHERE id = ${id}
          RETURNING id, title, description, type, status, reporter_id, created_at, updated_at
        `;
      } else if (data.title !== undefined && data.description !== undefined && data.type !== undefined) {
        result = await sql`
          UPDATE issues 
          SET title = ${data.title}, description = ${data.description}, type = ${data.type}, updated_at = NOW()
          WHERE id = ${id}
          RETURNING id, title, description, type, status, reporter_id, created_at, updated_at
        `;
      } else if (data.title !== undefined && data.description !== undefined && data.status !== undefined) {
        result = await sql`
          UPDATE issues 
          SET title = ${data.title}, description = ${data.description}, status = ${data.status}, updated_at = NOW()
          WHERE id = ${id}
          RETURNING id, title, description, type, status, reporter_id, created_at, updated_at
        `;
      } else if (data.title !== undefined && data.type !== undefined && data.status !== undefined) {
        result = await sql`
          UPDATE issues 
          SET title = ${data.title}, type = ${data.type}, status = ${data.status}, updated_at = NOW()
          WHERE id = ${id}
          RETURNING id, title, description, type, status, reporter_id, created_at, updated_at
        `;
      } else if (data.description !== undefined && data.type !== undefined && data.status !== undefined) {
        result = await sql`
          UPDATE issues 
          SET description = ${data.description}, type = ${data.type}, status = ${data.status}, updated_at = NOW()
          WHERE id = ${id}
          RETURNING id, title, description, type, status, reporter_id, created_at, updated_at
        `;
      } else if (data.title !== undefined && data.description !== undefined) {
        result = await sql`
          UPDATE issues 
          SET title = ${data.title}, description = ${data.description}, updated_at = NOW()
          WHERE id = ${id}
          RETURNING id, title, description, type, status, reporter_id, created_at, updated_at
        `;
      } else if (data.title !== undefined && data.type !== undefined) {
        result = await sql`
          UPDATE issues 
          SET title = ${data.title}, type = ${data.type}, updated_at = NOW()
          WHERE id = ${id}
          RETURNING id, title, description, type, status, reporter_id, created_at, updated_at
        `;
      } else if (data.title !== undefined && data.status !== undefined) {
        result = await sql`
          UPDATE issues 
          SET title = ${data.title}, status = ${data.status}, updated_at = NOW()
          WHERE id = ${id}
          RETURNING id, title, description, type, status, reporter_id, created_at, updated_at
        `;
      } else if (data.description !== undefined && data.type !== undefined) {
        result = await sql`
          UPDATE issues 
          SET description = ${data.description}, type = ${data.type}, updated_at = NOW()
          WHERE id = ${id}
          RETURNING id, title, description, type, status, reporter_id, created_at, updated_at
        `;
      } else if (data.description !== undefined && data.status !== undefined) {
        result = await sql`
          UPDATE issues 
          SET description = ${data.description}, status = ${data.status}, updated_at = NOW()
          WHERE id = ${id}
          RETURNING id, title, description, type, status, reporter_id, created_at, updated_at
        `;
      } else if (data.type !== undefined && data.status !== undefined) {
        result = await sql`
          UPDATE issues 
          SET type = ${data.type}, status = ${data.status}, updated_at = NOW()
          WHERE id = ${id}
          RETURNING id, title, description, type, status, reporter_id, created_at, updated_at
        `;
      } else if (data.title !== undefined) {
        result = await sql`
          UPDATE issues 
          SET title = ${data.title}, updated_at = NOW()
          WHERE id = ${id}
          RETURNING id, title, description, type, status, reporter_id, created_at, updated_at
        `;
      } else if (data.description !== undefined) {
        result = await sql`
          UPDATE issues 
          SET description = ${data.description}, updated_at = NOW()
          WHERE id = ${id}
          RETURNING id, title, description, type, status, reporter_id, created_at, updated_at
        `;
      } else if (data.type !== undefined) {
        result = await sql`
          UPDATE issues 
          SET type = ${data.type}, updated_at = NOW()
          WHERE id = ${id}
          RETURNING id, title, description, type, status, reporter_id, created_at, updated_at
        `;
      } else if (data.status !== undefined) {
        result = await sql`
          UPDATE issues 
          SET status = ${data.status}, updated_at = NOW()
          WHERE id = ${id}
          RETURNING id, title, description, type, status, reporter_id, created_at, updated_at
        `;
      } else {
        return null;
      }

      if (result && result.length > 0) {
        return result[0] as Issue;
      }
      return null;
    } catch (error) {
      console.error("Error updating issue:", error);
      throw error;
    }
  }

  // Delete issue
  async deleteIssue(id: number) {
    const result = await sql`
      DELETE FROM issues WHERE id = ${id}
      RETURNING id
    `;

    return result.length > 0;
  }

  // Get issue by ID without reporter details (for permission checks)
  async getIssueByIdRaw(id: number) {
    const result = await sql`
      SELECT id, title, description, type, status, reporter_id, created_at, updated_at
      FROM issues WHERE id = ${id}
    `;

    return result.length > 0 ? (result[0] as Issue) : null;
  }
}

export default new IssueService();
