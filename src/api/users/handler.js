const autoBind = require('auto-bind');
const ClientError = require('../../exceptions/ClientError');

class UsersHandler {
    constructor(service, validator) {
        this._service = service;
        this._validator = validator;
        autoBind(this);
    }

    /**
     * This function is used to add a user to the database, and it returns a response with a status
     * code of 201 if the user is successfully added, or a response with a status code of 400 if the
     * user is not successfully added.
     * @param h - The hapi request object.
     * @returns The return value of the handler is a response object.
     */
    async postUserHandler({ payload }, h) {
        try {
            this._validator.validateUserPayload(payload);
            const userId = await this._service.addUser(payload);
            const response = h.response({
                status: 'success',
                message: 'User berhasil ditambahkan',
                data: {
                    userId,
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
     * This function is an async function that returns a promise that resolves to an object with a
     * status property and a data property. The data property is an object with a user property. The
     * user property is the result of calling the getUserById function of the service object with
     * the id property of the params property of the request object.
     * @param request - The request object.
     * @param h - is the response object
     * @returns The return value is a function that takes two arguments, request and h.
     */
    async getUserByIdHandler(request, h) {
        try {
            const { id } = request.params;
            const user = await this._service.getUserById(id);
            return {
                status: 'success',
                data: {
                    user,
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

module.exports = UsersHandler;
