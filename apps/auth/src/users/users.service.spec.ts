import {
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import * as bcrypt from 'bcryptjs'
import { UserRepository } from './users.repository'
import { UsersService } from './users.service'

jest.mock('bcryptjs')

describe('UsersService', () => {
  let service: UsersService
  let userRepository: UserRepository

  const mockUser = {
    _id: 'user_123',
    email: 'test@example.com',
    password: 'hashedPassword123',
  }

  const createUserDto = {
    email: 'test@example.com',
    password: 'Password123!',
  }

  const mockUserRepository = {
    create: jest.fn(),
    findOne: jest.fn(),
  }

  beforeEach(async () => {
    jest.clearAllMocks()

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
      ],
    }).compile()

    service = module.get<UsersService>(UsersService)
    userRepository = module.get<UserRepository>(UserRepository)
  })

  describe('Initialization', () => {
    it('should be defined', () => {
      expect(service).toBeDefined()
      expect(userRepository).toBeDefined()
    })
  })

  describe('create', () => {
    it('should successfully create a new user when email is not registered', async () => {
      // 1. Arrange: when checking if user exists, findOne throws NotFoundException
      mockUserRepository.findOne.mockRejectedValue(new NotFoundException())
      ;(bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword123')
      mockUserRepository.create.mockResolvedValue(mockUser)

      // 2. Act
      const result = await service.create(createUserDto)

      // 3. Assert
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        email: createUserDto.email,
      })
      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10)
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        ...createUserDto,
        password: 'hashedPassword123',
      })
      expect(result).toEqual(mockUser)
    })

    it('should throw UnprocessableEntityException if user email already exists', async () => {
      // 1. Arrange: findOne returns an existing user
      mockUserRepository.findOne.mockResolvedValue(mockUser)

      // 2. Act & Assert
      await expect(service.create(createUserDto)).rejects.toThrow(
        UnprocessableEntityException,
      )
      await expect(service.create(createUserDto)).rejects.toThrow(
        'User already exists',
      )

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        email: createUserDto.email,
      })
      expect(bcrypt.hash).not.toHaveBeenCalled()
      expect(mockUserRepository.create).not.toHaveBeenCalled()
    })
  })

  describe('getUser', () => {
    it('should return a user matching the filter', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser)

      const result = await service.getUser({ _id: 'user_123' })

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        _id: 'user_123',
      })
      expect(result).toEqual(mockUser)
    })
  })

  describe('verifyUser', () => {
    it('should return user if credentials are valid', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser)
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)

      const result = await service.verifyUser(
        'test@example.com',
        'Password123!',
      )

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        email: 'test@example.com',
      })
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'Password123!',
        mockUser.password,
      )
      expect(result).toEqual(mockUser)
    })

    it('should throw UnauthorizedException if user is not found', async () => {
      mockUserRepository.findOne.mockRejectedValue(new NotFoundException())

      await expect(
        service.verifyUser('notfound@example.com', 'Password123!'),
      ).rejects.toThrow(UnauthorizedException)
      await expect(
        service.verifyUser('notfound@example.com', 'Password123!'),
      ).rejects.toThrow('Credentials are not valid.')
    })

    it('should throw UnauthorizedException if password does not match', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser)
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(false)

      await expect(
        service.verifyUser('test@example.com', 'WrongPassword'),
      ).rejects.toThrow(UnauthorizedException)
    })
  })
})
