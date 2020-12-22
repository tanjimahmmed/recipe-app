const mealsEl = document.getElementById('meals');
const favoriteContainer = document.getElementById("fav_meals");

const mealPopup = document.getElementById('meal_popup');
const mealInfoEl = document.getElementById('meal_info');
const popupCloseBtn = document.getElementById('close_popup');

const searchTerm = document.getElementById("search_term");
const searchBtn = document.getElementById("search");

getRandomMeal();
fetchFavMeals();

async function getRandomMeal() {
    const resp = await fetch("https://www.themealdb.com/api/json/v1/1/random.php");
    const respData = await resp.json();
    const randomMeal = respData.meals[0];

    addMeal(randomMeal, true);
    // loadRandomMeal();
}

async function getMealById(id) {
    const resp = await fetch("https://www.themealdb.com/api/json/v1/1/lookup.php?i=" + id);

    const respData = await resp.json();
    const meal = respData.meals[0];

    return meal;
}

async function getMealBySearch(term) {
    const resp = await fetch("https://www.themealdb.com/api/json/v1/1/search.php?s=" + term);

    const respData = await resp.json();
    const meals = respData.meals;

    return meals;
}

function addMeal(mealData, random = false) {
    console.log(mealData);
    const meal = document.createElement('div');
    meal.classList.add('meal');

    meal.innerHTML = `
    <div class="meal_header">
        ${random ? `<span class="random">Random Recipe</span>` : ''}
        <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}">
    </div>
    <div class="meal_body">
        <h4>${mealData.strMeal}</h4>
        <button class="fav_btn"><i class="fas fa-heart"></i></button>
    </div>
    `;

    const btn = meal.querySelector(".meal_body .fav_btn");

    btn.addEventListener("click", () => {
        if (btn.classList.contains("active")) {
            removeMealLS(mealData.idMeal)
            btn.classList.remove("active");
        } else {
            addMealLS(mealData.idMeal)
            btn.classList.add("active");
        }

        fetchFavMeals();
    });

    meal.addEventListener("click", () => {
        showMealInfo(mealData);
    });

    mealsEl.appendChild(meal);
}

function addMealLS(mealId) {
    const mealIds = getMealsLS();

    localStorage.setItem('mealIds', JSON.stringify([...mealIds, mealId]));
}

function removeMealLS(mealId) {
    const mealIds = getMealsLS();

    localStorage.setItem(
        "mealIds",
        JSON.stringify(mealIds.filter((id) => id !== mealId))
    );
}

function getMealsLS() {
    const mealIds = JSON.parse(localStorage.getItem('mealIds'));

    return mealIds === null ? [] : mealIds;
}

async function fetchFavMeals() {
    // clean the container
    favoriteContainer.innerHTML = "";

    const mealIds = getMealsLS();

    for (let i = 0; i < mealIds.length; i++) {
        const mealId = mealIds[i];
        meal = await getMealById(mealId); 

        addMealFav(meal)
    }

}

function addMealFav(mealData) {
 
    const favMeal = document.createElement('li');

    favMeal.innerHTML = `
    <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}"><span>${mealData.strMeal}</span><button class="clear"><i class="fas fa-window-close"></i></button>
    `;

    const btn = favMeal.querySelector(".clear");

    btn.addEventListener("click", () => {
        removeMealLS(mealData.idMeal);

        fetchFavMeals();
    });

    favMeal.addEventListener("click", () => {
        showMealInfo(mealData);
    });


    favoriteContainer.appendChild(favMeal);
}

function showMealInfo(mealData) {
    // clean it up
    mealInfoEl.innerHTML = "";

    // update the meal info
    const mealEl = document.createElement('div');

    const ingredients = [];
    // get ingredients
    for(let i=1; i<=20; i++) {
        if(mealData['strIngredient'+i]) {
            ingredients.push(`${mealData['strIngredient'+i]} - ${mealData['strMeasure'+i]}`)
        }else {
            break;
        }
    }

    mealEl.innerHTML = `
        <h1>${mealData.strMeal}</h1>
        <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}">
        <p>
        ${mealData.strInstructions}
        </p>
        <h3>Ingredient:</h3>
        <ul>
        ${ingredients.map((ing) => `<li>${ing}</li>`).join("")}
        </ul>
  
    `;

    mealInfoEl.appendChild(mealEl);

    // show the popup
    mealPopup.classList.remove('hidden')
}

searchBtn.addEventListener('click', async () => {

    // clean container
    mealsEl.innerHTML = "";
    const search = searchTerm.value;

    const meals = await await getMealBySearch(search);

    if(meals){
        meals.forEach(meal => {
            addMeal(meal);
        });
    }
});

// popup box

popupCloseBtn.addEventListener('click', () => {
    mealPopup.classList.add('hidden');
})