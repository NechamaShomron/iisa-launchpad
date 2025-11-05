import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
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
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

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
export class DashboardComponent implements OnInit, OnDestroy {
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

  private destroy$ = new Subject<void>();
  private filterTimer?: any;
  
  constructor(
    private candidateService: CandidateService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.cdr.detectChanges();
    
    const loadingStartTime = Date.now();
    const minDisplayTime = 800; // Minimum 800ms to ensure spinner is visible
    
    let isFirstLoad = true;
    setTimeout(() => {
      this.candidateService.getCandidates$()
        .pipe(takeUntil(this.destroy$))
        .subscribe(candidates => {
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
      });
    }, 50);

    this.candidateService.visits$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
      if (!this.isLoading) {
        this.updateStats();
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
    const nameQ = (this.nameSearch || '').trim().toLowerCase();
    const emailQ = (this.emailSearch || '').trim().toLowerCase();
    const cityQ = (this.citySearch || '').trim().toLowerCase();
    const minAge = this.ageFilter.min || 18;
    const maxAge = this.ageFilter.max || 100;

    this.filteredCandidates = this.candidates.filter(c => {
      if (nameQ && !c.fullName.toLowerCase().includes(nameQ)) return false;
      if (emailQ && !c.email.toLowerCase().includes(emailQ)) return false;
      if (cityQ && !c.city.toLowerCase().includes(cityQ)) return false;
      if (c.age < minAge || c.age > maxAge) return false;
      return true;
    });
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
        const min = this.coerceAge(rawValue, 18);
        const max = this.coerceAge(this.ageFilter.max, 100);
        this.ageFilter = { min: Math.min(min, max), max };
        break;
      }
      case 'ageMax': {
        const max = this.coerceAge(rawValue, 100);
        const min = this.coerceAge(this.ageFilter.min, 18);
        this.ageFilter = { min, max: Math.max(max, min) };
        break;
      }
    }
    this.applyFiltersDebounced();
  }

  private coerceAge(value: any, fallback: number): number {
    const n = Number(value);
    if (isNaN(n)) return fallback;
    return Math.max(18, Math.min(100, Math.floor(n)));
  }


  private applyFiltersDebounced(delay: number = 120): void {
    clearTimeout(this.filterTimer);
    this.filterTimer = setTimeout(() => this.filterCandidates(), delay);
  }

  handleCandidateDeleted(): void {
    this.selectedCandidate = undefined;
    this.restoreFilters();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onCandidateSelected(candidate: Candidate): void {
    this.saveFilterState();
    this.selectedCandidate = candidate;
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.filterTimer) {
      clearTimeout(this.filterTimer);
      this.filterTimer = undefined;
    }
  }
}


