import { Component } from '@angular/core';

@Component({
  selector: 'app-admin-footer',
  standalone: true,
  imports: [],
  templateUrl: './admin-footer.component.html',
  styleUrl: './admin-footer.component.scss',
})
export class AdminFooterComponent {
  year = new Date().getFullYear();
  version = '1.0.0';
}
