class Book {
  constructor(id, title, author, category, issued = false) {
    this.id = id.trim().toUpperCase();
    this.title = title.trim();
    this.author = author.trim();
    this.category = category;
    this.issued = issued;
  }

  toggleStatus() {
    this.issued = !this.issued;
  }
}

class LibraryService {
  constructor(storageKey) {
    this.storageKey = storageKey;
    this.books = this.loadBooks();
  }

  loadBooks() {
    const saved = JSON.parse(localStorage.getItem(this.storageKey) || "[]");
    return saved.map((book) => new Book(book.id, book.title, book.author, book.category, book.issued));
  }

  saveBooks() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.books));
  }

  addBook(book) {
    if (this.books.some((existing) => existing.id === book.id)) {
      throw new Error("Book ID already exists.");
    }
    this.books.push(book);
    this.saveBooks();
  }

  updateBook(originalId, updatedBook) {
    const duplicate = this.books.some((book) => book.id === updatedBook.id && book.id !== originalId);
    if (duplicate) {
      throw new Error("Another book already uses this ID.");
    }

    const index = this.books.findIndex((book) => book.id === originalId);
    if (index === -1) {
      throw new Error("Book not found.");
    }

    updatedBook.issued = this.books[index].issued;
    this.books[index] = updatedBook;
    this.saveBooks();
  }

  removeBook(id) {
    this.books = this.books.filter((book) => book.id !== id);
    this.saveBooks();
  }

  toggleIssue(id) {
    const book = this.books.find((item) => item.id === id);
    if (!book) {
      throw new Error("Book not found.");
    }
    book.toggleStatus();
    this.saveBooks();
  }

  seedBooks() {
    this.books = [
      new Book("CS101", "Data Structures in Java", "Mark Allen Weiss", "Computer Science"),
      new Book("MA204", "Discrete Mathematics", "Kenneth Rosen", "Mathematics", true),
      new Book("EC311", "Digital Logic Design", "M. Morris Mano", "Electronics"),
      new Book("RF008", "Programming Pearls", "Jon Bentley", "Reference")
    ];
    this.saveBooks();
  }

  clear() {
    this.books = [];
    this.saveBooks();
  }

  search(query, status) {
    const value = query.trim().toLowerCase();
    return this.books.filter((book) => {
      const matchesStatus =
        status === "all" ||
        (status === "available" && !book.issued) ||
        (status === "issued" && book.issued);
      const text = `${book.id} ${book.title} ${book.author} ${book.category}`.toLowerCase();
      return matchesStatus && text.includes(value);
    });
  }

  summary() {
    const issued = this.books.filter((book) => book.issued).length;
    return {
      total: this.books.length,
      available: this.books.length - issued,
      issued
    };
  }
}

const library = new LibraryService("q3-library-manager");
const form = document.querySelector("#bookForm");
const editingId = document.querySelector("#editingId");
const formTitle = document.querySelector("#formTitle");
const bookId = document.querySelector("#bookId");
const title = document.querySelector("#title");
const author = document.querySelector("#author");
const category = document.querySelector("#category");
const message = document.querySelector("#message");
const bookTable = document.querySelector("#bookTable");
const searchInput = document.querySelector("#searchInput");
const segments = document.querySelectorAll(".segment");
const totals = {
  total: document.querySelector("#totalBooks"),
  available: document.querySelector("#availableBooks"),
  issued: document.querySelector("#issuedBooks")
};

let activeFilter = "all";

function showMessage(text, kind = "error") {
  message.textContent = text;
  message.style.color = kind === "success" ? "#0f766e" : "#c2410c";
}

function resetForm() {
  form.reset();
  editingId.value = "";
  formTitle.textContent = "Add Book";
  bookId.disabled = false;
  showMessage("");
}

function renderSummary() {
  const summary = library.summary();
  totals.total.textContent = summary.total;
  totals.available.textContent = summary.available;
  totals.issued.textContent = summary.issued;
}

function renderBooks() {
  const rows = library.search(searchInput.value, activeFilter);
  renderSummary();

  if (rows.length === 0) {
    bookTable.innerHTML = `<tr><td class="empty-state" colspan="5">No matching books</td></tr>`;
    return;
  }

  bookTable.innerHTML = rows
    .map(
      (book) => `
        <tr>
          <td>${book.id}</td>
          <td>
            <strong>${book.title}</strong>
            <small>${book.author}</small>
          </td>
          <td>${book.category}</td>
          <td><span class="status ${book.issued ? "issued" : "available"}">${book.issued ? "Issued" : "Available"}</span></td>
          <td>
            <div class="actions">
              <button class="row-action issue" type="button" data-action="toggle" data-id="${book.id}">${book.issued ? "Return" : "Issue"}</button>
              <button class="row-action" type="button" data-action="edit" data-id="${book.id}">Edit</button>
              <button class="row-action delete" type="button" data-action="delete" data-id="${book.id}">Delete</button>
            </div>
          </td>
        </tr>
      `
    )
    .join("");
}

function bookFromForm() {
  if (!bookId.value.trim() || !title.value.trim() || !author.value.trim()) {
    throw new Error("Please fill in book ID, title, and author.");
  }

  return new Book(bookId.value, title.value, author.value, category.value);
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  try {
    const book = bookFromForm();
    if (editingId.value) {
      library.updateBook(editingId.value, book);
      showMessage("Book updated.", "success");
    } else {
      library.addBook(book);
      showMessage("Book added.", "success");
    }
    resetForm();
    renderBooks();
  } catch (error) {
    showMessage(error.message);
  }
});

document.querySelector("#cancelEditBtn").addEventListener("click", resetForm);
document.querySelector("#seedBtn").addEventListener("click", () => {
  library.seedBooks();
  resetForm();
  renderBooks();
  showMessage("Sample records loaded.", "success");
});

document.querySelector("#resetBtn").addEventListener("click", () => {
  library.clear();
  resetForm();
  renderBooks();
  showMessage("Saved records reset.", "success");
});

searchInput.addEventListener("input", renderBooks);

segments.forEach((button) => {
  button.addEventListener("click", () => {
    segments.forEach((segment) => segment.classList.remove("active"));
    button.classList.add("active");
    activeFilter = button.dataset.filter;
    renderBooks();
  });
});

bookTable.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) {
    return;
  }

  const id = button.dataset.id;
  const action = button.dataset.action;
  const book = library.books.find((item) => item.id === id);

  if (action === "toggle") {
    library.toggleIssue(id);
    renderBooks();
  }

  if (action === "delete") {
    library.removeBook(id);
    resetForm();
    renderBooks();
  }

  if (action === "edit" && book) {
    editingId.value = book.id;
    bookId.value = book.id;
    title.value = book.title;
    author.value = book.author;
    category.value = book.category;
    formTitle.textContent = "Edit Book";
    showMessage("");
  }
});

if (library.books.length === 0) {
  library.seedBooks();
}

renderBooks();
