let api = "https://dummyjson.com/recipes";

let container = document.getElementById("recipes-container");
let message = document.getElementById("message");
let details = document.getElementById("recipe-details");

async function getRecipes() {
  try {
    let response = await fetch(api);

    console.log("Status Code:", response.status);

    if (!response.ok) {
      throw new Error("Recipes load nahi ho sakin.");
    }

    let data = await response.json();

    let recipes = data.recipes;

    recipes = recipes.slice(0, 6);

    message.innerText = "Recipes loaded successfully!";

    recipes.forEach(function (recipe) {
      let card = document.createElement("div");
      card.className = "recipe-card";

      let image = document.createElement("img");
      image.src = recipe.image;
      image.alt = recipe.name;
      card.appendChild(image);

      let title = document.createElement("h3");
      title.innerText = recipe.name;
      card.appendChild(title);

      let cuisine = document.createElement("p");
      cuisine.innerText = "Cuisine: " + recipe.cuisine;
      card.appendChild(cuisine);

      let time = document.createElement("p");
      time.innerText =
        "Preparation Time: " +
        (recipe.prepTimeMinutes ?? "Not available") +
        " minutes";
      card.appendChild(time);

      let button = document.createElement("button");
      button.innerText = "View Ingredients";

      button.addEventListener("click", function () {
        showIngredients(recipe);
      });

      card.appendChild(button);

      container.appendChild(card);
    });
  } catch (error) {
    message.innerText =
      "Unable to load recipes. Please check your internet and try again.";

    console.log("Error:", error.message);
  }
}

function showIngredients(recipe) {
  details.innerHTML = "";

  let title = document.createElement("h2");
  title.innerText = recipe.name + " - Ingredients";
  details.appendChild(title);

  let list = document.createElement("ul");

  recipe.ingredients.forEach(function (ingredient) {
    let item = document.createElement("li");
    item.innerText = ingredient;
    list.appendChild(item);
  });

  details.appendChild(list);

  details.scrollIntoView({
    behavior: "smooth",
  });
}

getRecipes();
