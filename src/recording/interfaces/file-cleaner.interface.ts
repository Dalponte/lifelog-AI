export interface CleanResult {
  deletedFiles: string[];
  totalSize: number;
}

export interface IFileCleaner {
  listFiles(dirPath: string): Promise<{ name: string; size: number }[]>;
  deleteFiles(dirPath: string): Promise<CleanResult>;
}

export const IFileCleaner = Symbol('IFileCleaner');
