import { Directive, ElementRef, HostListener, OnInit } from '@angular/core';

@Directive({
  selector: '[appScrollbar]',
  standalone: true
})
export class ScrollbarDirective implements OnInit {
  private scrollTimeout: any;

  constructor(private el: ElementRef) {}

  ngOnInit() {
    // Add custom CSS class for scrollbar styling
    this.el.nativeElement.classList.add('custom-scrollbar');
  }

  @HostListener('scroll', ['$event'])
  onScroll(event: any) {
    // Show scrollbar when scrolling
    this.el.nativeElement.classList.add('scrolling');
    
    // Hide scrollbar after scrolling stops
    clearTimeout(this.scrollTimeout);
    this.scrollTimeout = setTimeout(() => {
      this.el.nativeElement.classList.remove('scrolling');
    }, 1000); // Hide after 1 second of no scrolling
  }

  @HostListener('mouseenter')
  onMouseEnter() {
    // Show scrollbar on hover
    this.el.nativeElement.classList.add('hover');
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    // Hide scrollbar when mouse leaves (unless still scrolling)
    if (!this.el.nativeElement.classList.contains('scrolling')) {
      this.el.nativeElement.classList.remove('hover');
    }
  }
} 