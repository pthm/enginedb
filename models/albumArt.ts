import sharp from "sharp";
import crypto from "crypto";
import NodeID3 from "node-id3";

import { EngineAlbumArt } from "../types";
import { EngineModel } from "./model";
import { CopyWithPartial } from "./types";

export type NewEngineAlbumArt = CopyWithPartial<EngineAlbumArt, "id">;

export class EngineAlbumArtModel extends EngineModel<EngineAlbumArt> {
  tableName: string = "AlbumArt";

  create(art: NewEngineAlbumArt): EngineAlbumArt {
    const existingArt: EngineAlbumArt = this.db
      .prepare(`SELECT * FROM AlbumArt WHERE hash = ?`)
      .get(art.hash);
    if (existingArt) {
      return existingArt;
    }
    const statement = this.db.prepare(
      `INSERT INTO ${this.tableName}(${Object.keys(art).join(
        ","
      )}) VALUES (${Object.keys(art)
        .map((k) => `@${k}`)
        .join(",")})`
    );
    statement.run(art);
    const lastInsertId = this.db.prepare("SELECT last_insert_rowid()").get()[
      "last_insert_rowid()"
    ];
    const newArt = this.db
      .prepare(`SELECT * FROM AlbumArt WHERE id = ${lastInsertId}`)
      .get();
    return newArt;
  }

  private async newAlbumArtFromSharp(
    image: sharp.Sharp
  ): Promise<NewEngineAlbumArt> {
    const originalImageBuffer = await image.toBuffer();
    var hash = crypto
      .createHash("sha1")
      .update(originalImageBuffer)
      .digest("hex");
    const resizedImageBuffer = await image
      .resize(256, 256, { fit: "cover" })
      .png({
        progressive: false,
        compressionLevel: 9,
        quality: 90,
      })
      .toBuffer();
    return {
      hash: hash,
      albumArt: resizedImageBuffer,
    };
  }

  async newAlbumArtFromBuffer(buffer: Buffer): Promise<NewEngineAlbumArt> {
    const image = sharp(buffer);
    return this.newAlbumArtFromSharp(image);
  }

  async newAlbumArtFromImageFile(path: string): Promise<NewEngineAlbumArt> {
    const image = sharp(path);
    return this.newAlbumArtFromSharp(image);
  }

  async newAlbumArtFromAudioFile(path: string): Promise<NewEngineAlbumArt> {
    const tags = await NodeID3.read(path);
    return this.newAlbumArtFromID3(tags);
  }

  async newAlbumArtFromID3(tags: NodeID3.Tags): Promise<NewEngineAlbumArt> {
    if (tags.image) {
      if (typeof tags.image == "string") {
        const image = sharp(tags.image);
        return this.newAlbumArtFromSharp(image);
      }
      const image = sharp(tags.image.imageBuffer);
      return this.newAlbumArtFromSharp(image);
    }
    return {
      hash: "",
      albumArt: null,
    };
  }
}
