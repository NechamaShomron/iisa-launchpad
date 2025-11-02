import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Database, ref, onValue, set, update, remove, get, push, runTransaction } from '@angular/fire/database';
import { Candidate, VisitStats } from '../models/candidate.model';

@Injectable({
  providedIn: 'root'
})
export class CandidateService {
  private candidatesPath = 'candidates';
  private visitsPath = 'visits';
  private candidatesSubject = new BehaviorSubject<Candidate[]>([]);
  public candidates$ = this.candidatesSubject.asObservable();
  private visitsSubject = new BehaviorSubject<number>(0);
  public visits$ = this.visitsSubject.asObservable();
  
  // Event subjects for specific actions
  private candidateAdded$ = new Subject<Candidate>();
  private candidateUpdated$ = new Subject<Candidate>();
  private candidateDeleted$ = new Subject<string>();

  constructor(private db: Database) {
    this.setupFirebaseListeners();
    this.incrementVisit();
  }

  private setupFirebaseListeners(): void {
    // Listen to candidates changes
    const candidatesRef = ref(this.db, this.candidatesPath);
    onValue(candidatesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Convert Firebase object to array and parse dates
        const candidates = Object.keys(data).map(key => {
          const candidate = data[key];
          return {
            ...candidate,
            id: key,
            registrationDate: candidate.registrationDate ? new Date(candidate.registrationDate) : new Date(),
            lastUpdated: candidate.lastUpdated ? new Date(candidate.lastUpdated) : new Date()
          } as Candidate;
        });
        this.candidatesSubject.next(candidates);
      } else {
        this.candidatesSubject.next([]);
      }
    });

    // Listen to visits count
    const visitsRef = ref(this.db, this.visitsPath);
    onValue(visitsRef, (snapshot) => {
      const count = snapshot.val();
      // If visits node doesn't exist yet, initialize it to 0
      if (count === null || count === undefined) {
        set(visitsRef, 0).catch(err => console.error('Error initializing visits:', err));
        this.visitsSubject.next(0);
      } else {
        this.visitsSubject.next(count);
      }
    }, (error) => {
      console.error('Error listening to visits:', error);
      this.visitsSubject.next(0);
    });
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

  async addCandidate(candidate: Candidate): Promise<void> {
    try {
      // Convert dates to ISO strings for Firebase
      const candidateData = {
        fullName: candidate.fullName,
        email: candidate.email,
        phone: candidate.phone,
        age: candidate.age,
        city: candidate.city,
        hobbies: candidate.hobbies,
        whyPerfect: candidate.whyPerfect,
        profileImage: candidate.profileImage,
        registrationDate: candidate.registrationDate instanceof Date 
          ? candidate.registrationDate.toISOString() 
          : new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };
      
      // Push to Firebase - this will generate a unique key
      const candidatesRef = ref(this.db, this.candidatesPath);
      const newRef = push(candidatesRef);
      await set(newRef, candidateData);
      
      // The listener will update the subject automatically with the new ID from Firebase
      // Emit a temporary event (the listener will update the actual candidate with the ID)
      this.candidateAdded$.next(candidate);
    } catch (error) {
      console.error('Error adding candidate to Firebase:', error);
      throw error;
    }
  }

  async updateCandidate(candidate: Candidate): Promise<void> {
    try {
      if (!candidate.id) {
        throw new Error('Candidate ID is required for update');
      }

      // Verify candidate exists before updating (handles concurrent deletion)
      const existingCandidate = this.getCandidateById(candidate.id);
      if (!existingCandidate) {
        throw new Error(`Candidate with ID ${candidate.id} no longer exists`);
      }

      const updateData = {
        fullName: candidate.fullName,
        email: candidate.email,
        phone: candidate.phone,
        age: candidate.age,
        city: candidate.city,
        hobbies: candidate.hobbies,
        whyPerfect: candidate.whyPerfect,
        profileImage: candidate.profileImage,
        registrationDate: candidate.registrationDate instanceof Date 
          ? candidate.registrationDate.toISOString() 
          : new Date(candidate.registrationDate).toISOString(),
        lastUpdated: new Date().toISOString()
      };
      
      const candidateRef = ref(this.db, `${this.candidatesPath}/${candidate.id}`);
      await update(candidateRef, updateData);
      
      // The listener will update the subject automatically
      // Emit the original candidate object (not the Firebase data with strings)
      const updatedCandidate = {
        ...candidate,
        lastUpdated: new Date()
      };
      this.candidateUpdated$.next(updatedCandidate);
    } catch (error) {
      console.error('Error updating candidate in Firebase:', error);
      throw error;
    }
  }

  async deleteCandidate(id: string): Promise<void> {
    try {
      if (!id) {
        throw new Error('Candidate ID is required for deletion');
      }

      const candidateRef = ref(this.db, `${this.candidatesPath}/${id}`);
      await remove(candidateRef);
      
      // The listener will update the subject automatically
      this.candidateDeleted$.next(id);
    } catch (error) {
      console.error('Error deleting candidate from Firebase:', error);
      throw error;
    }
  }

  getStats(): VisitStats {
    const totalVisits = this.visitsSubject.value;
    const totalRegistrations = this.candidatesSubject.value.length;
    const conversionRate = totalVisits > 0 ? (totalRegistrations / totalVisits) * 100 : 0;

    return {
      totalVisits,
      totalRegistrations,
      conversionRate
    };
  }

  private async incrementVisit(): Promise<void> {
    try {
      const visitsRef = ref(this.db, this.visitsPath);
      
      // Read current value
      const snapshot = await get(visitsRef);
      const currentCount = snapshot.val();
      
      // Increment and save
      const newCount = (currentCount || 0) + 1;
      await set(visitsRef, newCount);
            
      // The listener will automatically update visitsSubject, but force update to ensure UI updates
      this.visitsSubject.next(newCount);
    } catch (error) {
      console.error('Error incrementing visit count:', error);
      // Fallback: localStorage (but this won't sync across devices)
      const visitsKey = 'iisa_visits';
      const current = parseInt(localStorage.getItem(visitsKey) || '0');
      const newLocalCount = current + 1;
      localStorage.setItem(visitsKey, newLocalCount.toString());
      this.visitsSubject.next(newLocalCount);
    }
  }
}
