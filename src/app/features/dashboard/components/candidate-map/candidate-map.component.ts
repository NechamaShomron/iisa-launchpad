import { Component, Input, OnInit, OnDestroy, AfterViewInit, OnChanges, SimpleChanges, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Candidate } from '../../../../models/candidate.model';
import { MatIconModule } from '@angular/material/icon';
import * as L from 'leaflet';

@Component({
  selector: 'app-candidate-map',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './candidate-map.component.html',
  styleUrl: './candidate-map.component.scss'
})
export class CandidateMapComponent implements OnInit, OnDestroy, AfterViewInit, OnChanges {
  @Input() candidates: Candidate[] = [];
  
  private map?: L.Map;
  private markers: L.Marker[] = [];
  
  ngOnInit(): void {
    // Map initialization happens in AfterViewInit
  }
  
  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initMap();
      setTimeout(() => this.map?.invalidateSize(), 100);
      setTimeout(() => this.map?.invalidateSize(), 300);
    }, 100);
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    setTimeout(() => this.map?.invalidateSize(), 50);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['candidates'] && this.map) {
      this.addCandidateMarkers();
      setTimeout(() => this.map?.invalidateSize(), 50);
    }
  }
  
  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }
  
  private initMap(): void {
    // Initialize map centered on Israel
    this.map = L.map('candidateMap').setView([31.5, 34.75], 7);
    
    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);
    
    // Force a size recalculation after tiles attach
    this.map.invalidateSize();
    
    // Add markers for candidates
    this.addCandidateMarkers();
  }
  
  private addCandidateMarkers(): void {
    if (!this.map) return;
    
    // Clear existing markers
    this.markers.forEach(marker => marker.remove());
    this.markers = [];
    
    if (!this.candidates || this.candidates.length === 0) {
      return;
    }
    
    // City coordinates (approximate locations)
    const cityCoordinates: { [key: string]: [number, number] } = {
      'Tel Aviv': [32.08, 34.78],
      'Jerusalem': [31.77, 35.21],
      'Haifa': [32.82, 34.99],
      'Beer Sheva': [31.25, 34.79],
      'Netanya': [32.33, 34.85],
      'Ashkelon': [31.66, 34.57],
      'Rehovot': [31.89, 34.81],
      'Rishon LeZion': [31.96, 34.80],
      'Petah Tikva': [32.09, 34.88],
      'Ashdod': [31.79, 34.65],
      'Ramat Gan': [32.08, 34.82],
      'Bnei Brak': [32.09, 34.83],
      'Herzliya': [32.16, 34.84],
      'Modiin': [31.89, 35.00],
      'Kfar Saba': [32.17, 34.93],
      'Ramat Hasharon': [32.14, 34.84],
      'Bat Yam': [32.02, 34.74],
      'Holon': [32.01, 34.77],
      'Givatayim': [32.07, 34.81],
      'Or Yehuda': [32.03, 34.86],
    };
    
    // Group candidates by city
    const cityGroups = new Map<string, Candidate[]>();
    this.candidates.forEach(candidate => {
      const city = candidate.city;
      if (!cityGroups.has(city)) {
        cityGroups.set(city, []);
      }
      cityGroups.get(city)!.push(candidate);
    });
    
    // Create markers for each city with candidates
    cityGroups.forEach((candidates, city) => {
      const coordinates = cityCoordinates[city] || [31.5, 34.75];
      
      const customIcon = L.divIcon({
        className: 'custom-marker',
        html: `<div class="marker-content">${candidates.length}</div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });
      
      const marker = L.marker(coordinates, { icon: customIcon })
        .addTo(this.map!)
        .bindPopup(`
          <div class="city-popup">
            <h3>${city}</h3>
            <p>${candidates.length} candidate${candidates.length > 1 ? 's' : ''}</p>
            <ul>
              ${candidates.slice(0, 5).map(c => `<li>${c.fullName}</li>`).join('')}
              ${candidates.length > 5 ? `<li>...and ${candidates.length - 5} more</li>` : ''}
            </ul>
          </div>
        `);
      
      this.markers.push(marker);
    });
  }
}


