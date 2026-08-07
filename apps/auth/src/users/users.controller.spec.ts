import { Test, type TestingModule } from '@nestjs/testing'
import { UserDocument } from './models/user.schema'
import { UsersController } from './users.controller'
import { UsersService } from './users.service'

describe('UsersController', () => {
  let controller: UsersController
  let usersService: UsersService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
          },
        },
      ],
    }).compile()

    controller = module.get<UsersController>(UsersController)
    usersService = module.get<UsersService>(UsersService)
  })

  test('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('create', () => {
    test('should create a user', async () => {
      const createUserDto = {
        email: 'test@example.com',
        password: 'password123',
      }
      const createdUser = { _id: '1', ...createUserDto }
      jest
        .spyOn(usersService, 'create')
        .mockResolvedValue(createdUser as unknown as UserDocument)
      const result = await controller.create(createUserDto)
      expect(usersService.create).toHaveBeenCalledWith(createUserDto)
      expect(result).toEqual(createdUser)
    })
  })
})
