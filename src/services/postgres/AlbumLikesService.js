const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');

class AlbumLikesService {
    constructor(cacheService) {
        this._pool = new Pool();
        this._cacheService = cacheService;
    }

    /**
     * This function is used to add a like to an album by a user
     * @param userId - the user's id
     * @param albumId - String
     * @returns The result of the query is being returned.
     */
    async addAlbumLikes(userId, albumId) {
        const id = `user_album_likes-${nanoid(16)}`;
        const result = await this._pool.query({
            text: 'INSERT INTO user_album_likes VALUES ($1, $2, $3) RETURNING id',
            values: [id, userId, albumId],
        });
        if (!result.rows[0].id) {
            throw new InvariantError('Gagal menyukai album');
        }
        // await this._cacheService.delete('openmusic:album-likes');
        return 'Berhasil menyukai album';
    }

    /**
     * This function is used to delete a like an album by user
     * @param userId
     * @param albumId
     * @returns The result of the query is being returned.
     */
    async deleteAlbumLikes(userId, albumId) {
        const result = await this._pool.query({
            text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2 RETURNING id',
            values: [userId, albumId],
        });
        if (!result.rows[0].id) {
            throw new InvariantError('Gagal untuk batal menyukai album');
        }
        // await this._cacheService.delete('openmusic:album-likes');
        return 'Berhasil batal menyukai album';
    }

    /**
     * This function returns a boolean value that indicates whether or not a user has already liked
     * an album.
     * @param userId - The user's id
     * @param albumId - The id of the album that the user is trying to like.
     * @returns The result of the query.
     */
    async albumAlreadyLiked(userId, albumId) {
        const result = await this._pool.query({
            text: 'SELECT id FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
            values: [userId, albumId],
        });
        return result.rows.length;
    }

    /**
     * This function counts the number of likes for a given album id.
     * @param albumId - The id of the album
     * @returns The result of the query.
     */
    async getAlbumLikesByAlbumId(albumId) {
        try {
            // const result = await this._cacheService.get('openmusic:album-likes');
            // return {
            //     dataSource: 'cache',
            //     likes: JSON.parse(result),
            // };
            const result = await this._pool.query({
                text: 'SELECT COUNT(id) AS jumlah FROM user_album_likes WHERE album_id = $1',
                values: [albumId],
            });
            const jumlah = parseInt(result.rows[0].jumlah, 10);
            // await this._cacheService.set('openmusic:album-likes', JSON.stringify(jumlah));
            return {
                dataSource: 'database',
                likes: jumlah,
            };
        } catch (error) {
            const result = await this._pool.query({
                text: 'SELECT COUNT(id) AS jumlah FROM user_album_likes WHERE album_id = $1',
                values: [albumId],
            });
            const jumlah = parseInt(result.rows[0].jumlah, 10);
            // await this._cacheService.set('openmusic:album-likes', JSON.stringify(jumlah));
            return {
                dataSource: 'database',
                likes: jumlah,
            };
        }
    }
}

module.exports = AlbumLikesService;
