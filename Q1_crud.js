
const API_URL = "https://jsonplaceholder.typicode.com/posts";
const POSTS_URL = `${API_URL}?_limit=6`;

const postForm = document.getElementById("post-form");
const titleInput = document.getElementById("post-title");
const userIdInput = document.getElementById("user-id");
const bodyInput = document.getElementById("post-body");

const addButton = document.getElementById("add-button");
const reloadButton = document.getElementById("reload-button");
const statusMessage = document.getElementById("status-message");
const postsGrid = document.getElementById("posts-grid");
const postCount = document.getElementById("post-count");

let posts = [];

// Show loading, success, or error messages
function showMessage(message, type = "success") {
    statusMessage.textContent = message;
    statusMessage.className = `status ${type}`;
}

// Log HTTP status codes in the console
function logStatus(method, response) {
    console.log(`${method} response status:`, response.status);
}

// Create buttons for each post card
function makeButton(label, className, onClick) {
    const button = document.createElement("button");

    button.type = "button";
    button.className = `btn ${className}`;
    button.textContent = label;
    button.addEventListener("click", onClick);

    return button;
}

// Display posts on the webpage
function renderPosts() {
    postsGrid.replaceChildren();

    postCount.textContent =
        `${posts.length} post${posts.length === 1 ? "" : "s"} shown`;

    if (posts.length === 0) {
        const emptyMessage = document.createElement("p");

        emptyMessage.className = "empty-state";
        emptyMessage.textContent = "No posts to display.";

        postsGrid.appendChild(emptyMessage);
        return;
    }

    posts.forEach((post) => {
        const card = document.createElement("article");
        card.className = "post-card";

        const meta = document.createElement("p");
        meta.className = "post-meta";
        meta.textContent =
            `Post ID: ${post.id} · User ID: ${post.userId}`;

        const title = document.createElement("h3");
        title.textContent = post.title;

        const body = document.createElement("p");
        body.className = "post-body";
        body.textContent = post.body;

        const actions = document.createElement("div");
        actions.className = "card-actions";

        const putButton = makeButton(
            "PUT full update",
            "btn-put",
            () => updatePost(post.id)
        );

        const patchButton = makeButton(
            "PATCH title",
            "btn-patch",
            () => patchPost(post.id)
        );

        const deleteButton = makeButton(
            "DELETE",
            "btn-delete",
            () => deletePost(post.id)
        );

        actions.append(putButton, patchButton, deleteButton);
        card.append(meta, title, body, actions);
        postsGrid.appendChild(card);
    });
}

// GET: Load the first six posts
async function loadPosts() {
    reloadButton.disabled = true;
    showMessage("Loading posts...", "loading");

    try {
        const response = await fetch(POSTS_URL);

        logStatus("GET", response);

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        const data = await response.json();

        posts = data;
        renderPosts();

        showMessage(
            `GET successful! Posts loaded. HTTP ${response.status}.`
        );
    } catch (error) {
        console.error("GET error:", error);

        showMessage(
            `Error loading posts: ${error.message}`,
            "error"
        );
    } finally {
        reloadButton.disabled = false;
    }
}

// Reload button
reloadButton.addEventListener("click", loadPosts);

// POST: Add a new post
postForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const newPost = {
        title: titleInput.value.trim(),
        body: bodyInput.value.trim(),
        userId: Number(userIdInput.value)
    };

    if (
        !newPost.title ||
        !newPost.body ||
        !Number.isInteger(newPost.userId) ||
        newPost.userId < 1
    ) {
        showMessage(
            "Please enter a title, content, and valid user ID.",
            "error"
        );
        return;
    }

    addButton.disabled = true;
    showMessage("Adding post...", "loading");

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json; charset=UTF-8"
            },
            body: JSON.stringify(newPost)
        });

        logStatus("POST", response);

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        const createdPost = await response.json();

        posts.unshift({
            ...newPost,
            ...createdPost
        });

        renderPosts();
        postForm.reset();
        userIdInput.value = "1";

        showMessage(
            `POST successful! Post added locally. HTTP ${response.status}.`
        );
    } catch (error) {
        console.error("POST error:", error);

        showMessage(
            `Error adding post: ${error.message}`,
            "error"
        );
    } finally {
        addButton.disabled = false;
    }
});

// PUT: Update the complete post
async function updatePost(postId) {
    const currentPost = posts.find(
        (post) => post.id === postId
    );

    if (!currentPost) return;

    const updatedPost = {
        id: currentPost.id,
        userId: currentPost.userId,
        title: `${currentPost.title} (PUT updated)`,
        body: currentPost.body
    };

    await runUpdateRequest(
        "PUT",
        postId,
        updatedPost
    );
}

// PATCH: Update only the title
async function patchPost(postId) {
    const currentPost = posts.find(
        (post) => post.id === postId
    );

    if (!currentPost) return;

    const changes = {
        title: `${currentPost.title} (PATCH updated)`
    };

    await runUpdateRequest(
        "PATCH",
        postId,
        changes
    );
}

// Shared function for PUT and PATCH
async function runUpdateRequest(method, postId, payload) {
    showMessage(`${method} request in progress...`, "loading");

    try {
        const response = await fetch(`${API_URL}/${postId}`, {
            method: method,
            headers: {
                "Content-Type": "application/json; charset=UTF-8"
            },
            body: JSON.stringify(payload)
        });

        logStatus(method, response);

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        const serverPost = await response.json();

        posts = posts.map((post) => {
            if (post.id !== postId) {
                return post;
            }

            // Keep unchanged fields when the API returns partial data
            return {
                ...post,
                ...serverPost,
                ...payload,
                id: postId
            };
        });

        renderPosts();

        showMessage(
            `${method} successful! Post updated locally. HTTP ${response.status}.`
        );
    } catch (error) {
        console.error(`${method} error:`, error);

        showMessage(
            `Error during ${method}: ${error.message}`,
            "error"
        );
    }
}

// DELETE: Delete a post
async function deletePost(postId) {
    showMessage("Deleting post...", "loading");

    try {
        const response = await fetch(`${API_URL}/${postId}`, {
            method: "DELETE"
        });

        logStatus("DELETE", response);

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        await response.json().catch(() => null);

        // Remove the post from the local page
        posts = posts.filter(
            (post) => post.id !== postId
        );

        renderPosts();

        showMessage(
            `DELETE successful! Post removed locally. HTTP ${response.status}.`
        );
    } catch (error) {
        console.error("DELETE error:", error);

        showMessage(
            `Error deleting post: ${error.message}`,
            "error"
        );
    }
}

// Load posts automatically when the page opens
loadPosts();
