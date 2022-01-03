import AbstractResponse from './AbstractResponse'
import { ResponseStatus } from './ResponseStatus'
import { Response } from 'express'
import ResponseCode from './ResponseCode'

export default class FailResponse extends AbstractResponse {
  private readonly data: any

  constructor(data?: any) {
    super(ResponseStatus.FAIL)
    this.data = data
  }

  send(res: Response): FailResponse {
    res.status(ResponseCode.BAD_REQUEST).send(this)
    return this
  }

  public toString = (): string => {
    return JSON.stringify(this)
  }
}
