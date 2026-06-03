export class ApiResponse<T> {
  constructor(
    public readonly success: boolean,
    public readonly message: string,
    public readonly data: T,
  ) {}

  static success<T>(data: T, message = 'Success'): ApiResponse<T> {
    return new ApiResponse(true, message, data);
  }
}

// EFC: Esta clase es un wrapper para las respuestas de la API,
// para tener un formato consistente en todas las respuestas, similar a responseEntity de Java Spring Booy
