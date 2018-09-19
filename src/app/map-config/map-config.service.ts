import 'rxjs/add/operator/map';

import { HttpClient, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Configuration } from '../configuration ';
import { Map } from './map-config.model';

@Injectable()
export class MapService {
    private mapUrl: string;

    constructor(private http: HttpClient, private configService: Configuration) {
        this.mapUrl = configService.ServerWithApiUrl + 'map';
    }
    public getMaps(): Observable<Map[]> {
        return this.http.get<Map[]>(this.mapUrl);
    }
    public addMap(map: Map): Observable<Map> {
        return this.http.post<Map>(this.mapUrl + `/add`, map);
    }

    public addMapform(map: Map, fileToUpload: File): Observable<Map> {
        const formData: FormData = new FormData();
        formData.append('image', fileToUpload, fileToUpload.name);
        formData.append('name', map.name);
        formData.append('description', map.description);
        return this.http.post<Map>(this.mapUrl + `/saveimage`, formData);
    }
    public deleteMap(id: number): Observable<boolean> {
        return this.http.delete<boolean>(this.mapUrl + `/delete?id=${id}`);
    }
    public updateMap(map: Map): Observable<boolean> {
        return this.http.put<boolean>(this.mapUrl + `/update`, map);
    }
    public updateMapform(map: Map, fileToUpload: File): Observable<Map> {
        const formData: FormData = new FormData();
        formData.append('id', map.id.toString());
        formData.append('image', fileToUpload, fileToUpload.name);
        formData.append('name', map.name);
        formData.append('description', map.description);
        return this.http.put<Map>(this.mapUrl + `/updateimage`, formData);
    }
}



