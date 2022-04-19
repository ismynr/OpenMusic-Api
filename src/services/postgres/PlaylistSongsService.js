const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class PlaylistSongsService {
    constructor() {
        this._pool = new Pool();
    }

    /**
     * Add a song to a playlist
     * @param playlistId - playlist_id
     * @param songId - 'song-1'
     * @returns The id of the song in the playlist.
     */
    async addSongsInPlaylist(playlistId, songId) {
        const id = `playlist_songs-${nanoid(16)}`;
        const result = await this._pool.query({
            text: 'INSERT INTO playlist_songs VALUES ($1, $2, $3) RETURNING id',
            values: [id, playlistId, songId],
        });
        if (!result.rows[0].id) {
            throw new InvariantError('Song dalam playlist gagal ditambahkan');
        }
        return result.rows[0].id;
    }

    /**
     * Delete a song from a playlist
     * @param playlistId - the id of the playlist
     * @param songId - the id of the song to be deleted
     */
    async deleteSongsInPlaylist(playlistId, songId) {
        const result = await this._pool.query({
            text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
            values: [playlistId, songId],
        });
        if (!result.rows.length) {
            throw new NotFoundError('Song dalam Playlist gagal dihapus. Id tidak ditemukan');
        }
    }
}

module.exports = PlaylistSongsService;
