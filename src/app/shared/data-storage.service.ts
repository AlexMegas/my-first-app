import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Recipe } from "../recipes/recipe.model";
import { RecipeService } from "../recipes/recipe.service";
import { map, tap } from "rxjs/operators";
import { AuthService } from "../auth/auth.service";

@Injectable({providedIn: 'root'}) // or add in app.module in providers[]
export class DataStorageService {

  FIREBASE_URL: string = 'https://ng-course-recipe-book-d0f48-default-rtdb.firebaseio.com/recipes.json';

  constructor(private http: HttpClient,
              private recipeService: RecipeService,
              private authService: AuthService
  ) {}

  storeRecipes() {
    const recipes = this.recipeService.getRecipes();
    this.http.put(this.FIREBASE_URL, recipes)
      .subscribe(response => {
      });
  }
  
  fetchRecipes() {
    return this.http
      .get<Recipe[]>(
        this.FIREBASE_URL
      )
      .pipe(
        map(recipes => { //rxjs
          return recipes.map(recipe => { //map for Array in javascript
            return {
              ...recipe, 
              ingredients: recipe.ingredients ? recipe.ingredients : [] //ingredients: recipe.ingredients || []
            };
          });
        }),
        tap(recipes => {
          this.recipeService.setRecipes(recipes);
        })
      )
  }

}