import { GenericError } from './GenericError';

export class UnathorizedError extends GenericError {
    constructor(additionalInfo: string = null) {
        super('Unathorized' + (additionalInfo ? `: ${additionalInfo}` : ''), 401);
    }
}
