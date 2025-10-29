import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Candidate } from '../../models/candidate.model';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-candidate-list',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './candidate-list.component.html',
  styleUrl: './candidate-list.component.scss'
})
export class CandidateListComponent {
  @Input() candidates: Candidate[] = [];
  @Input() isLoading: boolean = false;
  @Output() candidateSelected = new EventEmitter<Candidate>();

  onSelectCandidate(candidate: Candidate): void {
    this.candidateSelected.emit(candidate);
  }
}