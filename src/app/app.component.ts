import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { timer } from 'rxjs';

export interface Conversion {
  realRate: number;
  fixedRate: number;
  originalCurrency: string;
  desiredAmount: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FormsModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'Convertisseur Euro / Dollar';

  public realRate = signal<number>(1.1);
  public fixedRate: number = 0;

  public originalCurrency = 'eur';
  public desiredCurrency = 'usd';

  public originalAmount: number = 0;
  public desiredAmount: number = 0;

  private max = 0.05;
  private min = -0.05;

  public history: Conversion[] = [];

  ngOnInit(): void {
    timer(0, 3000).subscribe(() =>
      this.realRate.update(rate => {
        return rate + (Math.random() * (this.max - this.min) + this.min);
      })
    );
  }

  convert(): void {
    if (this.originalAmount <= 0) {
      return;
    }

    if (this.originalCurrency == 'eur') {
      this.desiredAmount = this.originalAmount * this.getRate();

    } else if (this.originalCurrency == 'usd') {
      this.desiredAmount = this.originalAmount / this.getRate();
    }

    this.history.push(
      {
        desiredAmount: this.desiredAmount + ' ' + this.desiredCurrency.toUpperCase(),
        fixedRate: this.fixedRate,
        originalCurrency: this.originalAmount + ' ' + this.originalCurrency.toUpperCase(),
        realRate: this.realRate()
      }
    )

    if (this.history.length > 5) {
      this.history = this.history.slice((this.history.length - 5), this.history.length);
    }
  }

  fixRate(): void {
    this.fixedRate = this.realRate();
  }

  switchCurrency(): void {
    let intermediate = this.desiredCurrency;
    this.desiredCurrency = this.originalCurrency;
    this.originalCurrency = intermediate;

    this.desiredAmount = this.originalAmount;
    this.originalAmount = 0;
  }

  private getRate(): number {
    if (this.fixedRate == 0) {
      return this.realRate();

    } else {
      // Calculation of rate of change
      let changeRate = ((this.realRate() / this.fixedRate) - 1) * 100;
      if (Math.abs(changeRate) > 2)
        this.fixedRate = 0;

      return Math.abs(changeRate) > 2 ? this.realRate() : this.fixedRate;
    }
  }
}
