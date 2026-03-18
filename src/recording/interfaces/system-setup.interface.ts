export interface SetupResult {
  soxInstalled: boolean;
  soxWasAlreadyInstalled: boolean;
  lifelogDirCreated: boolean;
  lifelogDirAlreadyExisted: boolean;
  lifelogPath: string;
}

export interface ISystemSetup {
  isSoxInstalled(): Promise<boolean>;
  installSox(): Promise<void>;
  isWhisperInstalled(): Promise<boolean>;
  installWhisper(): Promise<void>;
  ensureLifelogDir(): Promise<{ created: boolean; path: string }>;
}

export const ISystemSetup = Symbol('ISystemSetup');
