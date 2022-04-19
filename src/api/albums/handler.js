const autoBind = require('auto-bind');
const ClientError = require('../../exceptions/ClientError');

class AlbumsHandler {
    constructor(service, validator) {
        const { albumsService, songsService } = service;
        this._service = albumsService;
        this._songsService = songsService;
        this._validator = validator;
        autoBind(this);
    }

    /**
     * This function is used to add an album to the database.
     * @param h - The hapi request object.
     * @returns The response object is being returned.
     */
    async postAlbumHandler({ payload }, h) {
        try {
            this._validator.validateAlbumPayload(payload);
            const albumId = await this._service.addAlbums(payload);
            const response = h.response({
                status: 'success',
                message: 'Album berhasil ditambahkan',
                data: {
                    albumId,
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
     * This function is used to get an album by its id, and if the album is found, it will also get
     * the songs that belong to that album.
     * @param request - The request object.
     * @param h - The response toolkit.
     * @returns The return value is an object with the following properties:
     */
    async getAlbumByIdHandler(request, h) {
        try {
            const { id } = request.params;
            const album = await this._service.getAlbumById(id);
            const songs = await this._songsService.getSongsByAlbumId(id);
            album.songs = songs;
            // try {
            //     const songs = await this._songsService.getSongsByAlbumId(id);
            //     album.songs = songs;
            // } catch (error) {
            //     // no action
            // }
            return {
                status: 'success',
                data: {
                    album,
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
     * This function is used to update an album by id, and it will return a success message if the
     * album is updated successfully, or it will return a fail message if the album is not updated
     * successfully, or it will return an error message if there is an error on the server.
     * @param request - The request object.
     * @param h - is the response object
     * @returns The return value is a response object.
     */
    async putAlbumByIdHandler(request, h) {
        try {
            this._validator.validateAlbumPayload(request.payload);
            const { id } = request.params;
            await this._service.editAlbumById(id, request.payload);
            return {
                status: 'success',
                message: 'Album berhasil diperbarui',
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
     * This function is used to delete an album by its id.
     * @param request - The request object.
     * @param h - The response toolkit.
     * @returns The return value of the handler is a response object.
     */
    async deleteAlbumByIdHandler(request, h) {
        try {
            const { id } = request.params;
            await this._service.deleteAlbumById(id);
            return {
                status: 'success',
                message: 'Album berhasil dihapus',
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

module.exports = AlbumsHandler;
