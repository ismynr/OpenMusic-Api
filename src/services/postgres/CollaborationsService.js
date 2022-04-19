const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');

class CollaborationsService {
    constructor() {
        this._pool = new Pool();
    }

    /**
     * This function is used to add a collaboration between a playlist and a user.
     * @param playlistId - the id of the playlist that the user wants to collaborate on
     * @param userId - the user id of the user who is requesting to collaborate
     * @returns The id of the collaboration that was just added.
     */
    async addCollaboration(playlistId, userId) {
        const id = `collab-${nanoid(16)}`;
        const query = {
            text: 'INSERT INTO collaborations VALUES($1, $2, $3) RETURNING id',
            values: [id, playlistId, userId],
        };
        const result = await this._pool.query(query);
        if (!result.rows.length) {
            throw new InvariantError('Kolaborasi gagal ditambahkan');
        }
        return result.rows[0].id;
    }

    /**
     * Delete a collaboration from the database
     * @param playlistId - the id of the playlist
     * @param userId - the user id of the user who is trying to delete the collaboration
     */
    async deleteCollaboration(playlistId, userId) {
        const query = {
            text: 'DELETE FROM collaborations WHERE playlist_id = $1 AND user_id = $2 RETURNING id',
            values: [playlistId, userId],
        };
        const result = await this._pool.query(query);
        if (!result.rows.length) {
            throw new InvariantError('Kolaborasi gagal dihapus');
        }
    }

    /**
     * "verifyCollaborator" is a function that is used to verify the collaboration between the user
     * and the playlist
     * @param playlistId - the id of the playlist
     * @param userId - The user id of the user who is trying to access the playlist
     */
    async verifyCollaborator(playlistId, userId) {
        const query = {
            text: 'SELECT * FROM collaborations WHERE playlist_id = $1 AND user_id = $2',
            values: [playlistId, userId],
        };
        const result = await this._pool.query(query);
        if (!result.rows.length) {
            throw new InvariantError('Kolaborasi gagal diverifikasi');
        }
    }
}

module.exports = CollaborationsService;
