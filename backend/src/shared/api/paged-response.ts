export class PagedResponse<T> {
  constructor(
    public readonly data: T[],
    public readonly page: number,
    public readonly size: number,
    public readonly total: number,
  ) {}
}
