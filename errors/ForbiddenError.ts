import { GenericError } from './GenericError';

export class ForbiddenError extends GenericError {
    constructor(additionalInfo: string = null) {
        super('Forbidden' + (additionalInfo ? `: ${additionalInfo}` : ''), 403);
    }
}
