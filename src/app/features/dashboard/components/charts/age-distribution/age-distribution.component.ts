import { Component, Input, OnInit, HostListener, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Candidate } from '../../../../../models/candidate.model';

@Component({
  selector: 'app-age-distribution',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './age-distribution.component.html',
  styleUrl: './age-distribution.component.scss'
})
export class AgeDistributionComponent implements OnInit, OnChanges {
  @Input() candidates: Candidate[] = [];

  ageColors: string[] = ['#818cf8','#a78bfa','#c4b5fd','#f472b6','#fb7185','#fda4af','#93c5fd','#60a5fa'];

  ageBarWidth = 320;
  ageBarHeight = 180;
  ageBarPadding = { top: 12, right: 12, bottom: 64, left: 24 } as any;
  ageBars: Array<{ x: number; y: number; width: number; height: number; label: string; value: number }> = [];

  ngOnInit(): void {
    this.updateResponsiveSizes();
    this.updateAgeBars();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['candidates']) {
      this.updateAgeBars();
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    this.updateResponsiveSizes();
    this.updateAgeBars();
  }

  private getAgeDistribution(): { age: string; count: number }[] {
    const order = ['18–24','25–34','35–44','45–54','55–64','65–74','75–84','85–100'];
    const distribution: { [key: string]: number } = {};
    order.forEach(bucket => distribution[bucket] = 0);
    this.candidates.forEach(c => {
      const age = c.age;
      let bucket = '85–100';
      if (age <= 24) bucket = '18–24';
      else if (age <= 34) bucket = '25–34';
      else if (age <= 44) bucket = '35–44';
      else if (age <= 54) bucket = '45–54';
      else if (age <= 64) bucket = '55–64';
      else if (age <= 74) bucket = '65–74';
      else if (age <= 84) bucket = '75–84';
      distribution[bucket] = (distribution[bucket] || 0) + 1;
    });
    return order.map(age => ({ age, count: distribution[age] || 0 }));
  }

  private updateAgeBars(): void {
    const dist = this.getAgeDistribution();
    const labels = dist.map(d => d.age);
    const values = dist.map(d => d.count);
    const maxVal = Math.max(1, ...values);

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

  private updateResponsiveSizes(): void {
    const vw = window.innerWidth || 1024;
    if (vw < 640) {
      this.ageBarWidth = 240;
      this.ageBarHeight = 160;
      this.ageBarPadding = { top: 20, right: 12, bottom: 66, left: 20 } as any;
    } else if (vw < 1024) {
      this.ageBarWidth = 280;
      this.ageBarHeight = 170;
      this.ageBarPadding = { top: 16, right: 12, bottom: 66, left: 22 } as any;
    } else {
      this.ageBarWidth = 320;
      this.ageBarHeight = 180;
      this.ageBarPadding = { top: 12, right: 12, bottom: 70, left: 24 } as any;
    }
  }
}


