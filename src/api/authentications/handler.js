const autoBind = require('auto-bind');
const ClientError = require('../../exceptions/ClientError');

class AuthenticationsHandler {
    constructor(authenticationsService, usersService, tokenManager, validator) {
        this._authenticationsService = authenticationsService;
        this._usersService = usersService;
        this._tokenManager = tokenManager;
        this._validator = validator;
        autoBind(this);
    }

    /**
     * This function is used to authenticate a user by verifying the user's credential and then
     * generate an access token and a refresh token.
     * @param h - The hapi request object.
     * @returns The response object is being returned.
     */
    async postAuthenticationHandler({ payload }, h) {
        try {
            this._validator.validatePostAuthenticationPayload(payload);
            const { username, password } = payload;
            const id = await this._usersService.verifyUserCredential(username, password);
            const accessToken = this._tokenManager.generateAccessToken({ id });
            const refreshToken = this._tokenManager.generateRefreshToken({ id });
            await this._authenticationsService.addRefreshToken(refreshToken);
            const response = h.response({
                status: 'success',
                message: 'Authentication berhasil ditambahkan',
                data: {
                    accessToken,
                    refreshToken,
                },
            });
            response.code(201);
            return response;
        } catch (error) {
            if (error instanceof ClientError) {
                const response = h.response({
                    status: 'fail',
                    message: error.message,
                });
                response.code(error.statusCode);
                return response;
            }
            // Server ERROR!
            const response = h.response({
                status: 'error',
                message: 'Maaf, terjadi kegagalan pada server kami.',
            });
            response.code(500);
            console.log(error);
            return response;
        }
    }

    /**
     * This function is used to refresh the access token by using the refresh token.
     * @param h - is the response object
     * @returns The response object is being returned.
     */
    async putAuthenticationHandler({ payload }, h) {
        try {
            this._validator.validatePutAuthenticationPayload(payload);
            const { refreshToken } = payload;
            await this._authenticationsService.verifyRefreshToken(refreshToken);
            const { id } = this._tokenManager.verifyRefreshToken(refreshToken);
            const accessToken = this._tokenManager.generateAccessToken({ id });
            return {
                status: 'success',
                message: 'Access Token berhasil diperbarui',
                data: {
                    accessToken,
                },
            };
        } catch (error) {
            if (error instanceof ClientError) {
                const response = h.response({
                    status: 'fail',
                    message: error.message,
                });
                response.code(error.statusCode);
                return response;
            }
            // Server ERROR!
            const response = h.response({
                status: 'error',
                message: 'Maaf, terjadi kegagalan pada server kami.',
            });
            response.code(500);
            console.log(error);
            return response;
        }
    }

    /**
     * This function is used to delete the refresh token from the database.
     * @param h - is the hapi request object
     * @returns The response object is being returned.
     */
    async deleteAuthenticationHandler({ payload }, h) {
        try {
            this._validator.validateDeleteAuthenticationPayload(payload);
            const { refreshToken } = payload;
            await this._authenticationsService.verifyRefreshToken(refreshToken);
            await this._authenticationsService.deleteRefreshToken(refreshToken);
            return {
                status: 'success',
                message: 'Access token berhasil dihapus',
            };
        } catch (error) {
            if (error instanceof ClientError) {
                const response = h.response({
                    status: 'fail',
                    message: error.message,
                });
                response.code(error.statusCode);
                return response;
            }
            // Server ERROR!
            const response = h.response({
                status: 'error',
                message: 'Maaf, terjadi kegagalan pada server kami.',
            });
            response.code(500);
            console.log(error);
            return response;
        }
    }
}

module.exports = AuthenticationsHandler;
