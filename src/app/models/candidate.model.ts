export interface Candidate {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  age: number;
  city: string;
  hobbies: string;
  whyPerfect: string;
  profileImage: string;
  registrationDate: Date;
  lastUpdated: Date;
}

export interface VisitStats {
  totalVisits: number;
  totalRegistrations: number;
  conversionRate: number;
}
