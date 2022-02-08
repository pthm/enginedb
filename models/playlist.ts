import { EnginePlaylist, EnginePlaylistEntity, EngineTrack } from "../types";
import { EngineModel } from "./model";
import { CopyWithPartial, PartialExcept } from "./types";

export type NewEnginePlaylist = CopyWithPartial<EnginePlaylist, "id">;

export class EnginePlaylistModel extends EngineModel<EnginePlaylist> {
  tableName: string = "Playlist";

  getTracks(playlist: PartialExcept<EnginePlaylist, "id">): Array<EngineTrack> {
    const rows = <Array<EngineTrack>>(
      this.db
        .prepare(
          `SELECT * FROM Track WHERE id IN (SELECT trackId FROM PlaylistEntity WHERE listId = ${playlist.id})`
        )
        .all()
    );
    return rows;
  }

  create(data: CopyWithPartial<EnginePlaylist, "id">): EnginePlaylist {
    const statement = this.db.prepare(
      `INSERT INTO ${this.tableName}(${Object.keys(data).join(
        ","
      )}) VALUES (${Object.keys(data)
        .map((k) => `@${k}`)
        .join(",")})`
    );
    if (data.lastEditTime instanceof Date) {
      const time = data.lastEditTime;
      data.lastEditTime = `${time.getUTCFullYear()}-${time.getUTCMonth()}-${time.getUTCDate()} ${time.getUTCHours()}:${time.getUTCMinutes()}:${time.getUTCSeconds()}`;
    }
    statement.run(data);
    const lastInsertId = this.db.prepare("SELECT last_insert_rowid()").get()[
      "last_insert_rowid()"
    ];
    const insertedData = this.db
      .prepare(`SELECT * FROM ${this.tableName} WHERE id = ${lastInsertId}`)
      .get();

    // Find the playlist currently at the bottom of the list at the correct depth
    const lastSibling = this.getAllWhere(
      "parentListId = ? AND nextListId = ?",
      insertedData.parentListId,
      0
    )[0];
    // Update the nextListId of the last sibling to point to the new playlist
    if (lastSibling) {
      lastSibling.nextListId = insertedData.id;
      this.update(lastSibling);
    }

    // Set the next playlists nextListId to 0 so that subsequent playlists are added to the bottom of the list corectly
    insertedData.nextListId = 0;
    const updatedPlaylist = this.update(insertedData);

    return updatedPlaylist;
  }

  delete(data: PartialExcept<EnginePlaylist, "id">): void {
    const playlist = this.getOneByID(data.id);
    const previousSibling = this.getAllWhere(
      "parentListId = ? AND nextListId = ?",
      playlist.parentListId,
      playlist.id
    )[0];

    const statement = this.db.prepare(
      `DELETE FROM ${this.tableName} WHERE id = ${data.id}`
    );
    statement.run();

    // Make the playlist that references the deleted playlist's nextListId point to the deleted playlist's nextListId
    if (previousSibling) {
      previousSibling.nextListId = playlist.nextListId;
      this.update(previousSibling);
    }
  }

  newPlaylistWithTitle(
    title: string,
    parent?: EnginePlaylist
  ): NewEnginePlaylist {
    return {
      title: title,
      parentListId: parent ? parent.id : 0,
      nextListId: null,
      isPersisted: 1,
      lastEditTime: new Date(),
      isExplicitlyExported: 0,
    };
  }
}
