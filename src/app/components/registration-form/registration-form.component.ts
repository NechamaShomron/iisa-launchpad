import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { CandidateService } from '../../services/candidate.service';
import { Candidate } from '../../models/candidate.model';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatOptionModule } from '@angular/material/core';

@Component({
  selector: 'app-registration-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatOptionModule,
    MatButtonModule,
    MatCardModule,
    MatSnackBarModule,
    MatIconModule
  ],
  templateUrl: './registration-form.component.html',
  styleUrl: './registration-form.component.scss'
})
export class RegistrationFormComponent implements OnInit {
  registrationForm: FormGroup;
  previewImage?: string;
  editingCandidate?: Candidate;
  
  // Location lists
  cities: string[] = [
    'Tel Aviv', 'Jerusalem', 'Haifa', 'Beer Sheva', 'Netanya', 'Ashkelon', 'Rehovot', 'Rishon LeZion',
    'Petah Tikva', 'Ashdod', 'Ramat Gan', 'Bnei Brak', 'Herzliya', 'Modiin', 'Kfar Saba', 'Ramat Hasharon',
    'Bat Yam', 'Holon', 'Givatayim', 'Or Yehuda', 'Givat Shmuel', 'Ra\'anana', 'Hadera', 'Lod', 'Nazareth',
    'Herzliya', 'Eilat', 'Tiberias', 'Kiryat Shmona', 'Safed', 'Afula', 'Karmiel', 'Nahariya', 'Beit Shemesh',
    'Kiryat Gat', 'Kiryat Ata', 'Umm al-Fahm', 'Sderot', 'Yavne', 'Rosh HaAyin'
  ].sort();
  regions: string[] = [
    'Northern District', 'Haifa District', 'Central District', 'Tel Aviv District',
    'Jerusalem District', 'Southern District', 'Judea and Samaria Area'
  ];

  filteredCities: string[] = [];
  filteredRegions: string[] = [];

  private isValidLocation(value: string | null | undefined): boolean {
    if (!value) return false;
    const v = value.toLowerCase().trim();
    return this.cities.some(c => c.toLowerCase() === v) || this.regions.some(r => r.toLowerCase() === v);
  }

  private locationValidator = (control: AbstractControl): ValidationErrors | null => {
    return this.isValidLocation(control.value) ? null : { invalidLocation: true };
  };

  constructor(
    private fb: FormBuilder,
    private candidateService: CandidateService,
    private snackBar: MatSnackBar
  ) {
    this.registrationForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/), Validators.minLength(10), Validators.maxLength(10)]],
      age: ['', [Validators.required, Validators.min(18), Validators.max(100)]],
      city: ['', [Validators.required, this.locationValidator]],
      hobbies: ['', [Validators.required]],
      whyPerfect: ['', [Validators.required, Validators.minLength(20)]],
      profileImage: [null, [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.checkIfEditing();
    // Initialize filtered lists and wire up filtering
    const cityCtrl = this.registrationForm.get('city');
    this.filteredCities = [...this.cities];
    this.filteredRegions = [...this.regions];
    cityCtrl?.valueChanges.subscribe((val: string) => {
      const q = (val || '').toLowerCase().trim();
      this.filteredCities = this.cities.filter(c => c.toLowerCase().includes(q));
      this.filteredRegions = this.regions.filter(r => r.toLowerCase().includes(q));
    });
  }

  checkIfEditing(): void {
    const candidateId = localStorage.getItem('editCandidateId');
    if (candidateId) {
      const candidate = this.candidateService.getCandidateById(candidateId);
      if (candidate) {
        // Check if registration is 3+ days old
        const registrationDate = new Date(candidate.registrationDate);
        const today = new Date();
        const daysDiff = Math.floor((today.getTime() - registrationDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff >= 3) {
          // Registration is too old to edit, redirect back to dashboard
          localStorage.removeItem('editCandidateId');
          window.location.href = '/dashboard';
          return;
        }
        
        this.editingCandidate = candidate;
        this.loadCandidateData(candidate);
      }
    }
  }

  loadCandidateData(candidate: Candidate): void {
    this.registrationForm.patchValue({
      fullName: candidate.fullName,
      email: candidate.email,
      phone: candidate.phone,
      age: candidate.age,
      city: candidate.city,
      hobbies: candidate.hobbies,
      whyPerfect: candidate.whyPerfect,
      profileImage: candidate.profileImage || null
    });
    if (candidate.profileImage) {
      this.previewImage = candidate.profileImage;
    }
  }

  onPhoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    // Remove any non-numeric characters
    const numericValue = input.value.replace(/[^0-9]/g, '');
    
    // Update both the input value and form control
    if (input.value !== numericValue) {
      input.value = numericValue;
      this.registrationForm.patchValue({ phone: numericValue }, { emitEvent: false });
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // Validate file type - only JPEG and PNG allowed
      const allowedTypes = ['image/jpeg', 'image/png'];
      const fileExtension = file.name.toLowerCase().split('.').pop() || '';
      if (!allowedTypes.includes(file.type) || !['jpg', 'jpeg', 'png'].includes(fileExtension)) {
        this.snackBar.open('Only JPEG and PNG images are allowed', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.snackBar.open('Image size must be less than 5MB', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewImage = e.target?.result as string;
        this.registrationForm.patchValue({ profileImage: this.previewImage });
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (this.registrationForm.valid) {
      const formValue = this.registrationForm.value;
      const candidate: Candidate = {
        id: this.editingCandidate?.id || this.generateId(),
        fullName: formValue.fullName,
        email: formValue.email,
        phone: formValue.phone,
        age: formValue.age,
        city: formValue.city,
        hobbies: formValue.hobbies,
        whyPerfect: formValue.whyPerfect,
        profileImage: formValue.profileImage,
        registrationDate: this.editingCandidate?.registrationDate || new Date(),
        lastUpdated: new Date()
      };

      if (this.editingCandidate) {
        this.candidateService.updateCandidate(candidate);
        this.snackBar.open('Registration updated successfully!', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        localStorage.removeItem('editCandidateId');
      } else {
        this.candidateService.addCandidate(candidate);
        this.snackBar.open('Registration submitted successfully!', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      }

      // Redirect to dashboard
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1500);
    } else {
      this.markFormGroupTouched();
      this.snackBar.open('Please fill in all required fields correctly', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    }
  }

  markFormGroupTouched(): void {
    Object.keys(this.registrationForm.controls).forEach(key => {
      const control = this.registrationForm.get(key);
      control?.markAsTouched();
    });
  }

  generateId(): string {
    return 'candidate_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  removeImage(): void {
    this.previewImage = undefined;
    this.registrationForm.patchValue({ profileImage: null });
  }
}