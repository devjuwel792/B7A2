import type { Request, Response } from "express";
import type { ICreateIssueRequest, IIssue } from "./issue.interface";
import { createIssueIntoDB, deleteIssueFromDB, getAllIssuesFromDB, getIssueByIdFromDB } from "./issue.service";
import sendResponse from "../../utility/sendResponse";



export const createIssue = async (req: Request, res: Response) => {

    const { title, description, type } = req.body as ICreateIssueRequest;
    const reporter_id = req?.user?.id as number;

    if (!title || !description || !type) {
        sendResponse(res, 400, {
            success: false,
            message: "Title, description and type are required",
            error: "Validation error"
        });
        return;
    }

    if (title.length > 150) {
        sendResponse(res, 400, {
            success: false,
            message: "Title should not exceed 150 characters",
            error: "Validation error"
        });
        return;
    }
    if (description.length < 20) {
        sendResponse(res, 400, {
            success: false,
            message: "Description should be at least 20 characters long",
            error: "Validation error"
        });
        return;
    }

    if (type !== "bug" && type !== "feature_request") {
        sendResponse(res, 400, {
            success: false,
            message: "Invalid issue type",
            error: "Validation error"
        });
        return;
    }
    try {
        const newIssue = await createIssueIntoDB({
            title,
            description,
            type,
            reporter_id
        });
        sendResponse(res, 201, {
            success: true,
            message: "Issue created successfully",
            data: {
                id: newIssue.id,
                title: newIssue.title,
                description: newIssue.description,
                type: newIssue.type,
                status: newIssue.status,
                reporter_id: newIssue.reporter_id,
                created_at: "2026-01-20T10:30:00Z",
                updated_at: "2026-01-20T10:30:00Z"
            }
        });
    } catch (error) {
        sendResponse(res, 500, {
            success: false,
            message: "Internal server error",
            error: error
        });
        return;
    }
};

export const getIssues = async (req: Request, res: Response) => {
    const params = req.query as {
        sort?: "newest" | "oldest";
        type?: string;
        status?: string;
    };

    try {
        const issues: IIssue[] = await getAllIssuesFromDB(params);

        sendResponse(res, 200, {
            success: true,
            data: issues
        });
    } catch (error) {
        sendResponse(res, 500, {
            success: false,
            message: "Internal server error",
            error: error
        });
        return;
    }
}


export const getIssueById = async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id || isNaN(Number(id))) {
        sendResponse(res, 400, {
            success: false,
            message: "Invalid issue ID",
            error: "Validation error"
        });
        return;
    }
    try {
        const issue = await getIssueByIdFromDB(Number(id));
        sendResponse(res, 200, {
            success: true,
            data: issue
        });
    } catch (error) {
        sendResponse(res, 500, {
            success: false,
            message: "Internal server error",
            error: error
        });
        return;
    }
}

export const updateIssueStatus = async (req: Request, res: Response) => {}

export const deleteIssue = async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id || isNaN(Number(id))) {
        sendResponse(res, 400, {
            success: false,
            message: "Invalid issue ID",
            error: "Validation error"
        });
        return;
    }
    try {
        const getIssue = await getIssueByIdFromDB(Number(id));
        if (!getIssue) {
            sendResponse(res, 404, {
                success: false,
                message: "Issue not found",
                error: "Not found"
            });
            return;
        }
        await deleteIssueFromDB(Number(id));

        sendResponse(res, 200, {
            success: true,
            message: "Issue deleted successfully",
        });

    } catch (error) {
        sendResponse(res, 500, {
            success: false,
            message: "Internal server error",
            error: error
        });
    }
}