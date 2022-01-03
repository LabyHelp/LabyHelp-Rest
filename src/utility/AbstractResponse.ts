import { ResponseStatus } from './ResponseStatus'
import { Response } from 'express'

export default abstract class AbstractResponse {
  protected readonly status: ResponseStatus

  protected constructor(status: ResponseStatus) {
    this.status = status
  }

  public abstract send(res: Response): AbstractResponse
}
