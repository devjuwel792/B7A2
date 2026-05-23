type IssueStatus = "open" | "closed";
type IssueType = "bug" | "feature_request";

export interface IIssue {
    id: number;
    title: string;
    description: string;
    status: IssueStatus;
    type: IssueType;
    created_at: Date;
    updated_at: Date;
    reporter: {
        id: number;
        name: string;
        role: string;
    } | null;
}


export interface IIssueRequest {
    title: string;
    description: string;
    type: IssueType;
    reporter_id: number;
}