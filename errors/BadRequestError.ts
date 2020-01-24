import { GenericError } from './GenericError';

export class BadRequestError extends GenericError {
    constructor(additionalInfo: string = null) {
        super('Bad Request' + (additionalInfo ? `: ${additionalInfo}` : ''), 400);
    }
}
