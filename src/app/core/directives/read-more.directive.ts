import {
  AfterViewInit,
  Directive,
  ElementRef,
  Renderer2,
  inject,
  input,
} from '@angular/core';

@Directive({
  selector: '[appReadMore]',
  standalone: true,
})
export class ReadMoreDirective implements AfterViewInit {
  private readonly el = inject(ElementRef);
  private readonly renderer = inject(Renderer2);

  private originalText: string = '';
  private truncatedText: string = '';
  private isCollapsed: boolean = true;
  private readMoreButton?: HTMLElement;

  public readonly maxLength = input(100);

  ngAfterViewInit(): void {
    this.originalText = this.el.nativeElement.innerText;
    this.truncatedText =
      this.originalText.substring(0, this.maxLength()) + '...';
    this.setupView();
  }

  private setupView() {
    if (this.originalText.length > this.maxLength()) {
      this.renderer.setProperty(
        this.el.nativeElement,
        'innerText',
        this.truncatedText,
      );
      this.createButton();
    }
  }

  private createButton() {
    this.readMoreButton = this.renderer.createElement('button');
    this.readMoreButton!.className = 'read-more-btn';

    this.renderer.setProperty(this.readMoreButton, 'innerText', 'Read More');
    this.renderer.listen(this.readMoreButton, 'click', () => this.toggleView());
    this.renderer.appendChild(
      this.el.nativeElement.parentNode,
      this.readMoreButton,
    );
  }

  private toggleView() {
    this.isCollapsed = !this.isCollapsed;
    this.renderer.setProperty(
      this.el.nativeElement,
      'innerText',
      this.isCollapsed ? this.truncatedText : this.originalText,
    );
    this.renderer.setProperty(
      this.readMoreButton,
      'innerText',
      this.isCollapsed ? 'Read More' : 'Show Less',
    );
  }
}
