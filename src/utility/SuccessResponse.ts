import AbstractResponse from './AbstractResponse'
import { Response } from 'express'
import { ResponseStatus } from './ResponseStatus'
import ResponseCode from './ResponseCode'

export default class SuccessResponse extends AbstractResponse {
  private readonly data: any

  constructor(data?: any) {
    super(ResponseStatus.SUCCESS)
    this.data = data
  }

  send(res: Response): SuccessResponse {
    res.status(ResponseCode.OK).send(this)
    return this
  }

  public toString = (): string => {
    return JSON.stringify(this)
  }
}
