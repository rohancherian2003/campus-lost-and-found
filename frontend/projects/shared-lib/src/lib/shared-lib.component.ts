import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'lib-shared-lib',
  standalone: true,
  imports: [CommonModule],
  template: `
    <p>
      shared-lib works!
    </p>
  `,
  styles: [
  ]
})
export class SharedLibComponent {

}
