import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface BrandLogo {
  name: string;
  image_url: string;
}

@Component({
  selector: 'app-brand-logo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './brand-logo.component.html',
  styleUrl: './brand-logo.component.scss',
})
export class BrandLogoComponent {
  @Input({ required: true }) brand!: BrandLogo;
}
