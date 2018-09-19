import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DeviceConfigurationComponent } from './device-configuration/device-configuration.component';
import { GraphLight3DComponent } from './graph-light-3d/graph-light-3d.component';
import { LightsComponent } from './lights/lights.component';
import { LightConfigurationComponent } from './light-configuration/light-configuration.component';
import { MapConfigComponent } from './map-config/map-config.component';


const routes: Routes = [
  { path: '', redirectTo: '/lights', pathMatch: 'full' },
  { path: 'lights', component: LightsComponent },
  { path: 'dispositivos', component: DeviceConfigurationComponent},
  { path: 'lightconfig', component: LightConfigurationComponent },
  { path: 'mapconfig', component: MapConfigComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
