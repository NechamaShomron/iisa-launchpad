import { Component, OnInit, OnChanges, HostListener, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CandidateService } from '../../services/candidate.service';
import { Candidate, VisitStats } from '../../models/candidate.model';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { CandidateListComponent } from '../candidate-list/candidate-list.component';
import { CandidateDetailComponent } from '../candidate-detail/candidate-detail.component';
import { CandidateMapComponent } from '../candidate-map/candidate-map.component';
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
    CandidateMapComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, OnChanges {
  candidates: Candidate[] = [];
  filteredCandidates: Candidate[] = [];
  stats: VisitStats = { totalVisits: 0, totalRegistrations: 0, conversionRate: 0 };
  selectedCandidate?: Candidate;
  isLoading: boolean = true;
  nameSearch: string = '';
  emailSearch: string = '';
  citySearch: string = '';
  ageFilter: { min: number; max: number } = { min: 18, max: 100 };
  
  // Colors for age distribution segments - darker muted tones
  ageColors: string[] = [
    '#818cf8', // 18–24 - indigo 400
    '#a78bfa', // 25–34 - violet 400
    '#c4b5fd', // 35–44 - violet 300
    '#f472b6', // 45–54 - pink 400
    '#fb7185', // 55–64 - rose 400
    '#fda4af', // 65–74 - rose 300
    '#93c5fd', // 75–84 - blue 300
    '#60a5fa'  // 85–100 - blue 400
  ];

  // Single pie (donut) data
  agePieSlices: Array<{ label: string; value: number; percent: number; color: string; start: number; end: number }>=[];
  pieSize = 150; // smaller viewbox
  pieRadius = 56; // smaller arc radius

  // Bar chart (age distribution) geometry
  ageBarWidth = 320;
  ageBarHeight = 180; // Taller for full labels
  ageBarPadding = { top: 12, right: 12, bottom: 64, left: 24 }; // Increase top padding to shrink bars
  ageBars: Array<{ x: number; y: number; width: number; height: number; label: string; value: number }> = [];
  ageBarMax = 1;
  ageBarLabels: string[] = [];

  // Registration trends line/area chart (last 30 days)
  trendWidth = 260; // Smaller width
  trendHeight = 140; // Smaller height
  trendPadding = { top: 10, right: 10, bottom: 32, left: 18 }; // More bottom padding for mobile readability
  trendPointRadius: number = 2;
  trendPoints: Array<{ x: number; y: number; value: number }> = [];
  trendPath: string = '';
  trendArea: string = '';
  trendLabels: string[] = [];
  trendMax = 1;
  trendYTicks: number[] = [];
  trendDateLabels: string[] = [];
  trendShowLabel: boolean[] = [];
  hoveredIndex: number | null = null;

  // Pie Chart data
  pieChartData: number[] = [];
  pieChartLabels: string[] = [];
  pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 15,
          font: {
            size: 13,
            weight: '500'
          }
        }
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} candidates (${percentage}%)`;
          }
        }
      }
    }
  };
  pieChartPlugins = [];
  
  // Registration summary donut (Registered vs Visited)
  regPieSize = 100; // Size for round donut with centered text
  regPieRadius = 35; // Radius for the donut ring (must match exactly for blue and grey)
  regSlices: Array<{ label: 'Registered' | 'Visited'; value: number; percent: number; color: string; start: number; end: number }> = [];
  regPercent: number = 0; // 0..1 percentage of registrations vs total
  regCircumference: number = 0; // 2πr for stroke-dasharray

  // Store last filter state
  private lastFilterState = {
    nameSearch: '',
    emailSearch: '',
    citySearch: '',
    ageFilter: { min: 18, max: 100 }
  };

  constructor(
    private candidateService: CandidateService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  @HostListener('window:resize')
  onWindowResize(): void {
    this.updateResponsiveChartSizes();
  }

  ngOnInit(): void {
    this.loadData();
    this.updateResponsiveChartSizes();
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
        if (isFirstLoad) {
          this.candidates = candidates;
          this.filterCandidates();
          this.updateStats();
          this.updatePieChart();
          this.updateAgePie();
          this.updateAgeBars();
          this.updateTrends();
          this.updateRegDonut();
          
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
          this.candidates = candidates;
          this.filterCandidates();
          this.updateStats();
          this.updatePieChart();
          this.updateAgePie();
          this.updateAgeBars();
          this.updateTrends();
          this.updateRegDonut();
        }
      });
    }, 50); // Small delay to ensure spinner renders

    // Subscribe to visits to update stats when visits change
    this.candidateService.visits$.subscribe(() => {
      if (!this.isLoading) {
        this.updateStats();
        this.updateRegDonut();
      }
    });
  }

  private updateStats(): void {
    this.stats = this.candidateService.getStats();
  }

  updatePieChart(): void {
    const ageDistribution = this.getAgeDistribution();
    this.pieChartLabels = ageDistribution.map(item => item.age);
    this.pieChartData = ageDistribution.map(item => item.count);
  }

  ngOnChanges(): void {
    this.updatePieChart();
    this.updateAgePie();
    this.updateAgeBars();
    this.updateTrends();
    this.updateRegDonut();
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
    filtered = filtered.filter(c => c.age >= this.ageFilter.min && c.age <= maxAge);

    this.filteredCandidates = filtered;
  }

  onNameSearchChange(value: string): void {
    this.nameSearch = value;
    this.filterCandidates();
  }

  onEmailSearchChange(value: string): void {
    this.emailSearch = value;
    this.filterCandidates();
  }

  onCitySearchChange(value: string): void {
    this.citySearch = value;
    this.filterCandidates();
  }

  onAgeFilterChange(min: number, max: number): void {
    this.ageFilter = { min, max };
    this.filterCandidates();
  }

  clearFilters(): void {
    this.nameSearch = '';
    this.emailSearch = '';
    this.citySearch = '';
    this.ageFilter = { min: 18, max: 100 };
    this.filterCandidates();
  }

  getCities(): string[] {
    return [...new Set(this.candidates.map(c => c.city))].sort();
  }

  getAgeDistribution(): { age: string; count: number }[] {
    const order = ['18–24','25–34','35–44','45–54','55–64','65–74','75–84','85–100'];
    const distribution: { [key: string]: number } = {};
    order.forEach(bucket => distribution[bucket] = 0);
    this.candidates.forEach(c => {
      const bucket = this.getAgeRange(c.age);
      distribution[bucket] = (distribution[bucket] || 0) + 1;
    });
    return order.map(age => ({ age, count: distribution[age] || 0 }));
  }

  private getAgeRange(age: number): string {
    if (age <= 24) return '18–24';
    if (age <= 34) return '25–34';
    if (age <= 44) return '35–44';
    if (age <= 54) return '45–54';
    if (age <= 64) return '55–64';
    if (age <= 74) return '65–74';
    if (age <= 84) return '75–84';
    return '85–100';
  }

  updateAgePie(): void {
    const dist = this.getAgeDistribution();
    const total = this.candidates.length || 1;
    let cumulative = 0; // in radians
    this.agePieSlices = dist.map((d, i) => {
      const percent = d.count / total;
      const start = cumulative;
      const end = cumulative + percent * Math.PI * 2;
      cumulative = end;
      return { label: d.age, value: d.count, percent: percent * 100, color: this.ageColors[i], start, end };
    });
  }

  updateAgeBars(): void {
    const dist = this.getAgeDistribution();
    const labels = dist.map(d => d.age);
    const values = dist.map(d => d.count);
    this.ageBarLabels = labels;
    const maxVal = Math.max(1, ...values);
    this.ageBarMax = maxVal;

    const w = this.ageBarWidth - this.ageBarPadding.left - this.ageBarPadding.right;
    const h = this.ageBarHeight - this.ageBarPadding.top - this.ageBarPadding.bottom;
    const n = values.length || 1;
    const step = w / n;
    const gap = Math.min(20, step * 0.35);
    const barW = Math.max(6, step - gap);

    this.ageBars = values.map((v, i) => {
      const x = this.ageBarPadding.left + i * step + (step - barW) / 2;
      const barH = (v / maxVal) * h;
      const y = this.ageBarPadding.top + (h - barH);
      return { x, y, width: barW, height: barH, label: labels[i], value: v };
    });
  }

  // Helpers to build SVG arc path for donut slices
  describeArc(cx: number, cy: number, r: number, startAngleRad: number, endAngleRad: number): string {
    const start = this.polarToCartesian(cx, cy, r, endAngleRad);
    const end = this.polarToCartesian(cx, cy, r, startAngleRad);
    const largeArcFlag = endAngleRad - startAngleRad <= Math.PI ? 0 : 1;
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
  }

  polarToCartesian(cx: number, cy: number, r: number, angleRad: number): { x: number; y: number } {
    return { x: cx + r * Math.cos(angleRad - Math.PI / 2), y: cy + r * Math.sin(angleRad - Math.PI / 2) };
  }

  updateTrends(): void {
    const today = new Date();
    const days = 30;
    const dayMs = 24 * 60 * 60 * 1000;
    const buckets: Record<string, number> = {};
    this.trendLabels = [];
    const dateLabels: string[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today.getTime() - i * dayMs);
      const key = this.localDateKey(d);
      buckets[key] = 0;
      const m = (d.getMonth() + 1).toString().padStart(2, '0');
      const dd = d.getDate().toString().padStart(2, '0');
      const label = `${dd}/${m}`; // DD/MM format
      // Keep full label array for potential conditional display
      this.trendLabels.push(label);
      dateLabels.push(label);
    }

    this.candidates.forEach(c => {
      const key = this.localDateKey(new Date(c.registrationDate));
      if (key in buckets) buckets[key] += 1;
    });

    const values = Object.values(buckets);
    this.trendMax = Math.max(1, ...values);

    const w = this.trendWidth - this.trendPadding.left - this.trendPadding.right;
    const h = this.trendHeight - this.trendPadding.top - this.trendPadding.bottom;
    const step = w / (values.length - 1 || 1);

    this.trendPoints = values.map((v, i) => {
      const x = this.trendPadding.left + i * step;
      const y = this.trendPadding.top + (1 - v / this.trendMax) * h;
      return { x, y, value: v };
    });

    // Build path
    let d = '';
    this.trendPoints.forEach((p, i) => {
      if (i === 0) d = `M ${p.x} ${p.y}`;
      else d += ` L ${p.x} ${p.y}`;
    });
    this.trendPath = d;

    if (this.trendPoints.length > 0) {
      const last = this.trendPoints[this.trendPoints.length - 1];
      const first = this.trendPoints[0];
      const bottomY = this.trendPadding.top + h;
      this.trendArea = `${d} L ${last.x} ${bottomY} L ${first.x} ${bottomY} Z`;
    } else {
      this.trendArea = '';
    }

    // Y ticks (0..max, 4 levels)
    this.trendYTicks = [];
    const tickCount = 4;
    for (let i = 0; i <= tickCount; i++) {
      this.trendYTicks.push(Math.round((this.trendMax * i) / tickCount));
    }

    // Tooltip labels for hover and conditional label visibility
    this.trendDateLabels = dateLabels;
    // Always show first and last, hide others (they'll show on hover)
    const lastIndex = values.length - 1;
    this.trendShowLabel = values.map((v, i) => i === 0 || i === lastIndex);
  }

  private localDateKey(d: Date): string {
    const y = d.getFullYear();
    const m = (d.getMonth() + 1).toString().padStart(2, '0');
    const dd = d.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${dd}`;
  }

  private updateRegDonut(): void {
    const visited = Math.max(0, this.stats.totalVisits || 0);
    const registered = Math.max(0, this.stats.totalRegistrations || 0);
    const total = Math.max(visited, registered, 1);
    const registeredPercent = registered / total;

    // For legacy path-based arc (kept but not used by template)
    const startAngle = 0;
    const endAngle = registeredPercent * Math.PI * 2;
    this.regSlices = [
      { label: 'Registered' as const, value: registered, percent: registeredPercent * 100, color: '#3b82f6', start: startAngle, end: endAngle }
    ];

    // For dashed-circle donut
    this.regPercent = registeredPercent;
    this.regCircumference = 2 * Math.PI * this.regPieRadius;
  }

  getHobbyDistribution(): { hobby: string; count: number }[] {
    const hobbyMap: { [key: string]: number } = {};
    this.candidates.forEach(c => {
      const hobbies = c.hobbies.toLowerCase().split(/[,;]/).map(h => h.trim()).filter(h => h.length > 0);
      hobbies.forEach(hobby => {
        hobbyMap[hobby] = (hobbyMap[hobby] || 0) + 1;
      });
    });
    return Object.entries(hobbyMap)
      .map(([hobby, count]) => ({ hobby, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
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

  getTotalCandidates(): number {
    return this.candidates.length;
  }

  getAgeTop(label: string): string {
    const parts = label.split(/–|-/);
    return parts[0] ? parts[0] + '–' : label;
  }

  getAgeBottom(label: string): string {
    const parts = label.split(/–|-/);
    return parts[1] || '';
  }

  private updateResponsiveChartSizes(): void {
    const vw = window.innerWidth || 1024;

    if (vw < 640) { // phone
      this.ageBarWidth = 240;
      this.ageBarHeight = Math.max(140, this.ageBarHeight);
      this.ageBarPadding = { top: 20, right: 12, bottom: Math.max(62, this.ageBarPadding.bottom), left: 20 } as any;
    } else if (vw < 1024) { // tablet
      this.ageBarWidth = 280;
      this.ageBarHeight = Math.max(160, this.ageBarHeight);
      this.ageBarPadding = { top: 16, right: 12, bottom: Math.max(66, this.ageBarPadding.bottom), left: 22 } as any;
    } else { // desktop
      this.ageBarWidth = 320;
      this.ageBarHeight = Math.max(180, this.ageBarHeight);
      this.ageBarPadding = { top: 12, right: 12, bottom: Math.max(70, this.ageBarPadding.bottom), left: 24 } as any;
    }

    // Recompute charts that depend on geometry
    if (typeof (this as any).updatePieChart === 'function') {
      (this as any).updatePieChart();
    }
    this.updateTrends();
    if (typeof (this as any).updateRegDonut === 'function') {
      (this as any).updateRegDonut();
    }
  }
}