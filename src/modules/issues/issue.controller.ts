import type { Request, Response } from "express";
import type { IIssueRequest, IIssue } from "./issue.interface";
import { checkIssueOwner, createIssueIntoDB, deleteIssueFromDB, getAllIssuesFromDB, getIssueByIdFromDB, updateIssueInDB } from "./issue.service";
import sendResponse from "../../utility/sendResponse";
import { StatusCodes } from "http-status-codes";



export const createIssue = async (req: Request, res: Response) => {

    const { title, description, type } = req.body as IIssueRequest;
    const reporter_id = req?.user?.id as number;

    if (!title || !description || !type) {
        sendResponse(res, StatusCodes.BAD_REQUEST, {
            success: false,
            message: "Title, description and type are required",
            error: "Validation error"
        });
        return;
    }

    if (title.length > 150) {
        sendResponse(res, StatusCodes.BAD_REQUEST, {
            success: false,
            message: "Title should not exceed 150 characters",
            error: "Validation error"
        });
        return;
    }
    if (description.length < 20) {
        sendResponse(res, StatusCodes.BAD_REQUEST, {
            success: false,
            message: "Description should be at least 20 characters long",
            error: "Validation error"
        });
        return;
    }

    if (type !== "bug" && type !== "feature_request") {
        sendResponse(res, StatusCodes.BAD_REQUEST, {
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
        sendResponse(res, StatusCodes.CREATED, {
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
        sendResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, {
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

        sendResponse(res, StatusCodes.OK, {
            success: true,
            data: issues
        });
    } catch (error) {
        sendResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, {
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
        sendResponse(res, StatusCodes.BAD_REQUEST, {
            success: false,
            message: "Invalid issue ID",
            error: "Validation error"
        });
        return;
    }
    try {
        const issue = await getIssueByIdFromDB(Number(id));
        sendResponse(res, StatusCodes.OK, {
            success: true,
            data: issue
        });
    } catch (error) {
        sendResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, {
            success: false,
            message: "Internal server error",
            error: error
        });
        return;
    }
}

export const updateIssue = async (req: Request, res: Response) => {
    const { id } = req.params;

    const { title, description, type } = req.body as Partial<IIssueRequest>;
    const user = req?.user;

    if (!id || isNaN(Number(id))) {
        sendResponse(res, StatusCodes.BAD_REQUEST, {
            success: false,
            message: "Invalid issue ID",
            error: "Validation error"
        });
    }
    try {
        if (user?.role !== "maintainer") {
            const isOwner = await checkIssueOwner(Number(id), user?.id as number);
            if (!isOwner) {
                sendResponse(res, StatusCodes.FORBIDDEN, {
                    success: false,
                    message: "You are not authorized to update this issue",
                    error: "Authorization error"
                });
            }
        }

        const updatedIssue = await updateIssueInDB(Number(id), {
            title: title,
            description: description,
            type: type
        } as Partial<IIssueRequest>);

        if (!updatedIssue) {
            sendResponse(res, StatusCodes.NOT_FOUND, {
                success: false,
                message: "Issue not found",
                error: "Not found"
            });
            return;
        }

        sendResponse(res, StatusCodes.OK, {
            success: true,
            message: "Issue updated successfully",
            data: {
                id: updatedIssue.id,
                title: updatedIssue.title,
                description: updatedIssue.description,
                type: updatedIssue.type,
                status: updatedIssue.status,
                reporter_id: updatedIssue.reporter_id,
                created_at: updatedIssue.created_at,
                updated_at: updatedIssue.updated_at
            }
        });
    }
    catch (error) {
    }
}

export const deleteIssue = async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id || isNaN(Number(id))) {
        sendResponse(res, StatusCodes.BAD_REQUEST, {
            success: false,
            message: "Invalid issue ID",
            error: "Validation error"
        });
        return;
    }
    try {
        const getIssue = await getIssueByIdFromDB(Number(id));
        if (!getIssue) {
            sendResponse(res, StatusCodes.NOT_FOUND, {
                success: false,
                message: "Issue not found",
                error: "Not found"
            });
            return;
        }
        await deleteIssueFromDB(Number(id));

        sendResponse(res, StatusCodes.OK, {
            success: true,
            message: "Issue deleted successfully",
        });

    } catch (error) {
        sendResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, {
            success: false,
            message: "Internal server error",
            error: error
        });
    }
}