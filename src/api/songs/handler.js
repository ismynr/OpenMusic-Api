const autoBind = require('auto-bind');
const ClientError = require('../../exceptions/ClientError');

class SongsHandler {
    constructor(service, validator) {
        this._service = service;
        this._validator = validator;
        autoBind(this);
    }

    /**
     * This function is used to add a song to the database.
     * @param request - the request object
     * @param h - the response toolkit
     * @returns The response object is being returned.
     */
    async postSongHandler(request, h) {
        try {
            this._validator.validateSongPayload(request.payload);
            const {
                title, year, genre, performer, duration, albumId,
            } = request.payload;
            const songId = await this._service.addSongs({
                title, year, genre, performer, duration, albumId,
            });
            const response = h.response({
                status: 'success',
                message: 'Song berhasil ditambahkan',
                data: {
                    songId,
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
     * It's a function that returns the songs if success without invariant error
     * @param request - The request object.
     * @param h - The hapi response toolkit object.
     * @returns The return value is an object
     */
    async getSongsHandler(request, h) {
        try {
            const { query } = request;
            const songs = await this._service.getSongs(query);
            return {
                status: 'success',
                data: {
                    songs,
                },
            };
        } catch (error) {
            const response = h.response({
                status: 'error',
                message: 'Maaf, terjadi kegagaln pada server kami.',
            });
            response.code(500);
            console.log(error);
            return response;
        }
    }

    /**
     * This function is used to get a song by its id, and if the song is not found, it will return a
     * 404 error, and if there is an error in the server, it will return a 500 error.
     * @param request - The request object.
     * @param h - is the response object
     * @returns The return value is a response object.
     */
    async getSongByIdHandler(request, h) {
        try {
            const { id } = request.params;
            const song = await this._service.getSongById(id);
            return {
                status: 'success',
                data: {
                    song,
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
                message: 'Maaf, terjadi kegagaln pada server kami.',
            });
            response.code(500);
            console.log(error);
            return response;
        }
    }

    /**
     * This function is used to update a song by id, and it will return a success message if the
     * song is updated successfully, or it will return a fail message if the song is not updated
     * successfully, or it will return an error message if there is an error on the server.
     * @param request - The request object.
     * @param h - is the response object
     * @returns The return value is a response object.
     */
    async putSongByIdHandler(request, h) {
        try {
            this._validator.validateSongPayload(request.payload);
            const { id } = request.params;
            await this._service.editSongById(id, request.payload);
            return {
                status: 'success',
                message: 'Song berhasil diperbarui',
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
                message: 'Maaf, terjadi kegagal pada server kami.',
            });
            response.code(500);
            console.log(error);
            return response;
        }
    }

    /**
     * This function is used to delete a song by its id.
     * @param request - The request object.
     * @param h - is the response object
     * @returns The return value of the handler is a response object.
     */
    async deleteSongByIdHandler(request, h) {
        try {
            const { id } = request.params;
            await this._service.deleteSongById(id);
            return {
                status: 'success',
                message: 'Song berhasil dihapus',
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
                status: 'fail',
                message: 'Maaf, terjadi kegagalan pada server kami.',
            });
            response.code(500);
            console.log(error);
            return response;
        }
    }
}

module.exports = SongsHandler;
