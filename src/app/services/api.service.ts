import { Injectable } from "@angular/core";
import { Article } from "@interfaces/article";
import { of, delay, switchMap, throwError, Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private articles: Article[] = [
    { id: 1, title: "Getting Started with Angular: A Beginner's Guide" },
    { id: 2, title: "Angular Components: Building Blocks of Web Apps" },
    { id: 3, title: "Angular Services and Dependency Injection Explained" },
    { id: 4, title: "Routing in Angular: Navigating Through Your App" },
    { id: 5, title: "Angular Directives: Enhancing HTML with Power" },
    { id: 6, title: "Angular Forms: From Basics to Advanced Techniques" },
    { id: 7, title: "Testing Angular Applications: Best Practices and Tools" },
    { id: 8, title: "State Management in Angular: A Comprehensive Guide" },
    { id: 9, title: "Angular and RESTful APIs: Making HTTP Requests" },
    { id: 10, title: "Angular Best Practices: Writing Clean and Maintainable Code" },
  ];

  // We are returning of() to represent a mock api call & response.
  public getArticles(): Observable<Article[]> {
    const error = JSON.stringify({ message: "Error 400 | Bad request" });

    return of(this.articles).pipe(
        delay(500),
        switchMap(() =>
          Math.random() < 0.2 ? throwError(() => error) : of(this.articles)
        )
      );
  }

  public deleteArticle(id: Article['id']): Observable<Article> {
    const article = this.articles.find((article) => article.id === id);
    const error = JSON.stringify({ id, message: "Error 400 | Bad request" });

    if (article) {
      return of(article).pipe(
          delay(500),
          switchMap(() =>
            Math.random() < 0.2 ? throwError(() => error) : of(article)
          )
        );
    }

    return throwError(() => error);
  }
}