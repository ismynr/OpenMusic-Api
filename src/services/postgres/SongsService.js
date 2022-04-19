const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { shortSongs, longSongs } = require('../../utils/mapDBToModel/songs');

class SongsService {
    constructor() {
        this._pool = new Pool();
    }

    /**
     * This function adds a song to the database, and returns the id of the song.
     * @returns The id of the song that was added.
     */
    async addSongs({
        title, year, genre, performer, duration, albumId,
    }) {
        const id = `song-${nanoid(16)}`;
        const result = await this._pool.query({
            text: 'INSERT INTO songs VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
            values: [id, title, year, genre, performer, duration, albumId],
        });
        if (!result.rows[0].id) {
            throw new InvariantError('Album gagal ditambahkan');
        }
        return result.rows[0].id;
    }

    /**
     * It returns a list of songs that match the title and performer parameters.
     * @returns The result of the query is being returned.
     */
    async getSongs({ title = '', performer = '' }) {
        const result = await this._pool.query({
            text: 'SELECT id, title, performer FROM songs WHERE LOWER(title) LIKE LOWER($1) AND LOWER(performer) LIKE LOWER($2)',
            values: [`%${title}%`, `%${performer}%`],
        });
        return result.rows.map(shortSongs);
    }

    /**
     * This function will return a song object with the given id, or throw an error if the song is
     * not found.
     * @param id - The id of the song to be retrieved.
     * @returns The result of the query is being returned.
     */
    async getSongById(id) {
        const result = await this._pool.query({
            text: 'SELECT * FROM songs WHERE id = $1',
            values: [id],
        });
        if (!result.rows.length) {
            throw new NotFoundError('Songs tidak ditemukan');
        }
        return result.rows.map(longSongs)[0];
    }

    /**
     * It takes an albumId as an argument, queries the database for all songs that have that
     * albumId, and returns the result as an array of objects.
     * @param albumId - The id of the album to get the songs for.
     * @returns The result of the query is being returned.
     */
    async getSongsByAlbumId(albumId) {
        const result = await this._pool.query({
            text: 'SELECT * FROM songs WHERE album_id = $1',
            values: [albumId],
        });
        return result.rows.map(longSongs);
    }

    /**
     * It returns all songs that are in a playlist with the given playlistId.
     * @param playlistId - the id of the playlist
     * @returns An array of objects.
     */
    async getSongsByPlaylistId(playlistId) {
        const result = await this._pool.query({
            text: `SELECT songs.id, songs.title, songs.performer FROM songs 
                    LEFT JOIN playlist_songs ON playlist_songs.song_id = songs.id 
                    WHERE playlist_songs.playlist_id = $1`,
            values: [playlistId],
        });
        return result.rows;
    }

    /**
     * This function is used to edit the data of a song by id
     * @param id - the id of the song to be updated
     */
    async editSongById(id, {
        title, year, genre, performer, duration, albumId,
    }) {
        const result = await this._pool.query({
            text: 'UPDATE songs SET title = $1, year = $2, genre = $3, performer = $4, duration = $5, album_id = $6 WHERE id = $7 RETURNING id',
            values: [title, year, genre, performer, duration, albumId, id],
        });
        if (!result.rows.length) {
            throw new NotFoundError('Gagal memperbarui songs. Id tidak ditemukan');
        }
    }

    /**
     * This function is used to delete a song from the database by its id.
     * @param id - The id of the song to be deleted.
     */
    async deleteSongById(id) {
        const result = await this._pool.query({
            text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
            values: [id],
        });
        if (!result.rows.length) {
            throw new NotFoundError('Songs gagal dihapus. Id tidak ditemukan');
        }
    }
}

module.exports = SongsService;
