import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  year = new Date().getFullYear();

  meta = ['Replies within 6 hrs', 'NDA on request', 'Paid in USD / EUR / GBP / INR'];

  pages = [
    { label: 'Work', path: '/work' },
    { label: 'Services', path: '/services' },
    { label: 'About', path: '/about' },
    { label: 'Pricing', path: '/pricing' },
    { label: 'Journal', path: '/journal' },
    { label: 'Contact', path: '/contact' },
  ];

  services = ['Brand films', 'Short-form / Reels', 'YouTube editing', 'Colour grading', 'Motion & VFX', 'Sound design'];

  socials = [
    { label: 'LinkedIn', text: 'in', href: '#' },
    { label: 'YouTube', text: '▶', href: '#' },
    { label: 'Behance', text: 'Be', href: '#' },
    { label: 'Vimeo', text: 'Vim', href: '#' },
  ];

  legal = ['Privacy', 'Terms', 'Licensing'];
}