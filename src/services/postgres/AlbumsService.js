const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { albums } = require('../../utils/mapDBToModel/albums');

class AlbumsService {
    constructor() {
        this._pool = new Pool();
    }

    /**
     * This function adds an album to the database, and returns the id of the album that was added.
     * @returns The id of the album that was added.
     */
    async addAlbums({ name, year }) {
        const id = `album-${nanoid(16)}`;
        const result = await this._pool.query({
            text: 'INSERT INTO albums VALUES ($1, $2, $3) RETURNING id',
            values: [id, name, year],
        });
        if (!result.rows[0].id) {
            throw new InvariantError('Album gagal ditambahkan');
        }
        return result.rows[0].id;
    }

    /**
     * This function returns an album by its id, or throws an error if the album is not found.
     * @param id - The id of the album to retrieve.
     */
    async getAlbumById(id) {
        const result = await this._pool.query({
            text: 'SELECT * FROM albums WHERE id = $1',
            values: [id],
        });
        if (!result.rows.length) {
            throw new NotFoundError('Albums tidak ditemukan');
        }
        return result.rows.map(albums)[0];
    }

    /**
     * This function is used to update the album data by id
     * @param id - The id of the album to update.
     */
    async editAlbumById(id, { name, year }) {
        const result = await this._pool.query({
            text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id',
            values: [name, year, id],
        });
        if (!result.rows.length) {
            throw new NotFoundError('Gagal memperbarui albums. Id tidak ditemukan');
        }
    }

    /**
     * Delete an album by id, if the album doesn't exist, throw an error
     * @param id - The id of the album to delete.
     */
    async deleteAlbumById(id) {
        const result = await this._pool.query({
            text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
            values: [id],
        });
        if (!result.rows.length) {
            throw new NotFoundError('Albums gagal dihapus. Id tidak ditemukan');
        }
    }
}

module.exports = AlbumsService;
