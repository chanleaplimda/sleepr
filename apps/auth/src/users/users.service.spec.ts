import { Test, type TestingModule } from '@nestjs/testing'
import { UserRepository } from './users.repository'
import { UsersService } from './users.service'

describe('UsersService', () => {
  let service: UsersService
  let userRepository: UserRepository

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UserRepository,
          useValue: {
            create: jest.fn(),
          },
        },
      ],
    }).compile()

    service = module.get<UsersService>(UsersService)
    userRepository = module.get<UserRepository>(UserRepository)
  })

  test('should be defined', () => {
    expect(service).toBeDefined()
  })

  test('create user', async () => {
    const createUserDto = {
      email: 'test@example.com',
      password: 'password123',
    }
    const expectedUser = { _id: '123', ...createUserDto }
    jest.spyOn(userRepository, 'create').mockResolvedValue(expectedUser as any)

    const user = await service.create(createUserDto)

    expect(userRepository.create).toHaveBeenCalledWith(createUserDto)
    expect(user).toEqual(expectedUser)
  })
})
