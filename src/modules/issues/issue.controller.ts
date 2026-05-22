import type { Request, Response } from "express";
import type { ICreateIssueRequest, IIssue } from "./issue.interface";
import { createIssueIntoDB, getAllIssuesFromDB, getIssueByIdFromDB } from "./issue.service";
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
    if (description.length > 150) {
        sendResponse(res, 400, {
            success: false,
            message: "Description should not exceed 150 characters",
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
        const newIssue: IIssue = await createIssueIntoDB({
            title,
            description,
            type,
            reporter_id
        });
        sendResponse(res, 201, {
            success: true,
            message: "Issue created successfully",
            data: newIssue
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
        const issues = await getAllIssuesFromDB(params);

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

export const updateIssueStatus = async (req: Request, res: Response) => { }

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
        const issue = await (Number(id));
        if (!issue) {
            sendResponse(res, 404, {
                success: false,
                message: "Issue not found",
                error: "Not found"
            });
            return;
        }

    } catch (error) {
        sendResponse(res, 500, {
            success: false,
            message: "Internal server error",
            error: error
        });
    }
}