import type { Request, Response } from "express";
import issueService from "../services/issues.service";
import { sendResponse } from "../../utils/sendResponse";
import type { IssueStatus, IssueType } from "../../types";

// Create Issue (Authenticated: contributor, maintainer)
export const createIssue = async (req: Request, res: Response) => {
  try {
    const { title, description, type } = req.body;

    if (!title || !description || !type) {
      sendResponse(
        res,
        { message: "Title, description, and type are required", errors: "Missing required fields" },
        400
      );
      return;
    }

    if (typeof title !== "string" || title.length > 150) {
      sendResponse(
        res,
        { message: "Title must be maximum 150 characters", errors: "Invalid title" },
        400
      );
      return;
    }

    if (typeof description !== "string" || description.length < 20) {
      sendResponse(
        res,
        { message: "Description must be minimum 20 characters", errors: "Invalid description" },
        400
      );
      return;
    }

    if (!["bug", "feature_request"].includes(type)) {
      sendResponse(
        res,
        { message: "Type must be either 'bug' or 'feature_request'", errors: "Invalid type" },
        400
      );
      return;
    }

    const issue = await issueService.createIssue({
      title,
      description,
      type: type as IssueType,
      reporter_id: req.user.id,
    });

    sendResponse(
      res,
      { message: "Issue created successfully", data: issue },
      201
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    sendResponse(res, { message, errors: message }, 500);
  }
};

// Get All Issues (Public)
export const getAllIssues = async (req: Request, res: Response) => {
  try {
    const { sort = "newest", type, status } = req.query;

    if (sort !== "newest" && sort !== "oldest") {
      sendResponse(
        res,
        { message: "Sort must be either 'newest' or 'oldest'", errors: "Invalid sort parameter" },
        400
      );
      return;
    }

    const filters = {
      sort: (sort as "newest" | "oldest") || "newest",
      ...(type !== undefined && { type: type as IssueType }),
      ...(status !== undefined && { status: status as IssueStatus }),
    };

    const issues = await issueService.getAllIssues(filters);

    sendResponse(res, { message: "Issues retrived successfully", data: issues }, 200);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    sendResponse(res, { message, errors: message }, 500);
  }
};

// Get Single Issue (Public)
export const getIssueById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      sendResponse(
        res,
        { message: "Invalid issue ID", errors: "Invalid ID format" },
        400
      );
      return;
    }

    const issue = await issueService.getIssueById(Number(id));

    if (!issue) {
      sendResponse(
        res,
        { message: "Issue not found", errors: "Issue does not exist" },
        404
      );
      return;
    }

    sendResponse(res, { message: "Issue retrived successfully", data: issue }, 200);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    sendResponse(res, { message, errors: message }, 500);
  }
};

// Update Issue (Authenticated)
export const updateIssue = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, type, status } = req.body;

    if (!id || isNaN(Number(id))) {
      sendResponse(
        res,
        { message: "Invalid issue ID", errors: "Invalid ID format" },
        400
      );
      return;
    }

    const currentIssue = await issueService.getIssueByIdRaw(Number(id));

    if (!currentIssue) {
      sendResponse(
        res,
        { message: "Issue not found", errors: "Issue does not exist" },
        404
      );
      return;
    }

    const isMaintainer = req.user.role === "maintainer";
    const isReporter = req.user.id === currentIssue.reporter_id;

    if (!isMaintainer) {
      if (!isReporter) {
        sendResponse(
          res,
          { message: "Forbidden - You can only edit your own issues", errors: "Permission denied" },
          403
        );
        return;
      }

      if (currentIssue.status !== "open") {
        sendResponse(
          res,
          { message: "Forbidden - You can only edit open issues", errors: "Issue is not open" },
          403
        );
        return;
      }

      if (status) {
        sendResponse(
          res,
          { message: "Forbidden - Only maintainers can change issue status", errors: "Permission denied" },
          403
        );
        return;
      }
    }

    if (title !== undefined) {
      if (typeof title !== "string" || title.length > 150) {
        sendResponse(
          res,
          { message: "Title must be maximum 150 characters", errors: "Invalid title" },
          400
        );
        return;
      }
    }

    if (description !== undefined) {
      if (typeof description !== "string" || description.length < 20) {
        sendResponse(
          res,
          { message: "Description must be minimum 20 characters", errors: "Invalid description" },
          400
        );
        return;
      }
    }

    if (type !== undefined) {
      if (!["bug", "feature_request"].includes(type)) {
        sendResponse(
          res,
          { message: "Type must be either 'bug' or 'feature_request'", errors: "Invalid type" },
          400
        );
        return;
      }
    }

    if (status !== undefined) {
      if (!["open", "in_progress", "resolved"].includes(status)) {
        sendResponse(
          res,
          { message: "Status must be one of: open, in_progress, resolved", errors: "Invalid status" },
          400
        );
        return;
      }
    }

    const updatedIssue = await issueService.updateIssue(Number(id), {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(type !== undefined && { type: type as IssueType }),
      ...(status !== undefined && { status: status as IssueStatus }),
    });

    if (!updatedIssue) {
      sendResponse(
        res,
        { message: "Failed to update issue", errors: "Database error" },
        500
      );
      return;
    }

    sendResponse(
      res,
      { message: "Issue updated successfully", data: updatedIssue },
      200
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    sendResponse(res, { message, errors: message }, 500);
  }
};

// Delete Issue (Maintainer only)
export const deleteIssue = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      sendResponse(
        res,
        { message: "Invalid issue ID", errors: "Invalid ID format" },
        400
      );
      return;
    }

    const issue = await issueService.getIssueByIdRaw(Number(id));

    if (!issue) {
      sendResponse(
        res,
        { message: "Issue not found", errors: "Issue does not exist" },
        404
      );
      return;
    }

    const deleted = await issueService.deleteIssue(Number(id));

    if (!deleted) {
      sendResponse(
        res,
        { message: "Failed to delete issue", errors: "Database error" },
        500
      );
      return;
    }

    sendResponse(res, { message: "Issue deleted successfully" }, 200);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    sendResponse(res, { message, errors: message }, 500);
  }
};