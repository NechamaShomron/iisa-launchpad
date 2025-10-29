import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Candidate, VisitStats } from '../models/candidate.model';

@Injectable({
  providedIn: 'root'
})
export class CandidateService {
  private candidatesKey = 'iisa_candidates';
  private visitsKey = 'iisa_visits';
  private candidatesSubject = new BehaviorSubject<Candidate[]>([]);
  public candidates$ = this.candidatesSubject.asObservable();
  
  // Event subjects for specific actions
  private candidateAdded$ = new Subject<Candidate>();
  private candidateUpdated$ = new Subject<Candidate>();
  private candidateDeleted$ = new Subject<string>();
  
  // Public observables for components to subscribe
  public onCandidateAdded$ = this.candidateAdded$.asObservable();
  public onCandidateUpdated$ = this.candidateUpdated$.asObservable();
  public onCandidateDeleted$ = this.candidateDeleted$.asObservable();

  constructor() {
    this.loadCandidates();
    this.incrementVisit();
  }

  getCandidates(): Candidate[] {
    return this.candidatesSubject.value;
  }

  getCandidates$(): Observable<Candidate[]> {
    return this.candidates$;
  }

  getCandidateById(id: string): Candidate | undefined {
    return this.candidatesSubject.value.find(c => c.id === id);
  }

  addCandidate(candidate: Candidate): void {
    const candidates = [...this.candidatesSubject.value, candidate];
    this.saveCandidates(candidates);
    this.candidatesSubject.next(candidates);
    this.candidateAdded$.next(candidate);
  }

  updateCandidate(candidate: Candidate): void {
    const updatedCandidate = { ...candidate, lastUpdated: new Date() };
    const candidates = this.candidatesSubject.value.map(c =>
      c.id === candidate.id ? updatedCandidate : c
    );
    this.saveCandidates(candidates);
    this.candidatesSubject.next(candidates);
    this.candidateUpdated$.next(updatedCandidate);
  }

  deleteCandidate(id: string): void {
    const candidates = this.candidatesSubject.value.filter(c => c.id !== id);
    this.saveCandidates(candidates);
    this.candidatesSubject.next(candidates);
    this.candidateDeleted$.next(id);
  }

  searchCandidates(query: string): Candidate[] {
    const lowerQuery = query.toLowerCase();
    return this.candidatesSubject.value.filter(c =>
      c.fullName.toLowerCase().includes(lowerQuery) ||
      c.city.toLowerCase().includes(lowerQuery) ||
      c.email.toLowerCase().includes(lowerQuery)
    );
  }

  filterByAgeRange(min: number, max: number): Candidate[] {
    return this.candidatesSubject.value.filter(c => c.age >= min && c.age <= max);
  }

  filterByCity(city: string): Candidate[] {
    return this.candidatesSubject.value.filter(c => c.city.toLowerCase() === city.toLowerCase());
  }

  getStats(): VisitStats {
    const totalVisits = parseInt(localStorage.getItem(this.visitsKey) || '0');
    const totalRegistrations = this.candidatesSubject.value.length;
    const conversionRate = totalVisits > 0 ? (totalRegistrations / totalVisits) * 100 : 0;

    return {
      totalVisits,
      totalRegistrations,
      conversionRate
    };
  }

  private incrementVisit(): void {
    const current = parseInt(localStorage.getItem(this.visitsKey) || '0');
    localStorage.setItem(this.visitsKey, (current + 1).toString());
  }

  private loadCandidates(): void {
    const stored = localStorage.getItem(this.candidatesKey);
    if (stored) {
      const candidates = JSON.parse(stored).map((c: any) => ({
        ...c,
        registrationDate: new Date(c.registrationDate),
        lastUpdated: new Date(c.lastUpdated)
      }));
      this.candidatesSubject.next(candidates);
    }
  }

  private saveCandidates(candidates: Candidate[]): void {
    localStorage.setItem(this.candidatesKey, JSON.stringify(candidates));
  }
}
