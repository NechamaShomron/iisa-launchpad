import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CandidateService } from '../../../../services/candidate.service';
import { Candidate, VisitStats } from '../../../../models/candidate.model';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { CandidateListComponent } from '../candidate-list/candidate-list.component';
import { CandidateDetailComponent } from '../candidate-detail/candidate-detail.component';
import { CandidateMapComponent } from '../candidate-map/candidate-map.component';
import { AgeDistributionComponent } from '../charts/age-distribution/age-distribution.component';
import { RegVisitsDonutComponent } from '../charts/reg-visits-donut/reg-visits-donut.component';
import { RegistrationTrendComponent } from '../charts/registration-trend/registration-trend.component';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatCardHeader } from '@angular/material/card';
import { MatCardTitle } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    MatInputModule,
    MatCardHeader,
    MatCardTitle,
    MatProgressSpinnerModule,
    CandidateListComponent,
    CandidateDetailComponent,
    CandidateMapComponent,
    AgeDistributionComponent,
    RegVisitsDonutComponent,
    RegistrationTrendComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  candidates: Candidate[] = [];
  filteredCandidates: Candidate[] = [];
  stats: VisitStats = { totalVisits: 0, totalRegistrations: 0, conversionRate: 0 };
  selectedCandidate?: Candidate;
  isLoading: boolean = true;
  nameSearch: string = '';
  emailSearch: string = '';
  citySearch: string = '';
  ageFilter: { min: number; max: number } = { min: 18, max: 100 };

  // Store last filter state
  private lastFilterState = {
    nameSearch: '',
    emailSearch: '',
    citySearch: '',
    ageFilter: { min: 18, max: 100 }
  };

  constructor(
    private candidateService: CandidateService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    // Force loading state to show immediately
    this.isLoading = true;
    this.cdr.detectChanges(); // Force change detection to show spinner
    
    const loadingStartTime = Date.now();
    const minDisplayTime = 800; // Minimum 800ms to ensure spinner is visible
    
    let isFirstLoad = true;
    
    // Subscribe to candidates - use a small delay to ensure spinner renders first
    setTimeout(() => {
      this.candidateService.getCandidates$().subscribe(candidates => {
        // Update dashboard data (common for both first load and updates)
        this.updateDashboardData(candidates);
        
        if (isFirstLoad) {
          // Only first load has spinner logic
          const elapsed = Date.now() - loadingStartTime;
          const remainingTime = Math.max(0, minDisplayTime - elapsed);
          
          setTimeout(() => {
            this.isLoading = false;
            this.cdr.detectChanges();
          }, remainingTime);
          
          isFirstLoad = false;
        }
        // else: Subsequent updates don't trigger loading state (just updates data)
      });
    }, 50); // Small delay to ensure spinner renders

    // Subscribe to visits to update stats when visits change
    this.candidateService.visits$.subscribe(() => {
      if (!this.isLoading) {
        this.updateStats();
        // RegVisitsDonutComponent updates automatically via @Input
      }
    });
  }

  private updateDashboardData(candidates: Candidate[]): void {
    this.candidates = candidates;
    this.filterCandidates();
    this.updateStats();
  }

  private updateStats(): void {
    this.stats = this.candidateService.getStats();
  }

  filterCandidates(): void {
    let filtered = [...this.candidates];

    // Apply name filter
    if (this.nameSearch) {
      const lowerName = this.nameSearch.toLowerCase();
      filtered = filtered.filter(c => c.fullName.toLowerCase().includes(lowerName));
    }

    // Apply email filter
    if (this.emailSearch) {
      const lowerEmail = this.emailSearch.toLowerCase();
      filtered = filtered.filter(c => c.email.toLowerCase().includes(lowerEmail));
    }

    // Apply city/region filter
    if (this.citySearch) {
      const lowerCity = this.citySearch.toLowerCase();
      filtered = filtered.filter(c => c.city.toLowerCase().includes(lowerCity));
    }

    // Apply age filter (treat empty max age as 100)
    const maxAge = this.ageFilter.max || 100;
    const minAge = this.ageFilter.min || 18;

    filtered = filtered.filter(c => c.age >= minAge && c.age <= maxAge);

    this.filteredCandidates = filtered;
  }

  onFilterChange(
    key: 'name' | 'email' | 'city' | 'ageMin' | 'ageMax',
    rawValue: any
  ): void {
    switch (key) {
      case 'name':
        this.nameSearch = (rawValue ?? '').toString();
        break;
      case 'email':
        this.emailSearch = (rawValue ?? '').toString();
        break;
      case 'city':
        this.citySearch = (rawValue ?? '').toString();
        break;
      case 'ageMin': {
        const min = Number(rawValue);
        this.ageFilter = { ...this.ageFilter, min: isNaN(min) ? 18 : min };
        break;
      }
      case 'ageMax': {
        const max = Number(rawValue);
        this.ageFilter = { ...this.ageFilter, max: isNaN(max) ? 100 : max };
        break;
      }
    }
    this.filterCandidates();
  }

  handleCandidateDeleted(): void {
    this.selectedCandidate = undefined;
    // Restore filters when going back to list
    this.restoreFilters();
    
    // Scroll to top when deleting candidate
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onCandidateSelected(candidate: Candidate): void {
    // Save current filter state before clearing
    this.saveFilterState();
    // Don't clear filters - just select the candidate
    this.selectedCandidate = candidate;
    
    // Scroll to top smoothly when opening candidate detail
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  
  private saveFilterState(): void {
    this.lastFilterState = {
      nameSearch: this.nameSearch,
      emailSearch: this.emailSearch,
      citySearch: this.citySearch,
      ageFilter: { ...this.ageFilter }
    };
  }
  
  private restoreFilters(): void {
    this.nameSearch = this.lastFilterState.nameSearch;
    this.emailSearch = this.lastFilterState.emailSearch;
    this.citySearch = this.lastFilterState.citySearch;
    this.ageFilter = this.lastFilterState.ageFilter;
    this.filterCandidates();
  }

  goBackToList(): void {
    this.selectedCandidate = undefined;
    this.restoreFilters();
    
    // Scroll to top when going back to list
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}


