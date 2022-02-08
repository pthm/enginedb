type CopyWithPartial<T, K extends keyof T> = Omit<T, K> & Partial<T>;

export interface EngineTrack {
  id: number;
  playOrder?: number;
  length: number;
  bpm?: number;
  year?: number;
  path: string;
  filename?: string;
  bitrate?: number;
  bpmAnalyzed?: number;
  albumArtId: number;
  fileBytes?: number;
  title?: string;
  artist?: string;
  album?: string;
  genre?: string;
  comment?: string;
  label?: string;
  composer?: string;
  remixer?: string;
  key?: number;
  rating?: number;
  albumArt?: string;
  timeLastPlayed?: Date;
  isPlayed?: boolean;
  fileType?: string;
  isAnalyzed?: boolean;
  dateCreated?: Date;
  dateAdded?: Date;
  isAvailable?: boolean;
  isMetadataOfPackedTrackChanged?: boolean;
  isPerfomanceDataOfPackedTrackChanged?: boolean;
  playedIndicator?: number;
  isMetadataImported?: boolean;
  pdbImportKey?: number;
  streamingSource?: string;
  uri?: string;
  isBeatGridLocked?: boolean;
  originDatabaseUuid?: string;
  originTrackId?: number;
  trackData?: BinaryData;
  overviewWaveFormData?: BinaryData;
  beatData?: BinaryData;
  quickCues?: BinaryData;
  loops?: BinaryData;
  thirdPartySourceId?: number;
  streamingFlags?: number;
  explicitLyrics?: boolean;
}

export interface EnginePlaylist {
  id: number;
  title: string;
  parentListId: number;
  isPersisted: boolean | number;
  nextListId: number;
  lastEditTime?: Date | string;
  isExplicitlyExported?: boolean | number;
}

export interface EnginePlaylistEntity {
  id: number;
  listId: number;
  trackId: number;
  databaseUuid?: string;
  nextEntityId: number;
  membershipReference?: number;
}

export interface EngineInformation {
  id: number;
  uuid: string;
  schemaVersionMajor: number;
  schemaVersionMinor: number;
  schemaVersionPatch: number;
  currentPlayedIndicator: number;
  lastRekordBoxLibraryImportReadCounter: number;
}

export interface EngineAlbumArt {
  id: number;
  hash: string;
  albumArt: BinaryData;
}
