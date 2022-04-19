const autoBind = require('auto-bind');
const ClientError = require('../../exceptions/ClientError');

class PlaylistSongActivitiesHandler {
    constructor(service) {
        const { playlistSongActivitiesService, playlistsService } = service;
        this._service = playlistSongActivitiesService;
        this._playlistsService = playlistsService;
        autoBind(this);
    }

    /**
     * This function is used to get all activities by playlist id
     * @param request - the request object
     * @param h - is the response object
     * @returns - the response object
     */
    async getActivitiesByIdPlaylistHandler(request, h) {
        try {
            const { id: credentialId } = request.auth.credentials;
            const { id: playlistId } = request.params;
            await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);
            let activities = null;
            activities = await this._service.getActivitiesByIdPlaylist(playlistId, credentialId);
            return {
                status: 'success',
                data: {
                    playlistId,
                    activities,
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
}

module.exports = PlaylistSongActivitiesHandler;
