import csv from 'csv-parse';
import fs from 'fs';

import Transaction from '../models/Transaction';
import CreateTransactionService from './CreateTransactionService';

interface Request {
  csvFilename: string;
}

interface TransactionCSV {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute({ csvFilename }: Request): Promise<Transaction[]> {
    const transactionsCSV: TransactionCSV[] = [];
    const transactions: Transaction[] = [];

    const createTransaction = new CreateTransactionService();
    const readStream = fs.createReadStream(csvFilename);
    const pipe = readStream.pipe(
      csv({
        from_line: 2,
      }),
    );

    pipe.on('data', row => {
      const [title, type, value, category] = row.map((cell: string) =>
        cell.trim(),
      );

      if (!title || !type || !value) return;

      transactionsCSV.push({
        title,
        type,
        value,
        category,
      });
    });

    await new Promise(resolve => pipe.on('end', resolve));

    for (const item of transactionsCSV) {
      // eslint-disable-next-line no-await-in-loop
      const transaction = await createTransaction.execute(item);

      transactions.push(transaction);
    }

    return transactions;
  }
}

export default ImportTransactionsService;
