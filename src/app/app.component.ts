import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, computed, inject, signal } from '@angular/core';

interface Project {
  name: string;
  glyph: string;
  tagline: string;
  tech: string[];
  bullets: string[];
  images?: { src: string; alt: string }[];
  link?: string;
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements AfterViewInit, OnDestroy {
  readonly projects: Project[] = [
    {
      name: 'APQP Portal',
      glyph: 'APQP',
      tagline: 'Workflow automation for product quality planning',
      tech: ['Angular 20', '.NET Core', 'Microservices', 'MSSQL', 'Docker', 'SharePoint'],
      bullets: [
        'Developed workflow automation modules using <strong>Angular v20</strong> with dynamic routing & reactive state mgmt.',
        'Implemented <strong>real-time updates</strong> and interactive interfaces to monitor product quality & approval stages.',
        'Built scalable <strong>.NET Core microservices</strong> along with REST APIs enabling seamless communication.',
        'Integrated <strong>SharePoint</strong> for secure document access and storage within APQP workflows.',
        'Containerized services via <strong>Docker</strong> ensuring faster deployments & consistent environments.',
        'Designed maintainable architecture using <strong>abstract classes + interfaces</strong> across modules.',
        'Optimized backend for improved communication & modularity with MSSQL + microservice patterns.'
      ]
    },
    {
      name: 'MSA',
      glyph: 'MSA',
      tagline: 'Measurement System Analysis dashboard',
      tech: ['Angular 11', '.NET Core', 'MSSQL', 'DevExtreme', 'SharePoint'],
      bullets: [
        'Key role in implementing large-scale UI in <strong>Angular 11</strong> with responsive layouts.',
        'Developed <strong>interactive data-driven UI components</strong> to visualize trends & KPIs.',
        'Implemented real-time validation and <strong>Excel-like data handling</strong> for efficient data entry & editing.',
        'Integrated SharePoint at UI level for document access, upload & automated workflows.',
        'Improved performance through <strong>component optimization</strong> & lazy loading strategies.',
        'Worked with backend + QA teams for end-to-end performance tuning.'
      ]
    },
    {
      name: 'Expense Tracker',
      glyph: 'ET',
      tagline: 'Personal finance dashboard',
      tech: ['Angular 19', 'ASP.NET Core 10', 'EF Core', 'SQL Server', 'Docker'],
      bullets: [
        'Built the frontend in <strong>Angular 19</strong> using standalone components and signals.',
        'Developed a <strong>.NET Core 10 REST API</strong> with JWT authentication and EF Core over SQL Server.',
        'Implemented CSV import, per-category monthly budgets, and a dashboard with trend & breakdown charts.',
        'Containerized with <strong>Docker</strong> and documented for one-command local setup.'
      ],
      images: [
        { src: 'expense-tracker/dashboard.png', alt: 'Expense Tracker dashboard with income/expense summary and charts' },
        { src: 'expense-tracker/transactions.png', alt: 'Expense Tracker transactions list with filters' },
        { src: 'expense-tracker/budgets.png', alt: 'Expense Tracker monthly budgets with progress bars' }
      ],
      link: 'https://github.com/abhii121/Expense-Tracker-project'
    }
  ];

  readonly activeProject = signal(0);
  readonly current = computed(() => [this.projects[this.activeProject()]]);

  private readonly host = inject(ElementRef).nativeElement as HTMLElement;
  private readonly zone = inject(NgZone);

  private reduceMotion = false;
  private rafId = 0;
  private tiltEl: HTMLElement | null = null;

  private glowEl: HTMLElement | null = null;
  private heroEl: HTMLElement | null = null;
  private progressEl: HTMLElement | null = null;
  private floorEl: HTMLElement | null = null;
  private trackEl: HTMLElement | null = null;
  private depthEls: HTMLElement[] = [];
  private ringCards: HTMLElement[] = [];

  ngAfterViewInit(): void {
    this.reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const q = <T extends HTMLElement>(sel: string) => this.host.querySelector(sel) as T | null;
    this.glowEl = q('.cursor-glow');
    this.heroEl = q('.hero-section');
    this.progressEl = q('.scroll-progress span');
    this.floorEl = q('.grid-floor');
    this.trackEl = q('.projects-track');
    this.depthEls = Array.from(this.host.querySelectorAll<HTMLElement>('.depth'));
    this.ringCards = Array.from(this.host.querySelectorAll<HTMLElement>('.ring-card'));

    this.zone.runOutsideAngular(() => {
      window.addEventListener('scroll', this.requestUpdate, { passive: true });
      window.addEventListener('resize', this.requestUpdate, { passive: true });
      document.addEventListener('mousemove', this.onMouseMove, { passive: true });
      document.addEventListener('mouseleave', this.resetTilt);
    });

    this.update();
  }

  ngOnDestroy(): void {
    window.removeEventListener('scroll', this.requestUpdate);
    window.removeEventListener('resize', this.requestUpdate);
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseleave', this.resetTilt);
    cancelAnimationFrame(this.rafId);
  }

  goToProject(index: number): void {
    const track = this.trackEl;
    if (!track) return;
    const travel = track.offsetHeight - window.innerHeight;
    const top = track.getBoundingClientRect().top + window.scrollY;
    const target = top + (index / (this.projects.length - 1)) * travel;
    window.scrollTo({ top: target, behavior: this.reduceMotion ? 'auto' : 'smooth' });
  }

  private requestUpdate = (): void => {
    if (!this.rafId) {
      this.rafId = requestAnimationFrame(() => {
        this.rafId = 0;
        this.update();
      });
    }
  };

  private update(): void {
    const vh = window.innerHeight;
    const sy = window.scrollY;
    const max = document.documentElement.scrollHeight - vh;

    if (this.progressEl) {
      this.progressEl.style.transform = `scaleX(${max > 0 ? clamp(sy / max, 0, 1) : 0})`;
    }
    if (this.reduceMotion) return;

    this.heroEl?.style.setProperty('--sy', String(Math.round(sy)));
    if (this.floorEl) {
      this.floorEl.style.backgroundPositionY = `${(sy * 0.35) % 64}px`;
    }

    for (const el of this.depthEls) {
      const r = el.getBoundingClientRect();
      const enter = clamp((vh - r.top) / (vh * 0.55), 0, 1);
      const leave = clamp((vh * 0.3 - r.bottom) / (vh * 0.4), 0, 1);

      if (leave > 0) {
        el.style.transformOrigin = '50% 100%';
        el.style.transform = `perspective(1200px) translateZ(${leave * 260}px) rotateX(${leave * -8}deg)`;
        el.style.opacity = String(1 - leave);
      } else if (enter < 1) {
        const k = Math.pow(1 - enter, 1.6);
        el.style.transformOrigin = '50% 0%';
        el.style.transform = `perspective(1200px) translateZ(${-k * 420}px) rotateX(${k * 16}deg)`;
        el.style.opacity = String(clamp(enter * 1.5, 0, 1));
      } else {
        el.style.transform = 'none';
        el.style.opacity = '1';
      }
    }

    this.updateRing(vh);
  }

  private updateRing(vh: number): void {
    const track = this.trackEl;
    if (!track || !track.offsetParent) return;

    const r = track.getBoundingClientRect();
    const travel = r.height - vh;
    const progress = travel > 0 ? clamp(-r.top / travel, 0, 1) : 0;
    const pos = progress * (this.projects.length - 1);

    this.ringCards.forEach((card, i) => {
      const d = i - pos;
      const ad = Math.abs(d);
      card.style.transform = `rotateY(${d * 55}deg) translateZ(380px)`;
      card.style.opacity = String(clamp(1 - ad * 0.35, 0.25, 1));
      card.style.filter = `brightness(${clamp(1 - ad * 0.45, 0.45, 1)})`;
    });

    const idx = Math.round(pos);
    if (idx !== this.activeProject()) {
      this.zone.run(() => this.activeProject.set(idx));
    }
  }

  private onMouseMove = (e: MouseEvent): void => {
    if (this.glowEl) {
      const w = this.glowEl.offsetWidth || 400;
      const h = this.glowEl.offsetHeight || 400;
      this.glowEl.style.transform = `translate(${e.clientX - w / 2}px, ${e.clientY - h / 2}px)`;
    }
    if (this.reduceMotion) return;

    this.heroEl?.style.setProperty('--mx', ((e.clientX / window.innerWidth - 0.5) * 2).toFixed(3));
    this.heroEl?.style.setProperty('--my', ((e.clientY / window.innerHeight - 0.5) * 2).toFixed(3));

    const t = (e.target as HTMLElement | null)?.closest?.('.tilt') as HTMLElement | null;
    if (t !== this.tiltEl) {
      this.resetTilt();
      this.tiltEl = t;
    }
    if (t) {
      const r = t.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      t.style.setProperty('--ry', `${(px * 10).toFixed(2)}deg`);
      t.style.setProperty('--rx', `${(-py * 10).toFixed(2)}deg`);
    }
  };

  private resetTilt = (): void => {
    if (this.tiltEl) {
      this.tiltEl.style.setProperty('--rx', '0deg');
      this.tiltEl.style.setProperty('--ry', '0deg');
      this.tiltEl = null;
    }
  };
}
