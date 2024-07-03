import {
  Directive,
  ElementRef,
  Renderer2,
  effect,
  inject,
  input,
} from '@angular/core';

@Directive({
  selector: '[appReadMore]',
  standalone: true,
})
export class ReadMoreDirective {
  private readonly el = inject(ElementRef);
  private readonly renderer = inject(Renderer2);

  private truncatedText: string = '';
  private isCollapsed: boolean = true;
  private readMoreButton?: HTMLElement;

  public readonly maxLength = input(100);
  public readonly text = input('');

  constructor() {
    effect(() => {
      this.truncatedText = this.text().substring(0, this.maxLength()) + '...';

      this.setupView();
    });
  }

  private setupView() {
    if (this.text().length > this.maxLength()) {
      this.renderer.setProperty(
        this.el.nativeElement,
        'innerText',
        this.truncatedText,
      );
      this.createButton();
    } else {
      this.renderer.setProperty(
        this.el.nativeElement,
        'innerText',
        this.text(),
      );
      this.removeBtn();
    }
  }

  private createButton() {
    this.removeBtn();

    this.readMoreButton = this.renderer.createElement('button');
    this.readMoreButton!.className = 'read-more-btn';

    this.renderer.setProperty(this.readMoreButton, 'innerText', 'Read More');
    this.renderer.listen(this.readMoreButton, 'click', () => this.toggleView());
    this.renderer.appendChild(
      this.el.nativeElement.parentNode,
      this.readMoreButton,
    );
  }

  private removeBtn() {
    if (this.readMoreButton) {
      this.renderer.removeChild(
        this.el.nativeElement.parentNode,
        this.readMoreButton,
      );
    }
  }

  private toggleView() {
    this.isCollapsed = !this.isCollapsed;
    this.renderer.setProperty(
      this.el.nativeElement,
      'innerText',
      this.isCollapsed ? this.truncatedText : this.text(),
    );
    this.renderer.setProperty(
      this.readMoreButton,
      'innerText',
      this.isCollapsed ? 'Read More' : 'Show Less',
    );
  }
}
