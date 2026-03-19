export interface SetupResult {
  soxInstalled: boolean;
  soxWasAlreadyInstalled: boolean;
  lifelogDirCreated: boolean;
  lifelogDirAlreadyExisted: boolean;
  lifelogPath: string;
}

export abstract class ISystemSetup {
  abstract isSoxInstalled(): Promise<boolean>;
  abstract installSox(): Promise<void>;
  abstract isWhisperInstalled(): Promise<boolean>;
  abstract installWhisper(): Promise<void>;
  abstract ensureLifelogDir(): Promise<{ created: boolean; path: string }>;
}
