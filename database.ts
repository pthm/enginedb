import BetterSqlite3, { Database } from "better-sqlite3";
import fs from "fs";
import path from "path";
import { EngineTrackModel } from "./models/track";
import { EnginePlaylistModel } from "./models/playlist";
import { EnginePlaylistEntityModel } from "./models/playlistEntity";
import { EngineAlbumArtModel } from "./models/albumArt";
import { EngineInformationModel } from "./models/information";

export interface EngineDBOptions {
  ignoreVersionErrors?: boolean;
}

const engineDefaultOptions: EngineDBOptions = {
  ignoreVersionErrors: false,
};

export class EngineDatabase {
  dbPath: string;
  options: EngineDBOptions;
  db: Database;

  private uuidCache: string;

  constructor(dbFilePath: string, options?: EngineDBOptions) {
    if (!fs.existsSync(dbFilePath))
      throw new Error("No file at path: " + dbFilePath);
    this.dbPath = path.resolve(dbFilePath);
    this.options = {
      ...engineDefaultOptions,
      ...options,
    };
    this.db = new BetterSqlite3(this.dbPath, {
      verbose: console.log,
      fileMustExist: true,
    });
    this.Information.checkVersion();
  }

  get Track(): EngineTrackModel {
    return new EngineTrackModel(this, this.options);
  }

  get Playlist(): EnginePlaylistModel {
    return new EnginePlaylistModel(this, this.options);
  }

  get PlaylistEntity(): EnginePlaylistEntityModel {
    return new EnginePlaylistEntityModel(this, this.options);
  }

  get AlbumArt(): EngineAlbumArtModel {
    return new EngineAlbumArtModel(this, this.options);
  }

  get Information(): EngineInformationModel {
    return new EngineInformationModel(this, this.options);
  }

  getRelativePath(toPath: string): string {
    // Engine library paths are always relative to the Database2 folder and in POSIX format
    const engineLibraryPath = path.resolve(this.dbPath, "../");
    const inputPath = path.resolve(toPath);
    const relativePath = path.relative(engineLibraryPath, inputPath);
    const normalised = path.normalize(relativePath);
    const posixPath = normalised.split(path.sep).join(path.posix.sep);
    return posixPath;
  }

  getUuid(): string {
    if (!this.uuidCache) {
      const uuid = this.Information.getDatabaseUuid();
      this.uuidCache = uuid;
    }
    return this.uuidCache;
  }
}
