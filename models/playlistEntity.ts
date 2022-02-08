import { EnginePlaylist, EnginePlaylistEntity, EngineTrack } from "../types";
import { EngineModel } from "./model";
import { CopyWithPartial } from "./types";

export type NewEnginePlaylistEntity = CopyWithPartial<
  EnginePlaylistEntity,
  "id"
>;

export class EnginePlaylistEntityModel extends EngineModel<EnginePlaylistEntity> {
  tableName: string = "PlaylistEntity";

  create(
    data: CopyWithPartial<EnginePlaylistEntity, "id">
  ): EnginePlaylistEntity {
    const statement = this.db.prepare(
      `INSERT INTO PlaylistEntity(${Object.keys(data).join(
        ","
      )}) VALUES (${Object.keys(data)
        .map((k) => `@${k}`)
        .join(",")})`
    );
    statement.run(data);
    const lastInsertId = this.db.prepare("SELECT last_insert_rowid()").get()[
      "last_insert_rowid()"
    ];
    const insertedData = this.db
      .prepare(`SELECT * FROM ${this.tableName} WHERE id = ${lastInsertId}`)
      .get();

    // Find the track currently at the bottom of the list
    const lastSibling = this.getAllWhere(
      "listId = ? AND nextEntityId = ? AND databaseUuid = ?",
      data.listId,
      0,
      this.edb.getUuid()
    )[0];
    // Update the nextEntityId of the last sibling to point to the new playlist entity
    if (lastSibling) {
      lastSibling.nextEntityId = insertedData.id;
      this.update(lastSibling);
    }

    // Set the next playlists nextListId to 0 so that subsequent playlists are added to the bottom of the list corectly
    insertedData.nextEntityId = 0;
    const updatedPlaylistEntity = this.update(insertedData);

    return updatedPlaylistEntity;
  }

  addTrackToPlaylist(
    track: EngineTrack,
    playlist: EnginePlaylist
  ): EnginePlaylistEntity {
    const entity: NewEnginePlaylistEntity = {
      listId: playlist.id,
      trackId: track.id,
      nextEntityId: null,
      databaseUuid: this.edb.getUuid(),
      membershipReference: 0,
    };
    return this.create(entity);
  }
}
