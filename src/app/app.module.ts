// app.module.ts or slot-machine.module.ts (where SlotMachineComponent is declared)
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms'; // Import FormsModule

import { AppComponent } from './app.component';
import { SlotMachineComponent } from './slot-machine/slot-machine.component';

@NgModule({
  declarations: [
    AppComponent,
    SlotMachineComponent
  ],
  imports: [
    BrowserModule,
    FormsModule // Add FormsModule here
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
