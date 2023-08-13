import { Injectable } from "@angular/core";
import { Recipe } from "./recipe.model";
import { Ingredient } from "../shared/ingredient.model";
import { ShoppingListService } from "../shopping-list/shopping-list.service";
import { Subject } from "rxjs";

@Injectable()
export class RecipeService {

    recipesChanged = new Subject<Recipe[]>();

    private recipes: Recipe[] = [];

    // private recipes: Recipe[] = [
    //     new Recipe(
    //         'A Test Recipe 1', 
    //         'This is simply test 1', 
    //         'https://static2.bigstockphoto.com/7/7/2/large2/277713517.jpg', 
    //         [
    //             new Ingredient('Meat', 1),
    //             new Ingredient('Onion', 2),
    //         ]
    //     ),
    //     new Recipe(
    //         'A Test Recipe 2', 
    //         'This is simply test 2', 
    //         'https://www.shutterstock.com/image-vector/lettering-bon-appetit-hand-drawn-600w-753805507.jpg', 
    //         [
    //             new Ingredient('Cream', 3),
    //             new Ingredient('Carrot', 4),
    //         ]
    //     ),
    //     new Recipe(
    //         'Fish 3', 
    //         'This is simply test 3', 
    //         'https://www.freshnlean.com/wp-content/uploads/2021/03/Meal-Plan-plate-protein.png', 
    //         [
    //             new Ingredient('Fish', 1),
    //             new Ingredient('Rice', 5),
    //         ]
    //     ),
    //     new Recipe(
    //         'Smoozie', 
    //         'Best smoozie', 
    //         'https://www.3yummytummies.com/wp-content/uploads/2015/08/Berry-Banana-Yogurt-Smoothie.jpg', 
    //         [
    //             new Ingredient('Strawberry', 3),
    //             new Ingredient('Yoghurt', 1),
    //         ]
    //     )
    // ];

    constructor(private slService: ShoppingListService) {}

    setRecipes(recipes: Recipe[]) {
        this.recipes = recipes;
        this.recipesChanged.next(this.recipes.slice());
    }

    getRecipes() {
        // return a copy of array
        return this.recipes.slice();
    }

    getRecipe(index: number) {
        return this.recipes[index];
    }

    addIngredientsToShoppingList(ingredients: Ingredient[]) {
        this.slService.addIngredients(ingredients);
    }

    addRecipe(recipe: Recipe) {
        this.recipes.push(recipe);
        this.recipesChanged.next(this.recipes.slice());
    }

    updateRecipe(index: number, newRecipe: Recipe) {
        this.recipes[index] = newRecipe;
        this.recipesChanged.next(this.recipes.slice());
    }

    deleteRecipe(index: number) {
        this.recipes.splice(index, 1);
        this.recipesChanged.next(this.recipes.slice());
    }
}