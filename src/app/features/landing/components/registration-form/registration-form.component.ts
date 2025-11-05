import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { CandidateService } from '../../../../services/candidate.service';
import { Candidate } from '../../../../models/candidate.model';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatOptionModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { CITIES, REGIONS } from '../../../../shared/constants/locations';

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
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './registration-form.component.html',
  styleUrl: './registration-form.component.scss'
})
export class RegistrationFormComponent implements OnInit {
  registrationForm: FormGroup;
  previewImage?: string;
  editingCandidate?: Candidate;
  isLoading: boolean = true;
  
  // Location lists
  cities: string[] = [...CITIES].sort();
  regions: string[] = [...REGIONS];

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
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private router: Router
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
    const qpEditId = this.route.snapshot.queryParamMap.get('editId');
    if (qpEditId) {
      sessionStorage.setItem('editCandidateId', qpEditId);
    } else {
      sessionStorage.removeItem('editCandidateId');
      this.editingCandidate = undefined;
      this.registrationForm.reset();
      this.previewImage = undefined;
    }

    // Initialize filtered lists and wire up filtering
    const cityCtrl = this.registrationForm.get('city');
    this.filteredCities = [...this.cities];
    this.filteredRegions = [...this.regions];
    cityCtrl?.valueChanges.subscribe((val: string) => {
      const q = (val || '').toLowerCase().trim();
      this.filteredCities = this.cities.filter(c => c.toLowerCase().includes(q));
      this.filteredRegions = this.regions.filter(r => r.toLowerCase().includes(q));
    });
    
    // Clear edit state if user navigates directly to registration (not from edit)
    // This prevents conflicts if multiple users are registering simultaneously
    // Prefer query param for per-tab, per-navigation scoping
    const editCandidateId = sessionStorage.getItem('editCandidateId');
    if (!editCandidateId) {
      // No edit state - this is a fresh registration
      this.editingCandidate = undefined;
      this.registrationForm.reset();
      this.previewImage = undefined;
    }

    // Subscribe to candidates$ to wait for Firebase data to load before checking for editing
    this.isLoading = true;
    this.cdr.detectChanges(); // Force change detection to show spinner
    
    const loadingStartTime = Date.now();
    const minDisplayTime = 600; // Minimum 600ms to ensure spinner is visible
    
    let isFirstLoad = true;
    
    // Small delay to ensure spinner renders first
    setTimeout(() => {
      this.candidateService.getCandidates$().subscribe(candidates => {
        if (isFirstLoad) {
          if (candidates.length > 0 || this.editingCandidate) {
            this.checkIfEditing();
          }
          
          // Ensure minimum display time
          const elapsed = Date.now() - loadingStartTime;
          const remainingTime = Math.max(0, minDisplayTime - elapsed);
          
          setTimeout(() => {
            this.isLoading = false;
            this.cdr.detectChanges();
          }, remainingTime);
          
          isFirstLoad = false;
        } else {
          // Subsequent updates don't trigger loading state
          if (candidates.length > 0 || this.editingCandidate) {
            this.checkIfEditing();
          }
        }
      });
    }, 50); // Small delay to ensure spinner renders
  }

  checkIfEditing(): void {
    const qpEditId = this.route.snapshot.queryParamMap.get('editId');
    if (!qpEditId) return;
    const candidateId = sessionStorage.getItem('editCandidateId');
    if (candidateId) {
      const candidate = this.candidateService.getCandidateById(candidateId);
      if (candidate) {
        // Check if registration is 3+ days old
        const registrationDate = new Date(candidate.registrationDate);
        const today = new Date();
        const daysDiff = Math.floor((today.getTime() - registrationDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff >= 3) {
          // Registration is too old to edit, redirect back to dashboard
          sessionStorage.removeItem('editCandidateId');
          this.router.navigate(['/dashboard']);
          return;
        }
        
        this.editingCandidate = candidate;
        this.loadCandidateData(candidate);
      } else {
        // Candidate not found - might still be loading, try again after a short delay
        setTimeout(() => {
          const retryCandidate = this.candidateService.getCandidateById(candidateId);
          if (retryCandidate) {
            this.editingCandidate = retryCandidate;
            this.loadCandidateData(retryCandidate);
          }
        }, 500);
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

  async onSubmit(): Promise<void> {
    if (!this.registrationForm.valid) {
      this.markFormGroupTouched();
      this.showSnack('Please fill in all required fields correctly', 'error-snackbar', 3000);
      return;
    }

    try {
      if (this.editingCandidate) {
        await this.handleEditSubmit();
      } else {
        await this.handleCreateSubmit();
      }
      this.navigateToDashboard();
    } catch (error) {
      console.error('Error saving candidate:', error);
      this.showSnack('Error saving registration. Please try again.', 'error-snackbar', 3000);
    }
  }

  private async handleEditSubmit(): Promise<void> {
    if (!this.editingCandidate) return;

    const currentCandidate = this.candidateService.getCandidateById(this.editingCandidate.id);
    if (!currentCandidate) {
      this.clearEditState();
      this.showSnack('This candidate no longer exists. It may have been deleted.', 'error-snackbar', 5000);
      return;
    }

    if (!this.isEditable(currentCandidate.registrationDate)) {
      this.clearEditState();
      this.showSnack('This registration is too old to edit.', 'error-snackbar', 5000);
      return;
    }

    const form = this.registrationForm.value;
    const candidate: Candidate = {
      id: this.editingCandidate.id,
      fullName: form.fullName,
      email: form.email,
      phone: form.phone,
      age: form.age,
      city: form.city,
      hobbies: form.hobbies,
      whyPerfect: form.whyPerfect,
      profileImage: form.profileImage,
      registrationDate: this.editingCandidate.registrationDate,
      lastUpdated: new Date()
    };
    await this.candidateService.updateCandidate(candidate);
    this.clearEditState();
    this.showSnack('Registration updated successfully!', 'success-snackbar', 3000);
  }

  private async handleCreateSubmit(): Promise<void> {
    this.clearEditState();
    const form = this.registrationForm.value;
    const candidate: Candidate = {
      id: '',
      fullName: form.fullName,
      email: form.email,
      phone: form.phone,
      age: form.age,
      city: form.city,
      hobbies: form.hobbies,
      whyPerfect: form.whyPerfect,
      profileImage: form.profileImage,
      registrationDate: new Date(),
      lastUpdated: new Date()
    };
    await this.candidateService.addCandidate(candidate);
    this.showSnack('Registration submitted successfully!', 'success-snackbar', 3000);
  }

  private isEditable(registrationDate: Date | string): boolean {
    const date = new Date(registrationDate);
    const today = new Date();
    const daysDiff = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff < 3;
  }

  private navigateToDashboard(): void {
    setTimeout(() => this.router.navigate(['/dashboard']), 1500);
  }

  private clearEditState(): void {
    sessionStorage.removeItem('editCandidateId');
    localStorage.removeItem('editCandidateId');
  }

  private showSnack(message: string, panel: 'success-snackbar' | 'error-snackbar', duration: number): void {
    this.snackBar.open(message, 'Close', { duration, panelClass: [panel] });
  }

  markFormGroupTouched(): void {
    Object.keys(this.registrationForm.controls).forEach(key => {
      const control = this.registrationForm.get(key);
      control?.markAsTouched();
    });
  }

  removeImage(): void {
    this.previewImage = undefined;
    this.registrationForm.patchValue({ profileImage: null });
  }
}


