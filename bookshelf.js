const saving = [];

const RENDER_EVENT = "render-saving";

const SAVED_EVENT = "saved-book";
const STORAGE_KEY = "BOOKSHELF-APP";

function isStorageExist() {
  if (typeof Storage === undefined) {
    alert("Browser does not support for local storage");
    return false;
  }
  return true;
}

document.addEventListener(SAVED_EVENT, function () {
  console.log(localStorage.getItem(STORAGE_KEY));
});

function loadDataFromStorage() {
  const serializedDataBook = localStorage.getItem(STORAGE_KEY);
  let dataBook = JSON.parse(serializedDataBook);
  if (dataBook !== null) {
    for (const savingBook of dataBook) {
      saving.push(savingBook);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

function autoId() {
  return +new Date();
}

function generatedBookObject(autoid, title, author, year, isCompleted) {
  return {
    autoid,
    title,
    author,
    year,
    isCompleted,
  };
}

document.addEventListener("DOMContentLoaded", function () {
  const submitFormData = document.getElementById("inputBook");
  submitFormData.addEventListener("submit", (e) => {
    e.preventDefault();
    addBookshelf();
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

function addBookshelf() {
  const inputBookTitle = document.getElementById("inputBookTitle").value;
  const inputBookAuthor = document.getElementById("inputBookAuthor").value;
  const inputBookYear = document.getElementById("inputBookYear").value;
  const inputBookIsComplete = document.getElementById(
    "inputBookIsComplete"
  ).checked;

  const autoID = autoId();
  const bookShelfObject = generatedBookObject(
    autoID,
    inputBookTitle,
    inputBookAuthor,
    inputBookYear,
    inputBookIsComplete
  );
  saving.push(bookShelfObject);
  document.dispatchEvent(new Event(RENDER_EVENT));

  window.alert(
    "Data buku: \nJudul: " +
      inputBookTitle +
      "\nPenulis: " +
      inputBookAuthor +
      "\nTahun: " +
      inputBookYear +
      "\nBerhasil disimpan"
  );
  saveDataBook();
}

document.addEventListener(RENDER_EVENT, function () {
  console.log(saving);

  const unCompletedBookList = document.getElementById(
    "listItemDataBelumdibaca"
  );
  const listBookShelfCompleted = document.getElementById(
    "listItemDatasudahdibaca"
  );
  unCompletedBookList.innerHTML = "";
  listBookShelfCompleted.innerHTML = "";

  for (const bookItem of saving) {
    const bookElement = listBookShelf(bookItem);

    if (bookItem.isCompleted) {
      listBookShelfCompleted.append(bookElement);
    } else {
      unCompletedBookList.append(bookElement);
    }
  }
});

function listBookShelf(bookShelfObject) {
  const { autoid, isCompleted } = bookShelfObject;

  const listBookTitle = document.createElement("h3");
  listBookTitle.innerText = bookShelfObject.title;

  const listBookAuthor = document.createElement("p");
  listBookAuthor.innerText = bookShelfObject.author;

  const listBookYear = document.createElement("p");
  listBookYear.innerText = bookShelfObject.year;

  const textContainer = document.createElement("div");
  textContainer.classList.add("inner");
  textContainer.append(listBookTitle, listBookAuthor, listBookYear);

  const container = document.createElement("div");
  container.classList.add("detailBook");
  container.append(textContainer);
  container.setAttribute("autoid", `saving-${bookShelfObject.autoid}`);

  if (isCompleted) {
    const unReadButton = document.createElement("button");
    unReadButton.classList.add("unread-button");
    unReadButton.addEventListener("click", function () {
      undoBookShelfFromCompleted(autoid);
    });

    const trashButton = document.createElement("button");
    trashButton.classList.add("trash-button");
    trashButton.addEventListener("click", function () {
      removeBookShelfCompleted(autoid);
    });

    container.append(unReadButton, trashButton);
  } else {
    const readButton = document.createElement("button");
    readButton.classList.add("read-button");
    readButton.addEventListener("click", function () {
      addBookReadCompleted(autoid);
    });
    const trashButton = document.createElement("button");
    trashButton.classList.add("trash-button");
    trashButton.addEventListener("click", function () {
      removeBookShelfCompleted(autoid);
    });

    container.append(readButton, trashButton);
  }
  return container;
}

function addBookReadCompleted(autoIDBook) {
  let msg;
  if (confirm("Pindahkan buku ke Rak selesai baca?") == true) {
    const bookShelfTarget = findDataBook(autoIDBook);
    if (bookShelfTarget == null) return;
    bookShelfTarget.isCompleted = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveDataBook();
  } else {
    msg = "Batal pindahkan ke rak";
    window.alert(msg);
  }
}

function findDataBook(autoIDBook) {
  for (bookItem of saving) {
    if (bookItem.autoid === autoIDBook) {
      return bookItem;
    }
  }
  return null;
}

function removeBookShelfCompleted(autoIndexIDBook) {
  const bookShelfTarget = findIndexBook(autoIndexIDBook);
  let msg;
  if (confirm("Yakin ingin menghapus data ini?") == true) {
    if (bookShelfTarget == -1) return;
    saving.splice(bookShelfTarget, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveDataBook();
  } else {
    msg = "Data batal dihapus";
    window.alert(msg);
  }
}

function findIndexBook(autoIndexIDBook) {
  for (index in saving) {
    if (saving[index].autoid === autoIndexIDBook) {
      return index;
    }
  }
  return -1;
}

function undoBookShelfFromCompleted(autoIdBook) {
  let msg;
  if (confirm("Pindahkan ke rak Belum Baca?") == true) {
    const bookShelfTarget = findDataBook(autoIdBook);
    if (bookShelfTarget == null) return;
    bookShelfTarget.isCompleted = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveDataBook();
  } else {
    msg = "Batal dipindah ke rak";
    window.alert(msg);
  }
}

function saveDataBook() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(saving);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

const createButton = (buttonTypeClass, eventListener) => {
  const button = document.createElement("button");
  button.classList.add(buttonTypeClass);

  button.addEventListener("click", function (event) {
    eventListener(event);
  });
  return button;
};

const createReadButton = () => {
  return createButton("read-button", function (event) {
    addBookReadCompleted(event.target.parentElement);
  });
};

const createTrashButton = () => {
  return createButton("trash-book", function (event) {
    removeBookShelfCompleted(event.target.parentElement);
  });
};
