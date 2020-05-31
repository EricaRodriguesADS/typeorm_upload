import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

enum Type {
  income = 'income',
  outcome = 'outcome',
}

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();

    const income = await transactions
      .filter(transaction => transaction.type === Type.income)
      .reduce((accum, curr) => accum + Number(curr.value), 0);

    const outcome = await transactions
      .filter(transaction => transaction.type === Type.outcome)
      .reduce((accum, curr) => accum + Number(curr.value), 0);

    const total = income - outcome;

    const balance: Balance = { income, outcome, total };

    return balance;
  }
}

export default TransactionsRepository;
