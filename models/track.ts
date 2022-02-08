import NodeID3 from "node-id3";
import fs from "fs";
import path from "path";
import util from "util";
import { EngineTrack } from "../types";
import { EngineModel } from "./model";
import { CopyWithPartial } from "./types";
import { val } from "./helpers";

export type NewEngineTrack = CopyWithPartial<EngineTrack, "id">;

export class EngineTrackModel extends EngineModel<EngineTrack> {
  tableName: string = "Track";

  async createTrackFromFile(filePath): Promise<EngineTrack> {
    const newAlbumArt = await this.edb.AlbumArt.newAlbumArtFromAudioFile(
      filePath
    );
    const albumArt = this.edb.AlbumArt.create(newAlbumArt);
    const newTrack = await this.newTrackFromFile(filePath);
    newTrack.albumArtId = albumArt.id;
    const track = await this.create(newTrack);
    return track;
  }

  async newTrackFromFile(filePath: string): Promise<NewEngineTrack> {
    const tags = await NodeID3.Promise.read(filePath);
    const stats = await util.promisify(fs.stat)(filePath);
    let newTrack: NewEngineTrack = {
      ...this.newTrackFromID3(tags),
      path: this.edb.getRelativePath(path.resolve(filePath)),
      fileBytes: stats.size,
      filename: path.basename(filePath),
      fileType: path.extname(filePath).replace(".", ""),
    };
    return newTrack;
  }

  private newTrackFromID3(tags: NodeID3.Tags): NewEngineTrack {
    return {
      playOrder: val(() => parseInt(tags.trackNumber), null),
      length: val(() => parseInt(tags.length), null),
      bpm: val(() => parseInt(tags.bpm), null),
      year: val(() => parseInt(tags.year), null),
      path: null,
      filename: tags.originalFilename,
      bitrate: null,
      bpmAnalyzed: null,
      albumArtId: null,
      fileBytes: null,
      title: tags.title,
      artist: tags.artist,
      album: tags.album,
      genre: tags.genre,
      comment: val(() => tags.comment.text, null),
      label: tags.publisher,
      composer: tags.composer,
      remixer: tags.remixArtist,
      key: null,
      rating: val(() => Math.round(tags.popularimeter.rating / (255 / 5)), 0),
      albumArt: null,
      timeLastPlayed: null,
      isPlayed: null,
      fileType: tags.fileType,
      isAnalyzed: null,
      dateCreated: new Date(tags.date),
      dateAdded: new Date(),
      isAvailable: null,
      isMetadataOfPackedTrackChanged: null,
      isPerfomanceDataOfPackedTrackChanged: null,
      playedIndicator: null,
      isMetadataImported: null,
      pdbImportKey: null,
      streamingSource: null,
      uri: null,
      isBeatGridLocked: null,
      originDatabaseUuid: this.edb.getUuid(),
      originTrackId: null,
      trackData: null,
      overviewWaveFormData: null,
      beatData: null,
      quickCues: null,
      loops: null,
      thirdPartySourceId: null,
      streamingFlags: null,
      explicitLyrics: null,
    };
  }
}
