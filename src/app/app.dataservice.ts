import { Injectable, Output, EventEmitter } from '@angular/core';

@Injectable()
export class AppDataService {

    conencted = false;

    @Output() change: EventEmitter<boolean> = new EventEmitter();

    public isConnected(isConnected: boolean) {
        this.conencted = isConnected;
        this.change.emit(this.conencted);
    }
}
