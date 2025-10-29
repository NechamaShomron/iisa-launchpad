import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reg-visits-donut',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reg-visits-donut.component.html',
  styleUrl: './reg-visits-donut.component.scss'
})
export class RegVisitsDonutComponent implements OnChanges {
  @Input() totalRegistrations: number = 0;
  @Input() totalVisits: number = 0;

  regPieSize = 100;
  regPieRadius = 35;
  regPercent = 0;
  regCircumference = 2 * Math.PI * this.regPieRadius;

  ngOnChanges(): void {
    const visited = Math.max(0, this.totalVisits || 0);
    const registered = Math.max(0, this.totalRegistrations || 0);
    const total = Math.max(visited, registered, 1);
    this.regPercent = registered / total;
    this.regCircumference = 2 * Math.PI * this.regPieRadius;
  }
}


