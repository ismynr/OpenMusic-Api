const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');

class AuthenticationsService {
    constructor() {
        this._pool = new Pool();
    }

    /**
     * It takes a token, and inserts it into the database.
     * @param token - The token to be added to the database.
     */
    async addRefreshToken(token) {
        await this._pool.query({
            text: 'INSERT INTO authentications VALUES($1)',
            values: [token],
        });
    }

    /**
     * If the token is not found in the database, throw an error.
     * @param token - The refresh token to verify.
     */
    async verifyRefreshToken(token) {
        const result = await this._pool.query({
            text: 'SELECT token FROM authentications WHERE token = $1',
            values: [token],
        });
        if (!result.rows.length) {
            throw new InvariantError('Refresh token tidak valid');
        }
    }

    /**
     * It deletes a refresh token from the database.
     * @param token - The refresh token to delete.
     */
    async deleteRefreshToken(token) {
        await this._pool.query({
            text: 'DELETE FROM authentications WHERE token = $1',
            values: [token],
        });
    }
}

module.exports = AuthenticationsService;
