let api = "https://jsonplaceholder.typicode.com/posts";

let form = document.getElementById("post-form");
let message = document.getElementById("message");
let result = document.getElementById("result");


async function sendRequest(url, method, body = null) {
  let options = {
    method: method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  // JSON.stringify() JavaScript object ko JSON text mein convert karta hai.
  // Content-Type batata hai ke request body JSON format mein bheji ja rahi hai.
  if (body !== null) {
    options.body = JSON.stringify(body);
  }

  let response = await fetch(url, options);

  console.log(method + " Status Code:", response.status);

  if (!response.ok) {
    throw new Error("Request failed. Status: " + response.status);
  }

  let data = null;
  let responseText = await response.text();

  if (responseText) {
    data = JSON.parse(responseText);
  }

  return {
    status: response.status,
    data: data,
  };
}

function showResult(action, response) {
  message.innerText = action + " successful!";

  result.innerText = JSON.stringify(
    {
      statusCode: response.status,
      returnedId: response.data ? response.data.id : "No ID returned",
      response: response.data,
    },
    null,
    2,
  );
}

function showError(error) {
  message.innerText = "Error: " + error.message;
  result.innerText = error.message;
  console.log("Error:", error.message);
}

form.addEventListener("submit", async function (event) {
  event.preventDefault();

  let post = {
    title: document.getElementById("title").value,
    body: document.getElementById("content").value,
    userId: Number(document.getElementById("userId").value),
  };

  try {
    message.innerText = "Creating post...";

    let response = await sendRequest(api, "POST", post);

    showResult("POST", response);
  } catch (error) {
    showError(error);
  }
});

document.getElementById("put-btn").addEventListener("click", async function () {
  let post = {
    id: 1,
    title: "Updated Announcement",
    body: "This is the complete replacement post content.",
    userId: 1,
  };

  try {
    message.innerText = "Replacing post...";

    let response = await sendRequest(api + "/1", "PUT", post);

    showResult("PUT", response);
  } catch (error) {
    showError(error);
  }
});

document
  .getElementById("patch-btn")
  .addEventListener("click", async function () {
    let post = {
      title: "Patched Announcement Title",
    };

    try {
      message.innerText = "Updating post title...";

      let response = await sendRequest(api + "/1", "PATCH", post);

      showResult("PATCH", response);
    } catch (error) {
      showError(error);
    }
  });

document
  .getElementById("delete-btn")
  .addEventListener("click", async function () {
    try {
      message.innerText = "Deleting post...";

      let response = await sendRequest(api + "/1", "DELETE");

      showResult("DELETE", response);
    } catch (error) {
      showError(error);
    }
  });
