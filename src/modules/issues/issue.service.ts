import { pool } from "../../db"
import type { IIssueRequest, IIssue } from "./issue.interface"

export const createIssueIntoDB = async (data: IIssueRequest) => {

    const { title, description, type, reporter_id } = data;
    const result = await pool.query(
        `INSERT INTO issues (title, description, type,reporter_id) VALUES ($1, $2, $3, $4) RETURNING *`,
        [title, description, type, reporter_id]
    );
    return { ...result.rows[0] } as IIssue & { reporter_id: string };
}


export const getAllIssuesFromDB = async (params: {
    sort?: "newest" | "oldest";
    type?: string;
    status?: string;
}) => {
    const { sort = "newest", type, status } = params;

    let query = `
    SELECT 
    issues.id ,
    issues.title,
    issues.description,
    issues.status,
    issues.type,
    issues.created_at,
    issues.updated_at,
    (SELECT json_build_object(
        'id', users.id,
        'name',users.name,
        'role', users.role
    ) FROM users WHERE users.id = issues.reporter_id ) as reporter FROM issues
    WHERE 1=1`;
    // JOIN users ON issues.reporter_id = users.id
    let values: any[] = [];

    if (type) {
        query += ` AND issues.type = $1`;
        values.push(type);
    }

    if (status) {
        query += ` AND issues.status = $${values.length + 1}`;
        values.push(status);
    }

    const order = sort === "oldest" ? "ASC" : "DESC";
    query += ` ORDER BY issues.created_at ${order}`;

    const result = await pool.query(
        query,
        values
    );
    return result.rows as IIssue[];
}


export const getIssueByIdFromDB = async (id: number) => {
    const result = await pool.query(
        `SELECT issues.*, (SELECT json_build_object(
            'id', users.id,
            'name', users.name,
            'role', users.role
            )
            FROM users 
            WHERE users.id = issues.reporter_id 
            ) as reporter FROM issues
            WHERE issues.id = $1 `,
        [id]
    );
    return result.rows[0];
}

export const checkIssueOwner = async (issueId: number, userId: number) => {
    const result = await pool.query(
        `SELECT * FROM issues WHERE id = $1 AND reporter_id = $2`,
        [issueId, userId]
    );
    return result.rows.length > 0;
}



export const updateIssueInDB = async (id: number, data: Partial<IIssueRequest>) => {
    const { title, description, type } = data;
    const result = await pool.query(
        `UPDATE issues 
        SET title = COALESCE($1, title),
        description = COALESCE($2, description),
        type = COALESCE($3, type),
        updated_at = NOW()
        WHERE id = $4 RETURNING *`,
        [title, description, type, id]
    )
    return result.rows[0];


}

export const deleteIssueFromDB = async (id: number) => {
    await pool.query(
        ` DELETE FROM issues WHERE id = $1`,
        [id]
    );
}