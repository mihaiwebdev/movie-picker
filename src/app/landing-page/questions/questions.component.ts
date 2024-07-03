import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AccordionModule } from 'primeng/accordion';
@Component({
  selector: 'app-questions',
  standalone: true,
  imports: [AccordionModule, RouterLink],
  templateUrl: './questions.component.html',
  styleUrl: './questions.component.css',
})
export class QuestionsComponent {}
