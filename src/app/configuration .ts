import { Injectable } from '@angular/core';

@Injectable()
export class Configuration {
     public Server = 'https://172.168.1.57:1234';
   // public Server = 'http://localhost:62778';
    public ApiUrl = '/api/';
    public ServerWithApiUrl = this.Server + this.ApiUrl;
}
