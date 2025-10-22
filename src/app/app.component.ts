import { Component,ElementRef,HostListener, Renderer2  } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
 private glowElement: HTMLElement | null = null;
  private defaultGlowSize = 400; // Match the CSS size

  constructor(private renderer: Renderer2, private el: ElementRef) {}

  ngOnInit() {
    this.glowElement = this.el.nativeElement.querySelector('.cursor-glow');
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (this.glowElement) {
      const glow = this.glowElement;
      
      // Use the element's actual size, or a default if it's not rendered yet
      const glowWidth = glow.offsetWidth || this.defaultGlowSize;
      const glowHeight = glow.offsetHeight || this.defaultGlowSize;

      // Calculate the position to center the glow on the mouse cursor
      const centerX = event.clientX - (glowWidth / 2);
      const centerY = event.clientY - (glowHeight / 2);
      
      // Apply the transform (this moves the element from its top:0; left:0; position)
      this.renderer.setStyle(
        glow, 
        'transform', 
        `translate(${centerX}px, ${centerY}px)`
      );
    }
  }
}
