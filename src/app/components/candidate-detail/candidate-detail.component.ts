import { Component, OnInit, OnChanges, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, Location, DatePipe } from '@angular/common';
import { Candidate } from '../../models/candidate.model';
import { CandidateService } from '../../services/candidate.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-candidate-detail',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatDialogModule],
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

  constructor(
    public candidateService: CandidateService,
    public location: Location,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    if (this.candidate) {
      this.loadNavigationCandidates();
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
      localStorage.setItem('editCandidateId', this.candidate.id);
      window.location.href = '/';
    }
  }

  deleteCandidate(): void {
    if (confirm('Are you sure you want to delete this candidate?')) {
      this.candidateService.deleteCandidate(this.candidate!.id);
      this.candidateDeleted.emit();
    }
  }

  navigateToCandidate(candidate: Candidate): void {
    this.candidate = candidate;
    this.loadNavigationCandidates();
  }

  ngOnChanges(): void {
    // Reload navigation when candidate or availableCandidates changes
    if (this.candidate) {
      this.loadNavigationCandidates();
    }
  }

  onGoBack(): void {
    this.goBack.emit();
  }
}