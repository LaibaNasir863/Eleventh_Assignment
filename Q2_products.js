let api = "https://dummyjson.com/products";

let container = document.getElementById("products-container");
let message = document.getElementById("message");

// GET request
fetch(api)
  .then(function (response) {
    console.log("Status Code:", response.status);

    if (!response.ok) {
      throw new Error("Products load nahi huay");
    }

    return response.json();
  })

  .then(function (data) {
    let products = data.products;

    console.log("First Product Brand:", products[0].brand);

    products = products.slice(0, 6);

    message.innerText = "Products loaded successfully!";

    products.forEach(function (product) {
      let card = document.createElement("div");
      card.className = "product-card";

      if (product.thumbnail) {
        let image = document.createElement("img");
        image.src = product.thumbnail;
        image.alt = product.title;

        card.appendChild(image);
      }

      let title = document.createElement("h3");
      title.innerText = product.title;
      card.appendChild(title);

      let brand = document.createElement("p");
      brand.innerText = "Brand: " + (product.brand || "Not available");
      card.appendChild(brand);

      let price = document.createElement("p");
      price.className = "price";
      price.innerText = "Price: $" + product.price;
      card.appendChild(price);

      container.appendChild(card);
    });
  })

  .catch(function (error) {
    message.innerText = "Error loading products. Please try again.";

    console.log("Error:", error.message);
  });
