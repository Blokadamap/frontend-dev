/* eslint-disable @typescript-eslint/no-explicit-any */
export interface FilterItem {
    id: number;
    name: string;
}

export interface TagCreate {
    name: string;
}

export interface HTTPValidationError {
    detail?: ValidationError[];
}

export interface ValidationError {
    loc: (string | number)[];
    msg: string;
    type: string;
    input?: any;
    ctx?: Record<string, any>;
}
