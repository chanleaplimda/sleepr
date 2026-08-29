import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { AllExceptionsFilter } from './all-exceptions.filter';

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;
  let mockResponse: {
    status: jest.Mock;
    json: jest.Mock;
  };
  let mockHost: ArgumentsHost;

  beforeEach(() => {
    filter = new AllExceptionsFilter();
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockHost = {
      getType: () => 'http',
      switchToHttp: () => ({
        getResponse: () => mockResponse,
        getRequest: () => ({}),
      }),
    } as unknown as ArgumentsHost;
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  it('should format standard HttpException properly', () => {
    const exception = new HttpException('Resource not found', HttpStatus.NOT_FOUND);

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: 'Resource not found',
      error: {
        code: 'NOT_FOUND',
        details: null,
      },
    });
  });

  it('should format validation errors array from ValidationPipe properly', () => {
    const validationErrors = [
      'email must be an email',
      'password must be longer than or equal to 8 characters',
    ];
    const exception = new HttpException(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message: validationErrors,
        error: 'Bad Request',
      },
      HttpStatus.BAD_REQUEST,
    );

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: 'Validation failed',
      error: {
        code: 'VALIDATION_ERROR',
        details: validationErrors,
      },
    });
  });

  it('should format unhandled generic Error safely without leaking stack trace', () => {
    const error = new Error('Database connection failed or crash');

    filter.catch(error, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: 'An unexpected error occurred. Please try again later.',
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        details: null,
      },
    });
  });
});

