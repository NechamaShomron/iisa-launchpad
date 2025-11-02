import { Component, OnInit, OnChanges, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Candidate } from '../../../../models/candidate.model';
import { CandidateService } from '../../../../services/candidate.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-candidate-detail',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './candidate-detail.component.html',
  styleUrl: './candidate-detail.component.scss'
})
export class CandidateDetailComponent implements OnInit, OnChanges {
  @Input() candidate?: Candidate;
  @Input() availableCandidates?: Candidate[]; // For navigation within filtered list
  @Output() candidateDeleted = new EventEmitter<void>();
  @Output() goBack = new EventEmitter<void>();
  previousCandidate?: Candidate;
  nextCandidate?: Candidate;
  isLoading: boolean = true;

  constructor(
    public candidateService: CandidateService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (this.candidate) {
      this.isLoading = true;
      this.cdr.detectChanges(); // Force change detection to show spinner
      
      // Add a small delay to ensure spinner is visible
      const startTime = Date.now();
      const minLoadTime = 400;
      
      setTimeout(() => {
        this.loadNavigationCandidates();
        const elapsed = Date.now() - startTime;
        const remainingTime = Math.max(0, minLoadTime - elapsed);
        
        setTimeout(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        }, remainingTime);
      }, 50);
    } else {
      this.isLoading = true;
      this.cdr.detectChanges();
    }
  }

  loadNavigationCandidates(): void {
    // Use availableCandidates if provided (filtered list), otherwise use all candidates
    const candidates = this.availableCandidates || this.candidateService.getCandidates();
    const currentIndex = candidates.findIndex(c => c.id === this.candidate?.id);
    
    // Reset navigation candidates
    this.previousCandidate = undefined;
    this.nextCandidate = undefined;
    
    if (currentIndex > 0) {
      this.previousCandidate = candidates[currentIndex - 1];
    }
    
    if (currentIndex >= 0 && currentIndex < candidates.length - 1) {
      this.nextCandidate = candidates[currentIndex + 1];
    }
  }

  isEditable(): boolean {
    if (!this.candidate) return false;
    const registrationDate = new Date(this.candidate.registrationDate);
    const today = new Date();
    const daysDiff = Math.floor((today.getTime() - registrationDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff < 3;
  }

  editCandidate(): void {
    if (this.candidate && this.isEditable()) {
      // Verify candidate still exists before navigating to edit (handles concurrent deletion)
      const currentCandidate = this.candidateService.getCandidateById(this.candidate.id);
      if (!currentCandidate) {
        console.error('Candidate no longer exists');
        return;
      }
      
      // Set edit state scoped to this browser tab only (fallback)
      sessionStorage.setItem('editCandidateId', this.candidate.id);
      // Navigate to registration with explicit query param to avoid cross-tab leakage
      this.router.navigate(['/'], { queryParams: { editId: this.candidate.id } });
    }
  }

  async deleteCandidate(): Promise<void> {
    if (confirm('Are you sure you want to delete this candidate?')) {
      try {
        await this.candidateService.deleteCandidate(this.candidate!.id);
        this.candidateDeleted.emit();
      } catch (error) {
        console.error('Error deleting candidate:', error);
        alert('Error deleting candidate. Please try again.');
      }
    }
  }

  navigateToCandidate(candidate: Candidate): void {
    this.candidate = candidate;
    this.loadNavigationCandidates();
  }

  ngOnChanges(): void {
    // Reload navigation when candidate or availableCandidates changes
    if (this.candidate) {
      this.isLoading = false;
      this.loadNavigationCandidates();
    } else {
      this.isLoading = true;
    }
  }
}


