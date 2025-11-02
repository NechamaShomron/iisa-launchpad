import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Candidate } from '../../../../../models/candidate.model';

@Component({
  selector: 'app-registration-trend',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './registration-trend.component.html',
  styleUrl: './registration-trend.component.scss'
})
export class RegistrationTrendComponent implements OnInit, OnChanges {
  @Input() candidates: Candidate[] = [];

  labels: string[] = [];
  values: number[] = [];
  pathD: string = '';
  areaD: string = '';
  yTicks: number[] = [];
  points: Array<{ x: number; y: number }> = [];
  labelPositions: Array<{ x: number; y: number }> = [];
  gridLines: Array<{ y1: number; y2: number; labelY: number; value: number }> = [];
  showLabel: boolean[] = [];
  hoveredIndex: number | null = null;

  readonly width = 260;
  readonly height = 140;
  readonly padding = { top: 10, right: 10, bottom: 32, left: 18 };

  ngOnInit(): void {
    // Always initialize - even with empty data, we want to show the grid
    this.computeData();
    this.computePath();
  }

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
      const key = d.toISOString().slice(0, 10);
      buckets[key] = 0;
      const label = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
      // Always store the label for hover, but mark which ones to show by default
      this.labels.push(label);
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
    
    // Calculate point positions
    this.points = values.map((v, i) => {
      const x = this.padding.left + i * stepX;
      const y = this.padding.top + (1 - v / maxVal) * h;
      return { x, y };
    });
    
    // Calculate label positions
    this.labelPositions = this.labels.map((_, i) => {
      const x = this.padding.left + (this.width - this.padding.left - this.padding.right) / (values.length - 1 || 1) * i;
      const y = this.height - 6;
      return { x, y };
    });
    
    // Determine which labels to show by default (first and last)
    const lastIndex = values.length - 1;
    this.showLabel = this.labels.map((_, i) => i === 0 || i === lastIndex);
    
    // Build path strings
    this.pathD = this.points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ');
    if (this.points.length > 0) {
      const first = this.points[0];
      const last = this.points[this.points.length - 1];
      this.areaD = `${this.pathD} L ${last.x} ${this.padding.top + h} L ${first.x} ${this.padding.top + h} Z`;
    } else {
      this.areaD = '';
    }
    
    // Calculate Y ticks and grid lines
    const tickCount = 4;
    this.yTicks = Array.from({ length: tickCount + 1 }, (_, i) => Math.round((maxVal * i) / tickCount));
    const maxTick = this.yTicks[this.yTicks.length - 1] || 1;
    this.gridLines = this.yTicks.map(t => {
      const y = this.padding.top + (1 - t / maxTick) * h;
      return {
        y1: y,
        y2: y,
        labelY: y + 4,
        value: t
      };
    });
  }
}


