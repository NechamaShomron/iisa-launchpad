import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Candidate } from '../../models/candidate.model';

@Component({
  selector: 'app-registration-trend',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './registration-trend.component.html',
  styleUrl: './registration-trend.component.scss'
})
export class RegistrationTrendComponent implements OnChanges {
  @Input() candidates: Candidate[] = [];

  // Chart data
  labels: string[] = [];
  values: number[] = [];
  pathD: string = '';
  areaD: string = '';
  yTicks: number[] = [];

  readonly width = 600; // logical viewport; CSS can scale
  readonly height = 240;
  readonly padding = { top: 16, right: 24, bottom: 28, left: 28 };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['candidates']) {
      this.computeData();
      this.computePath();
    }
  }

  private computeData(): void {
    const today = new Date();
    const days = 30;
    const dayMs = 24 * 60 * 60 * 1000;
    const buckets: Record<string, number> = {};
    this.labels = [];

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today.getTime() - i * dayMs);
      const key = d.toISOString().slice(0, 10); // YYYY-MM-DD
      buckets[key] = 0;
      const label = `${(d.getMonth() + 1).toString().padStart(2, '0')}/${d
        .getDate()
        .toString()
        .padStart(2, '0')}`;
      // show weekly labels
      if (i % 7 === 0 || i === days - 1 || i === 0) {
        this.labels.push(label);
      } else {
        this.labels.push('');
      }
    }

    this.candidates.forEach(c => {
      const key = new Date(c.registrationDate).toISOString().slice(0, 10);
      if (key in buckets) buckets[key] += 1;
    });

    this.values = Object.values(buckets);
  }

  private computePath(): void {
    const values = this.values.length ? this.values : [0];
    const maxVal = Math.max(1, ...values);

    const w = this.width - this.padding.left - this.padding.right;
    const h = this.height - this.padding.top - this.padding.bottom;
    const stepX = w / (values.length - 1 || 1);

    const points = values.map((v, i) => {
      const x = this.padding.left + i * stepX;
      const y = this.padding.top + (1 - v / maxVal) * h;
      return { x, y };
    });

    // Build line path
    this.pathD = points
      .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
      .join(' ');

    // Build area path (to x-axis)
    if (points.length > 0) {
      const first = points[0];
      const last = points[points.length - 1];
      this.areaD = `${this.pathD} L ${last.x} ${this.padding.top + h} L ${first.x} ${
        this.padding.top + h
      } Z`;
    } else {
      this.areaD = '';
    }

    // y ticks 0..max
    const tickCount = 4;
    this.yTicks = Array.from({ length: tickCount + 1 }, (_, i) => Math.round((maxVal * i) / tickCount));
  }
}
