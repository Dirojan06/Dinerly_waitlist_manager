import { Component } from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';
import { WaitListAdminService } from 'src/app/services/wait-list-admin.service';

@Component({
  selector: 'app-admin-reports',
  templateUrl: './admin-reports.component.html',
  styleUrls: ['./admin-reports.component.css']
})
export class AdminReportsComponent {
  restaurantId = 1;
  isLoading = false;
  reportData: any;
  fromDate = '';
  toDate = '';
  doughnutChartType: 'doughnut' = 'doughnut';
  doughnutChartData: ChartData<'doughnut'> = {
  labels: ['Seated', 'Waiting', 'Notified', 'Cancelled'],
  datasets: [
    {
      data: [],
      backgroundColor: [
        '#6d28d9',
        '#22c55e',
        '#0ea5e9',
        '#f43f5e'
      ],
      borderColor: '#ffffff',
      borderWidth: 6,
      hoverOffset: 18
    }
  ]
};

  doughnutChartOptions: ChartOptions<'doughnut'> = {
  responsive: true,
  cutout: '62%',
  plugins: {
    legend: {
      display: false
    }
  }
};

  constructor(private waitlistService: WaitListAdminService) {}

  ngOnInit(): void {
    this.loadReports();
  }

  loadReports(): void {

    this.isLoading = true;
    this.waitlistService.getRestaurantReports(this.restaurantId,this.fromDate || undefined,this.toDate || undefined).subscribe({
        next: (res) => {
          this.isLoading = false;
          if (res.success) {
            this.reportData = res.data;
            this.updateChart();
          }
        },

        error: () => {
          this.isLoading = false;
          alert('Unable to load reports');
        }
      });
  }

  updateChart(): void {
    const data = this.reportData;
    this.doughnutChartData = {
      labels: ['Seated', 'Waiting', 'Notified', 'Cancelled'],
      datasets: [
        {
          data: [
            data.totalSeated || 0,
            data.totalWaiting || 0,
            data.totalNotified || 0,
            data.totalCancelled || 0
          ],

          backgroundColor: [
            '#6d28d9',
            '#22c55e',
            '#0ea5e9',
            '#f43f5e'
          ],
          borderColor: '#ffffff',
          borderWidth: 6,
          hoverOffset: 18
        }
      ]
    };
  }

  getTotalChartValue(): number {
    if (!this.reportData) return 0;
    return (
      (this.reportData.totalSeated || 0) +
      (this.reportData.totalWaiting || 0) +
      (this.reportData.totalNotified || 0) +
      (this.reportData.totalCancelled || 0)
    );
  }

  getPercent(value: number): number {
    const total = this.getTotalChartValue();
    if (!total) return 0;
    return Math.round((value / total) * 100);
  }
}
