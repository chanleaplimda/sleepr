import { NotFoundException } from '@nestjs/common'
import { type Model, Types } from 'mongoose'
import { AbstractRepository } from './abstract.repository'
import type { AbstractDocument } from './abstract.schema'

interface TestDocument extends AbstractDocument {
  name: string
}

class TestRepository extends AbstractRepository<TestDocument> {
  protected readonly logger = {
    warn: jest.fn(),
    log: jest.fn(),
    error: jest.fn(),
  } as never
}

describe('AbstractRepository', () => {
  let repository: TestRepository
  let model: jest.Mocked<Model<TestDocument>>

  const saveMock = jest.fn()
  let DocumentConstructor: jest.Mock

  beforeEach(() => {
    model = {
      findOne: jest.fn().mockReturnThis(),
      findOneAndUpdate: jest.fn().mockReturnThis(),
      find: jest.fn().mockReturnThis(),
      deleteOne: jest.fn(),
      deleteMany: jest.fn(),
      lean: jest.fn().mockReturnThis(),
    } as unknown as jest.Mocked<Model<TestDocument>>
    // The same mock acts as both the mongoose model (for queries) and the
    // document constructor used inside create(); protected `model` field is
    // set directly via the constructor.
    DocumentConstructor = Object.assign(jest.fn(), model) as never
    model = DocumentConstructor as unknown as jest.Mocked<Model<TestDocument>>
    repository = new TestRepository(model)
    DocumentConstructor.mockImplementation(() => ({ save: saveMock }))
  })

  describe('create', () => {
    it('saves a new document with a generated _id and returns it', async () => {
      const saved = { _id: new Types.ObjectId(), name: 'test' }
      saveMock.mockResolvedValue({ toJSON: () => saved })

      const result = await repository.create({ name: 'test' })

      expect(DocumentConstructor).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'test' }),
      )
      expect(DocumentConstructor.mock.calls[0][0]._id).toBeInstanceOf(
        Types.ObjectId,
      )
      expect(saveMock).toHaveBeenCalled()
      expect(result).toEqual(saved)
    })
  })

  describe('findOne', () => {
    it('returns the lean document when found', async () => {
      const doc = { _id: 'abc', name: 'test' }
      model.findOne.mockReturnValue({ lean: () => Promise.resolve(doc) } as never)

      const result = await repository.findOne({ _id: 'abc' })

      expect(model.findOne).toHaveBeenCalledWith({ _id: 'abc' })
      expect(result).toEqual(doc)
    })

    it('throws NotFoundException when not found', async () => {
      model.findOne.mockReturnValue({ lean: () => Promise.resolve(null) } as never)

      await expect(repository.findOne({ _id: 'abc' })).rejects.toThrow(
        NotFoundException,
      )
    })
  })

  describe('findOneAndUpdate', () => {
    it('returns the updated document', async () => {
      const doc = { _id: 'abc', name: 'updated' }
      model.findOneAndUpdate.mockReturnValue({
        lean: () => Promise.resolve(doc),
      } as never)

      const result = await repository.findOneAndUpdate(
        { _id: 'abc' },
        { name: 'updated' } as never,
      )

      expect(model.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: 'abc' },
        { name: 'updated' },
        { new: true },
      )
      expect(result).toEqual(doc)
    })

    it('throws NotFoundException when not found', async () => {
      model.findOneAndUpdate.mockReturnValue({
        lean: () => Promise.resolve(null),
      } as never)

      await expect(
        repository.findOneAndUpdate({ _id: 'abc' }, { name: 'x' } as never),
      ).rejects.toThrow(NotFoundException)
    })
  })

  describe('find', () => {
    it('returns all matching lean documents', async () => {
      const docs = [{ _id: 'a', name: 'a' }, { _id: 'b', name: 'b' }]
      model.find.mockReturnValue({ lean: () => Promise.resolve(docs) } as never)

      const result = await repository.find({})

      expect(model.find).toHaveBeenCalledWith({})
      expect(result).toEqual(docs)
    })
  })

  describe('deleteOne', () => {
    it('returns the result when a document was deleted', async () => {
      model.deleteOne.mockResolvedValue({ deletedCount: 1 } as never)

      const result = await repository.deleteOne({ _id: 'abc' })

      expect(model.deleteOne).toHaveBeenCalledWith({ _id: 'abc' })
      expect(result).toEqual({ deletedCount: 1 })
    })

    it('throws NotFoundException when nothing was deleted', async () => {
      model.deleteOne.mockResolvedValue({ deletedCount: 0 } as never)

      await expect(repository.deleteOne({ _id: 'abc' })).rejects.toThrow(
        NotFoundException,
      )
    })
  })
})
