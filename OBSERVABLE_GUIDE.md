# Observable/Subject Implementation Guide

## Overview

The `CandidateService` now uses **RxJS Observables, Subjects, and BehaviorSubjects** for reactive data flow. This provides:

✅ **Reactive updates** - Components automatically update when data changes  
✅ **Event-driven architecture** - Subscribe to specific actions (add/edit/delete)  
✅ **Type safety** - Full TypeScript support  
✅ **No external dependencies** - Pure RxJS, no WebSocket server needed

## Available Observables

### 1. `candidates$` - BehaviorSubject
```typescript
// Get the current candidate list as an observable
// This emits the current value immediately and all future updates

this.candidateService.candidates$.subscribe(candidates => {
  console.log('Current candidates:', candidates);
});
```

### 2. `onCandidateAdded$` - Subject
```typescript
// Subscribe to when new candidates are added
this.candidateService.onCandidateAdded$.subscribe(candidate => {
  console.log('New candidate added:', candidate);
  // Show toast notification, update UI, etc.
});
```

### 3. `onCandidateUpdated$` - Subject
```typescript
// Subscribe to when candidates are updated
this.candidateService.onCandidateUpdated$.subscribe(candidate => {
  console.log('Candidate updated:', candidate);
  // Refresh details, show notification, etc.
});
```

### 4. `onCandidateDeleted$` - Subject
```typescript
// Subscribe to when candidates are deleted
this.candidateService.onCandidateDeleted$.subscribe(id => {
  console.log('Candidate deleted:', id);
  // Close detail view, show confirmation, etc.
});
```

## Usage Examples

### Example 1: Dashboard Component

```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CandidateService } from '../../services/candidate.service';
import { Subject, takeUntil } from 'rxjs';

export class DashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  constructor(private candidateService: CandidateService) {}
  
  ngOnInit() {
    // Subscribe to all candidates updates
    this.candidateService.candidates$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(candidates => {
      this.candidates = candidates;
      this.updateStats();
    });
    
    // Subscribe to candidate deletion
    this.candidateService.onCandidateDeleted$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(id => {
      if (this.selectedCandidate?.id === id) {
        this.selectedCandidate = undefined;
      }
    });
  }
  
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

### Example 2: Show Toast on Add

```typescript
import { MatSnackBar } from '@angular/material/snack-bar';

export class MyComponent implements OnInit {
  constructor(
    private candidateService: CandidateService,
    private snackBar: MatSnackBar
  ) {}
  
  ngOnInit() {
    this.candidateService.onCandidateAdded$.subscribe(candidate => {
      this.snackBar.open(
        `New candidate registered: ${candidate.fullName}`,
        'Close',
        { duration: 3000 }
      );
    });
  }
}
```

### Example 3: Auto-refresh Stats

```typescript
export class StatsComponent implements OnInit {
  stats: VisitStats;
  
  ngOnInit() {
    this.candidateService.candidates$.subscribe(() => {
      // Stats are recalculated every time candidates change
      this.stats = this.candidateService.getStats();
    });
    
    this.stats = this.candidateService.getStats();
  }
}
```

## Benefits

### BehaviorSubject vs Subject

- **BehaviorSubject**: Always has a current value, emits immediately on subscribe
  - Perfect for: `candidates$` (always want the latest list)
  
- **Subject**: Only emits values after subscription
  - Perfect for: Events like `onCandidateAdded$` (only care about new events)

### Reactive Benefits

1. **Automatic Updates**: Components using `candidates$` automatically refresh
2. **Event-Driven**: Components can react to specific actions (add/edit/delete)
3. **Decoupled**: Components don't need to manually refresh data
4. **Testable**: Easy to mock and test observables

## Best Practices

### 1. Always Unsubscribe
```typescript
private destroy$ = new Subject<void>();

ngOnInit() {
  this.candidateService.candidates$.pipe(
    takeUntil(this.destroy$)
  ).subscribe(/* ... */);
}

ngOnDestroy() {
  this.destroy$.next();
  this.destroy$.complete();
}
```

### 2. Use `async` Pipe When Possible
```html
<div *ngFor="let candidate of candidates$ | async">
  {{ candidate.fullName }}
</div>
```

### 3. Use Operators
```typescript
// Filter only active candidates
this.candidateService.candidates$.pipe(
  map(candidates => candidates.filter(c => c.active)),
  distinctUntilChanged()
).subscribe(activeCandidates => {
  // ...
});
```

## Current Implementation

The `CandidateService` uses:
- **BehaviorSubject** for the candidate list (immediate value + updates)
- **Subjects** for events (add/edit/delete actions)
- **Observable operators** for data transformations

All data is persisted to `localStorage` and reactively updated across the app!


