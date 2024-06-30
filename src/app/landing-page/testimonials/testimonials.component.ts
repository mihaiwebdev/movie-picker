import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  ViewChild,
} from '@angular/core';

@Component({
  selector: 'app-testimonials',
  standalone: true,
  imports: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './testimonials.component.html',
  styleUrl: './testimonials.component.css',
})
export class TestimonialsComponent {
  public readonly testimonials = [
    {
      name: 'x_Coding',
      id: '@MrxCoding',
      text: '',
      img: 'x_coding.jpg',
    },
    {
      name: 'Venus',
      id: '@venusbhatia',
      text: `"Thanks for giving the opportunity be an early tester..You and Mihai
          have put great efforts in making this and it\'s visible in it!UI is
          pretty smooth even though being on web. I liked it so much. Loved the
          carousel on the home screen so much btw, so much that I want to learn
          how to implement in an iOS app!"`,
      img: 'venus.jpg',
    },
    {
      name: 'Harun',
      id: '@haruncodes',
      text: `"On mobile that animation is amazing!! It's perfect. Keep at it! I
          wanna use it when its ready!"`,
      img: 'Harun.jpg',
    },

    {
      name: 'DevHQ',
      id: '@codezonn',
      text: `"You did an excellent work. The background of each movie and the
          little summary writen about each movies, the transition from a movie
          to another, gave me the desire to start watching them immediatley.
          Another thing I love about it is that the search algorithm doesn't
          take too much time to load the requested movies. I find the app super
          attractive, easy to use for a first user and a big kudos for the
          quick. Can't wait to see the finaly version of the app and I would be
          glad to be the first user!"`,
      img: 'Dev.jpg',
    },
    {
      name: 'Krish',
      id: '@krishfromasap',
      text: `"Seems like your hard work will pay off. I really like it.I am always
          confused with what movie to watch on Netflix hahaha so this is a life
          saver and I find it really helpful that you can combine more than one
          genre to find a movie"`,
      img: 'Krish.jpg',
    },
    {
      name: 'Arjun Rathod',
      id: '@ArjunRa87193765',
      text: `"Hey the UI looks great and catchy.Making a movie picker was a good
          idea and your implimentation looks cool.Can't wait for final
          product!"`,
      img: 'Arjun.jpg',
    },
    {
      name: 'Harmeet Singh',
      id: '@ImHarmeet_Singh',
      text: `I really like the concept of the app. The design is visually
          appealing, and the dropdown animation is smooth, which I
          appreciate.I'm excited to see the app evolve into its final
          phase."`,
      img: 'Haarmet.jpg',
    },
    {
      name: 'MedaFarcas',
      id: '@MedaFarcas',
      text: `"I'm truly impressed by the attention to details, especially
          integrating TMDb ratings for quality content, cause it's simplifying
          the search for quality content. Additionally, the ability to combine
          platforms is a game changer for those with multiple subscriptions.
          Thanks for these helpful features!"`,
      img: 'Meda.jpg',
    },
  ];
  // SWIPER Config
  public readonly breakpoints = {
    slidesPerView: 3,
    spaceBetween: 20,
    breakpoints: {
      320: {
        slidesPerView: 4,
        spaceBetween: 30,
      },
      480: {
        slidesPerView: 5,
        spaceBetween: 40,
      },
      640: {
        slidesPerView: 6,
        spaceBetween: 40,
      },

      780: {
        slidesPerView: 7,
        spaceBetween: 50,
      },
      920: {
        slidesPerView: 8,
        spaceBetween: 50,
      },
      1100: {
        slidesPerView: 9,
        spaceBetween: 50,
      },
    },
  };

  @ViewChild('testimonialsSwiper') testimonialsSwiper?: ElementRef;

  ngAfterViewInit() {
    // Object.assign(this.testimonialsSwiper?.nativeElement, this.breakpoints);
  }
}
