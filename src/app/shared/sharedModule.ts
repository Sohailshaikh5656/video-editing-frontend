import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CrPlayerComponent } from '../components/cr-player/cr-player.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CrPlayerComponent
  ],

  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CrPlayerComponent
  ]
})
export class SharedModule {}