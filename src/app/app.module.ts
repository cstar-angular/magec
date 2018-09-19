import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatTabsModule, MatSlideToggleModule, MatDialogModule, MatSliderModule } from '@angular/material';
import { TabsModule } from 'ngx-bootstrap';
import { ColorPickerModule } from 'ngx-color-picker';

import { TreeModule } from 'angular-tree-component';

import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';

import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Configuration } from './configuration ';
import { GraphLight3DComponent } from './graph-light-3d/graph-light-3d.component';
import { DeviceConfigurationComponent } from './device-configuration/device-configuration.component';
import { DeviceConfigurationService } from './device-configuration/device-configuration.service';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'ng2-toastr/ng2-toastr';
import { LightsComponent } from './lights/lights.component';
import { LightsService } from './lights/lights.service';
import { ChannelDialogComponent } from './channel-dialog/channel-dialog.component';
import { LightConfigurationComponent } from './light-configuration/light-configuration.component';
import { GraphLightConfig3dComponent } from './graph-light-config-3d/graph-light-config-3d.component';
import { SignalRModule, SignalRConfiguration } from 'ng2-signalr';
import { ConnectionResolver } from './services/app.connectionResolver';
import { AppErrorHandler } from './services/app.errorHandler';
import { RequestInterceptor } from './services/app.httpIntercepter';
import { MapConfigComponent } from './map-config/map-config.component';
import { MapService } from './map-config/map-config.service';
import { ChannelFilter } from './lights/channel.filter';
import { AppDataService } from './app.dataservice';

export function createConfig(): SignalRConfiguration {
  const c = new SignalRConfiguration();
  // c.hubName = 'ChatHub';
  // c.qs = { user: 'shashi' };
  // c.url = 'http://localhost:62778/signalr';
   c.hubName = 'ChannelHub';
   c.url = 'https://172.168.1.57:1235/signalr';
  c.logging = true;
  c.executeEventsInZone = true; // optional, default is true
  c.executeErrorsInZone = false; // optional, default is false
  c.executeStatusChangeInZone = true; // optional, default is true
  return c;
}

@NgModule({
  declarations: [
    AppComponent,
    GraphLight3DComponent,
    DeviceConfigurationComponent,
    LightsComponent,
    ChannelDialogComponent,
    LightConfigurationComponent,
    GraphLightConfig3dComponent,
    MapConfigComponent,
    ChannelFilter
  ],
  imports: [
    FormsModule,
    MatTabsModule,
    MatDialogModule,
    MatSlideToggleModule,
    MatSliderModule,
    ColorPickerModule,
    TreeModule,
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppRoutingModule,
    TabsModule.forRoot(),
    SignalRModule.forRoot(createConfig),
    ToastModule.forRoot()
  ],
  providers: [Configuration, MapService, LightsService, DeviceConfigurationService, ConnectionResolver
    , {
      provide: ErrorHandler,
      useClass: AppErrorHandler,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: RequestInterceptor,
      multi: true,
    },
    AppDataService,
  ],
  bootstrap: [AppComponent],
  entryComponents: [
    ChannelDialogComponent
  ]
})
export class AppModule { }
