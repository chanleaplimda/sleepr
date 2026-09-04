import { CallHandler, ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { of } from 'rxjs'
import { ResponseInterceptor } from './response.interceptor'

describe('ResponseInterceptor', () => {
  let interceptor: ResponseInterceptor<unknown>
  let reflector: Reflector

  beforeEach(() => {
    reflector = new Reflector()
    interceptor = new ResponseInterceptor(reflector)
  })

  it('should be defined', () => {
    expect(interceptor).toBeDefined()
  })

  it('should wrap successful GET response in standard envelope', (done) => {
    const mockContext = {
      getType: () => 'http',
      getHandler: () => jest.fn(),
      getClass: () => jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({ method: 'GET' }),
      }),
    } as unknown as ExecutionContext

    const mockCallHandler: CallHandler = {
      handle: () => of({ id: '123', name: 'Test' }),
    }

    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined)

    interceptor.intercept(mockContext, mockCallHandler).subscribe((result) => {
      expect(result).toEqual({
        success: true,
        message: 'Resource retrieved successfully',
        data: { id: '123', name: 'Test' },
      })
      done()
    })
  })

  it('should resolve Promise emitted in stream before creating envelope', (done) => {
    const mockContext = {
      getType: () => 'http',
      getHandler: () => jest.fn(),
      getClass: () => jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({ method: 'POST' }),
      }),
    } as unknown as ExecutionContext

    const mockCallHandler: CallHandler = {
      handle: () => of(Promise.resolve({ _id: 'res-1', invoiceId: 'inv-123' })),
    }

    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined)

    interceptor.intercept(mockContext, mockCallHandler).subscribe((result) => {
      expect(result).toEqual({
        success: true,
        message: 'Resource created successfully',
        data: { _id: 'res-1', invoiceId: 'inv-123' },
      })
      done()
    })
  })

  it('should use custom message if set via decorator', (done) => {
    const mockContext = {
      getType: () => 'http',
      getHandler: () => jest.fn(),
      getClass: () => jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({ method: 'POST' }),
      }),
    } as unknown as ExecutionContext

    const mockCallHandler: CallHandler = {
      handle: () => of({ id: '123' }),
    }

    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockImplementation((key: unknown) => {
        if (key === 'response_message') return 'Custom created message'
        return undefined
      })

    interceptor.intercept(mockContext, mockCallHandler).subscribe((result) => {
      expect(result).toEqual({
        success: true,
        message: 'Custom created message',
        data: { id: '123' },
      })
      done()
    })
  })

  it('should set data to null for DELETE operations', (done) => {
    const mockContext = {
      getType: () => 'http',
      getHandler: () => jest.fn(),
      getClass: () => jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({ method: 'DELETE' }),
      }),
    } as unknown as ExecutionContext

    const mockCallHandler: CallHandler = {
      handle: () => of({ acknowledged: true, deletedCount: 1 }),
    }

    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined)

    interceptor.intercept(mockContext, mockCallHandler).subscribe((result) => {
      expect(result).toEqual({
        success: true,
        message: 'Resource deleted successfully',
        data: null,
      })
      done()
    })
  })

  it('should bypass non-http execution contexts (e.g. microservices/rpc)', (done) => {
    const rawData = { rpcPayload: true }
    const mockContext = {
      getType: () => 'rpc',
    } as unknown as ExecutionContext

    const mockCallHandler: CallHandler = {
      handle: () => of(rawData),
    }

    interceptor.intercept(mockContext, mockCallHandler).subscribe((result) => {
      expect(result).toBe(rawData)
      done()
    })
  })
})
