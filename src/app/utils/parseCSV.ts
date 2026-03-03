// utils/parseCSV.ts
import { parse } from "csv-parse";

export const parseCSVBuffer = <T>(buffer: Buffer): Promise<T[]> => {
  return new Promise((resolve, reject) => {
    parse(buffer, { columns: true, trim: true }, (err, records: T[]) => {
      if (err) reject(err);
      else resolve(records);
    });
  });
};