import { GenericError } from './GenericError';

export class NotFoundError extends GenericError {
    constructor(additionalInfo: string = null) {
        super('Not Found' + (additionalInfo ? `: ${additionalInfo}` : ''), 404);
    }
}
