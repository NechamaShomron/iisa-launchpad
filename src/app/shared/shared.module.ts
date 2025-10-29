import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Material Modules - commonly used across components
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatOptionModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';

const MATERIAL_MODULES = [
  MatCardModule,
  MatButtonModule,
  MatIconModule,
  MatInputModule,
  MatFormFieldModule,
  MatChipsModule,
  MatAutocompleteModule,
  MatOptionModule,
  MatDialogModule,
  MatSnackBarModule
];

const COMMON_MODULES = [
  CommonModule,
  FormsModule,
  ReactiveFormsModule
];

@NgModule({
  imports: [
    ...COMMON_MODULES,
    ...MATERIAL_MODULES
  ],
  exports: [
    ...COMMON_MODULES,
    ...MATERIAL_MODULES
  ]
})
export class SharedModule { }

