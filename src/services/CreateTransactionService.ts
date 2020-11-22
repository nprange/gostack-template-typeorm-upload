import AppError from '../errors/AppError';

import { getCustomRepository, getRepository } from 'typeorm';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

import TransactionsRepository from "../repositories/TransactionsRepository";

interface Request {
  title: string;
  value: number;
  category: string;
  type: 'income' | 'outcome';
}

class CreateTransactionService {
  public async execute({ title, value, category, type }: Request): Promise<Transaction> {
    if (!['outcome', 'income'].includes(type)) {
      throw new AppError('Invalid transaction type.');
    }

    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoryRepository = getRepository(Category);
    const { total } = await transactionsRepository.getBalance();

    if (type == 'outcome'
    && total < value) {
      throw new AppError('You do not have enough balance.');
    }


    let transactionCategory = await categoryRepository.findOne({
      where: {
        title: category,
      },
    });

    if(!transactionCategory) {
      transactionCategory = categoryRepository.create({
        title: category,
      });

      await categoryRepository.save(transactionCategory);
    }

    console.log('sasasas', transactionCategory);

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category: transactionCategory,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
