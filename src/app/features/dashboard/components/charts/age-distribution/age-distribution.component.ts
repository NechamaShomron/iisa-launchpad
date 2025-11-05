import { Component, Input, OnInit, HostListener, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Candidate } from '../../../../../models/candidate.model';
import { AGE_BUCKETS, AGE_COLORS } from '../../../../../shared/constants/charts';

@Component({
  selector: 'app-age-distribution',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './age-distribution.component.html',
  styleUrl: './age-distribution.component.scss'
})
export class AgeDistributionComponent implements OnInit, OnChanges {
  @Input() candidates: Candidate[] = [];

  ageColors: string[] = AGE_COLORS;

  ageBarWidth = 320;
  ageBarHeight = 180;
  ageBarPadding: { top: number; right: number; bottom: number; left: number } = {
    top: 12,
    right: 12,
    bottom: 64,
    left: 24
  };
  ageBars: Array<{ x: number; y: number; width: number; height: number; label: string; value: number }> = [];
  xLabelOffset = 0;

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
    const distribution: Record<string, number> = Object.fromEntries(
      AGE_BUCKETS.map(b => [b.label, 0])
    );
    for (const c of this.candidates) {
      for (const b of AGE_BUCKETS) {
        if (c.age >= b.min && c.age <= b.max) {
          distribution[b.label] = (distribution[b.label] || 0) + 1;
          break;
        }
      }
    }
    return AGE_BUCKETS.map(b => ({ age: b.label, count: distribution[b.label] || 0 }));
  }

  private updateAgeBars(): void {
    const distribution = this.getAgeDistribution();
    const labels = distribution.map(d => d.age);
    const values = distribution.map(d => d.count);
    const maxValue = Math.max(1, ...values);

    const { innerWidth, innerHeight, step, barWidth } = this.computeLayout(values.length);

    this.ageBars = values.map((value, index) => {
      const x = this.ageBarPadding.left + index * step + (step - barWidth) / 2;
      const barHeight = (value / maxValue) * innerHeight;
      const y = this.ageBarPadding.top + (innerHeight - barHeight);
      return { x, y, width: barWidth, height: barHeight, label: labels[index], value };
    });
  }

  private updateResponsiveSizes(): void {
    const vw = window.innerWidth || 1024;
    if (vw < 640) {
      this.ageBarWidth = 240;
      this.ageBarHeight = 160;
      this.ageBarPadding = { top: 20, right: 12, bottom: 66, left: 24 };
      this.xLabelOffset = 10;
    } else if (vw < 1024) {
      this.ageBarWidth = 280;
      this.ageBarHeight = 170;
      this.ageBarPadding = { top: 16, right: 12, bottom: 66, left: 22 };
      this.xLabelOffset = 4;
    } else {
      this.ageBarWidth = 320;
      this.ageBarHeight = 180;
      this.ageBarPadding = { top: 12, right: 12, bottom: 70, left: 24 };
      this.xLabelOffset = 0;
    }
  }

  private computeLayout(barCount: number): {
    innerWidth: number;
    innerHeight: number;
    step: number;
    barWidth: number;
  } {
    const innerWidth = this.ageBarWidth - this.ageBarPadding.left - this.ageBarPadding.right;
    const innerHeight = this.ageBarHeight - this.ageBarPadding.top - this.ageBarPadding.bottom;
    const count = Math.max(1, barCount);
    const step = innerWidth / count;
    const gap = Math.min(20, step * 0.35);
    const barWidth = Math.max(6, step - gap);
    return { innerWidth, innerHeight, step, barWidth };
  }
}


