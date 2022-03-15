import {IncomingSocketNames} from "../socket-messages";

export type FileReloadEventPayload = {
    url?: string;
    ext: string;
    path: string;
    basename: string;
    event: string;
    type: 'inject' | 'reload';
}

export type FileReloadEvent = [IncomingSocketNames.FileReload, FileReloadEventPayload];
