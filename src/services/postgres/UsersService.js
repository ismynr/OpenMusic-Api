const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const bcrypt = require('bcrypt');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthenticationError = require('../../exceptions/AuthenticationError');

class UsersService {
    constructor() {
        this._pool = new Pool();
    }

    /**
     * The function will add a new user to the database, but only if the username is not already
     * taken.
     * @returns The id of the user that was added.
     */
    async addUser({ username, password, fullname }) {
        await this.verifyNewUsername(username);
        const id = `user-${nanoid(16)}`;
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await this._pool.query({
            text: 'INSERT INTO users VALUES($1, $2, $3, $4) RETURNING id',
            values: [id, username, hashedPassword, fullname],
        });
        if (!result.rows.length) {
            throw new InvariantError('User gagal ditambahkan');
        }
        return result.rows[0].id;
    }

    /**
     * It returns the user with the given id, or throws an error if the user doesn't exist.
     * @param userId - The user ID to look up.
     * @returns The result of the query is being returned.
     */
    async getUserById(userId) {
        const result = await this._pool.query({
            text: 'SELECT id, username, fullname FROM users WHERE id = $1',
            values: [userId],
        });
        if (!result.rows.length) {
            throw new NotFoundError('User tidak ditemukan');
        }
        return result.rows[0];
    }

    /**
     * If the username is already taken, throw an error.
     * @param username - string
     */
    async verifyNewUsername(username) {
        const result = await this._pool.query({
            text: 'SELECT username FROM users WHERE username = $1',
            values: [username],
        });
        if (result.rows.length > 0) {
            throw new InvariantError('Gagal menambahkan user. Username sudah digunakan.');
        }
    }

    /**
     * If the username and password match, return the user's id.
     * @param username - The username of the user who is trying to log in.
     * @param password - The password that the user entered.
     * @returns The id of the user.
     */
    async verifyUserCredential(username, password) {
        const result = await this._pool.query({
            text: 'SELECT id, password FROM users WHERE username = $1',
            values: [username],
        });
        if (!result.rows.length) {
            throw new AuthenticationError('Kredensial yang Anda berikan salah');
        }
        const { id, password: hashedPassword } = result.rows[0];
        const match = await bcrypt.compare(password, hashedPassword);
        if (!match) {
            throw new AuthenticationError('Kredensial yang Anda berikan salah');
        }
        return id;
    }
}

module.exports = UsersService;
