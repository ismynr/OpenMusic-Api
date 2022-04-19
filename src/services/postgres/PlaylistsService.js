const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class PlaylistsService {
    constructor(collaborationsService) {
        this._pool = new Pool();
        this._collaborationsService = collaborationsService;
    }

    /**
     * This function adds a playlist to the database, and returns the id of the playlist.
     * @returns The id of the playlist that was just added.
     */
    async addPlaylists({ name, credentialId: owner }) {
        const id = `playlist-${nanoid(16)}`;
        const result = await this._pool.query({
            text: 'INSERT INTO playlists VALUES ($1, $2, $3) RETURNING id',
            values: [id, name, owner],
        });
        if (!result.rows[0].id) {
            throw new InvariantError('Playlist gagal ditambahkan');
        }
        return result.rows[0].id;
    }

    /**
     * This function returns all the playlists that belong to a user.
     * @param owner - the id of the user who owns the playlist
     * @returns An array of objects.
     */
    async getPlaylists(owner) {
        const result = await this._pool.query({
            text: `SELECT playlists.id, playlists.name, users.username FROM playlists 
                    LEFT JOIN users ON users.id = playlists.owner 
                    LEFT JOIN collaborations ON collaborations.playlist_id = playlists.id
                    WHERE playlists.owner = $1 OR collaborations.user_id = $1`,
            values: [owner],
        });
        return result.rows;
    }

    /**
     * This function is used to get the playlist by id
     * @param id - the id of the playlist
     * @returns The result of the query is being returned.
     */
    async getPlaylistsById(id) {
        const result = await this._pool.query({
            text: `SELECT playlists.id, playlists.name, users.username FROM playlists 
                    LEFT JOIN users ON users.id = playlists.owner 
                    WHERE playlists.id = $1`,
            values: [id],
        });
        if (!result.rows.length) {
            throw new NotFoundError('Playlist tidak ditemukan');
        }
        return result.rows[0];
    }

    /**
     * Delete a playlist by id
     * @param id - The id of the playlist to delete.
     */
    async deletePlaylistById(id) {
        const result = await this._pool.query({
            text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
            values: [id],
        });
        if (!result.rows.length) {
            throw new NotFoundError('Playlists gagal dihapus. Id tidak ditemukan');
        }
    }

    /**
     * "If the playlist is not found, throw a NotFoundError. If the playlist is found but the owner
     * is not the same as the owner passed in, throw an AuthorizationError."
     * @param id - The id of the playlist
     * @param owner - the owner of the playlist
     */
    async verifyPlaylistOwner(id, owner) {
        const result = await this._pool.query({
            text: 'SELECT * FROM playlists WHERE id = $1',
            values: [id],
        });
        if (!result.rows.length) {
            throw new NotFoundError('Playlist tidak ditemukan');
        }
        const playlist = result.rows[0];
        if (playlist.owner !== owner) {
            throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
        }
    }

    /**
     * If the user is not the owner of the playlist, then check if the user is a collaborator on the
     * playlist. If the user is not a collaborator, then throw an error.
     * @param playlistId - The id of the playlist
     * @param userId - The userId of the user who is trying to access the playlist
     */
    async verifyPlaylistAccess(playlistId, userId) {
        try {
            await this.verifyPlaylistOwner(playlistId, userId);
        } catch (error) {
            if (error instanceof NotFoundError) {
                throw error;
            }
            try {
                await this._collaborationsService.verifyCollaborator(playlistId, userId);
            } catch {
                throw error;
            }
        }
    }
}

module.exports = PlaylistsService;
