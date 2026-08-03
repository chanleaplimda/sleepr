import { type Logger, NotFoundException } from '@nestjs/common'
import { type Model, type QueryFilter, Types } from 'mongoose'
import type { AbstractDocument } from './abstract.schema'

export abstract class AbstractRepository<TDocument extends AbstractDocument> {
  protected abstract readonly logger: Logger
  constructor(protected readonly model: Model<TDocument>) {}

  async create(document: Omit<TDocument, '_id'>): Promise<TDocument> {
    const createdDocument = new this.model({
      ...document,
      _id: new Types.ObjectId(),
    })
    return (await createdDocument.save()).toJSON()
  }
  async findOne(filterQuery: QueryFilter<TDocument>): Promise<TDocument> {
    const document = await this.model.findOne(filterQuery).lean(true)
    if (!document) {
      this.logger.warn(`Document not found with QueryFilter`, filterQuery)
      throw new NotFoundException('Document was not found')
    }
    return document
  }

  async findOneAndUpdate(
    filterQuery: QueryFilter<TDocument>,
    update: Partial<TDocument>,
  ) {
    const document = await this.model
      .findOneAndUpdate(filterQuery, update, { new: true })
      .lean(true)
    if (!document) {
      this.logger.warn(`Document not found with QueryFilter`, filterQuery)
      throw new NotFoundException('Document was not found')
    }
    return document
  }

  async find(
    filterQuery: QueryFilter<TDocument>,
  ): Promise<QueryFilter<TDocument>[]> {
    return this.model.find(filterQuery).lean(true)
  }
  async deleteOne(filterQuery: QueryFilter<TDocument>) {
    const document = await this.model.deleteOne(filterQuery).lean(true)
    if (!document) {
      this.logger.warn(`Document not found with QueryFilter`, filterQuery)
      throw new NotFoundException('Document was not found')
    }
    return document
  }

  async deleteMany(filterQuery: QueryFilter<TDocument>) {
    const document = await this.model.deleteMany(filterQuery).lean(true)
    if (!document) {
      this.logger.warn(`Document not found with QueryFilter`, filterQuery)
      throw new NotFoundException('Document was not found')
    }
    return document
  }
}
