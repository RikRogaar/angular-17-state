import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArticlesService } from '@pages/articles/articles.service';
import { ArticleComponent } from '@components/article/article.component';

@Component({
  selector: 'app-articles',
  standalone: true,
  imports: [
    CommonModule,
    ArticleComponent
  ],
  providers: [
    ArticlesService
  ],
  templateUrl: './articles.component.html',
  styleUrl: './articles.component.scss'
})
export class ArticlesComponent {
  public articlesService = inject(ArticlesService);
}
