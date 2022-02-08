import "jest";
import NodeID3 from "node-id3";
import sharp from "sharp";
import { EngineDatabase } from "./database";

const testTracks = [
  "./test_data/salute/salute - Wahala Edits Vol. 1 - 01 Frank Ocean - White Ferrari (salute Edit).mp3",
  "./test_data/salute/salute - Wahala Edits Vol. 1 - 02 T2 - Heartbroken (feat. Jodie) (salute Edit).mp3",
  "./test_data/salute/salute - Wahala Edits Vol. 1 - 03 SZA - Good Days (salute Edit).mp3",
  "./test_data/salute/salute - Wahala Edits Vol. 1 - 04 Claudia Telles - And I Love Her (salute Edit).mp3",
  "./test_data/salute/salute - Wahala Edits Vol. 1 - 05 Erykah Badu - Cajmere - Didn't Cha Know x Percolator (salute Edit).mp3",
];

describe("database", () => {
  let db: EngineDatabase;
  beforeAll(() => {
    db = new EngineDatabase("./test_data/m.db");
  });

  it("should throw and error when no database exists", async () => {
    const t = () => {
      new EngineDatabase("/a/pth/that/does/not/exist");
    };
    expect(t).toThrow();
  });

  it("should return tracks", async () => {
    console.log(db.Track.getAll());
    expect(db.Track.getAll().length).toBeDefined();
  });

  it("should return playlists", async () => {
    expect(db.Playlist.getAll().length).toBeDefined();
  });

  it("should be able to create a track", async () => {
    const filePath = testTracks[0];
    const insertedTrack = await db.Track.createTrackFromFile(filePath);
    expect(insertedTrack.id).toBeGreaterThan(0);
    db.Track.delete(insertedTrack);
  });

  it("should be able to make album art", async () => {
    const tags = await NodeID3.Promise.read("C:/ferrari.mp3");
    const art = await db.AlbumArt.newAlbumArtFromID3(tags);
    expect(art.albumArt).toBeDefined();
    expect(art.hash).toBeDefined();
  });

  it("should return existing album art when it already exists", async () => {
    const image = await sharp({
      create: {
        width: 256,
        height: 256,
        background: "red",
        channels: 3,
      },
    })
      .png()
      .toBuffer();
    const art = await db.AlbumArt.newAlbumArtFromBuffer(image);
    const art1 = db.AlbumArt.create(art);
    const art2 = db.AlbumArt.create(art);
    expect(art1.id).toEqual(art2.id);
    db.AlbumArt.delete(art1);
  });

  it("can get a track by id", async () => {
    const filePath = testTracks[1];
    const insertedTrack = await db.Track.createTrackFromFile(filePath);
    const track = db.Track.getOneByID(insertedTrack.id);
    expect(track.id).toBeDefined();
    expect(track.path).toEqual(insertedTrack.path);
    db.Track.delete(insertedTrack);
  });

  it("can create a playlist", async () => {
    const playlist = db.Playlist.newPlaylistWithTitle("another test playlist");
    const insertedPlaylist = db.Playlist.create(playlist);

    expect(insertedPlaylist.id).toBeGreaterThan(0);
    expect(insertedPlaylist.title).toEqual("another test playlist");
    expect(insertedPlaylist.nextListId).toEqual(0);

    db.Playlist.delete(insertedPlaylist);
  });

  it("can update playlist pointers", async () => {
    const playlist = db.Playlist.newPlaylistWithTitle("playlist one");
    const insertedPlaylist = db.Playlist.create(playlist);

    const playlist2 = db.Playlist.newPlaylistWithTitle("playlist two");
    const insertedPlaylist2 = db.Playlist.create(playlist2);

    const allPlaylists = db.Playlist.getAll();
    expect(
      allPlaylists.filter((p) => p.nextListId == insertedPlaylist2.id).length
    ).toEqual(1);
    // Check a playlist is now pointing at the newly created one

    db.Playlist.delete(insertedPlaylist);
    db.Playlist.delete(insertedPlaylist2);
  });

  it("can add a track to playlist", async () => {
    const playlist = db.Playlist.newPlaylistWithTitle("Test Bangers Playlist");
    const insertedPlaylist = db.Playlist.create(playlist);

    const filePath = testTracks[2];
    const track = await db.Track.createTrackFromFile(filePath);
    const filePath2 = testTracks[3];
    const track2 = await db.Track.createTrackFromFile(filePath2);

    const playlistEntity = db.PlaylistEntity.addTrackToPlaylist(
      track,
      insertedPlaylist
    );
    expect(playlistEntity.id).toBeGreaterThan(0);

    const playlistEntity2 = db.PlaylistEntity.addTrackToPlaylist(
      track2,
      insertedPlaylist
    );
    expect(playlistEntity2.id).toBeGreaterThan(0);

    db.Playlist.delete(insertedPlaylist);
    db.Track.delete(track);
    db.Track.delete(track2);
  });
});
