import AbstractResponse from './AbstractResponse'
import {Response} from 'express'
import {ResponseStatus} from './ResponseStatus'
import ResponseCode from './ResponseCode'

export default class ErrorResponse extends AbstractResponse {
    private readonly code: number
    private readonly message: string

    private readonly data: any

    constructor(code: ResponseCode, message: string, data?: any)
    constructor(code: number, message: string, data?: any) {
        super(ResponseStatus.ERROR)
        this.message = message
        this.code = code
        this.data = data
    }

    send(res: Response): ErrorResponse {
        res.status(this.code).send(this)
        return this;
    }

    public toString = (): string => {
        return JSON.stringify(this)
    }
}
