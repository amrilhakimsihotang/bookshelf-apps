const saving = [];

const RENDER_EVENT = 'render-saving';

const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOKSHELF-APP';

function isStorageExist() {
  if (typeof Storage === undefined) {
    alert('Browser does not support for local storage');
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

document.addEventListener('DOMContentLoaded', function () {
  const submitFormData = document.getElementById('inputBook');
  submitFormData.addEventListener('submit', (e) => {
    e.preventDefault();
    addBookshelf();
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

function addBookshelf() {
  const submitFormData = document.getElementById('inputBook');
  const inputBookTitle = document.getElementById('inputBookTitle').value;
  const inputBookAuthor = document.getElementById('inputBookAuthor').value;
  const inputBookYear = document.getElementById('inputBookYear').value;
  const inputBookIsComplete = document.getElementById(
    'inputBookIsComplete'
  ).checked;

  const autoID = autoId();
  const bookShelfObject = generatedBookObject(
    autoID,
    inputBookTitle,
    inputBookAuthor,
    parseInt(inputBookYear),
    inputBookIsComplete
  );
  saving.push(bookShelfObject);
  document.dispatchEvent(new Event(RENDER_EVENT));
  Swal.fire('Data buku berhasil disimpan!');
  saveDataBook();
  submitFormData.reset();
}

document.addEventListener(RENDER_EVENT, function () {
  console.log(saving);

  const unCompletedBookList = document.getElementById(
    'listItemDataBelumdibaca'
  );
  const listBookShelfCompleted = document.getElementById(
    'listItemDatasudahdibaca'
  );
  unCompletedBookList.innerHTML = '';
  listBookShelfCompleted.innerHTML = '';

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

  const listBookTitle = document.createElement('h3');
  listBookTitle.innerText = bookShelfObject.title;

  const listBookAuthor = document.createElement('p');
  listBookAuthor.innerText = bookShelfObject.author;

  const listBookYear = document.createElement('p');
  listBookYear.innerText = bookShelfObject.year;

  const textContainer = document.createElement('div');
  textContainer.classList.add('inner');
  textContainer.append(listBookTitle, listBookAuthor, listBookYear);

  const container = document.createElement('div');
  container.classList.add('detailBook');
  container.append(textContainer);
  container.setAttribute('autoid', `saving-${bookShelfObject.autoid}`);

  const editButton = document.createElement('button');
  editButton.classList.add('edit-button');
  editButton.addEventListener('click', function () {
    editData(autoid);
  });
  container.append(editButton);

  if (isCompleted) {
    const unReadButton = document.createElement('button');
    unReadButton.classList.add('unread-button');
    unReadButton.addEventListener('click', function () {
      undoBookShelfFromCompleted(autoid);
    });

    const trashButton = document.createElement('button');
    trashButton.classList.add('trash-button');
    trashButton.addEventListener('click', function () {
      removeBookShelfCompleted(autoid);
    });

    container.append(unReadButton, editButton, trashButton);
  } else {
    const readButton = document.createElement('button');
    readButton.classList.add('read-button');
    readButton.addEventListener('click', function () {
      addBookReadCompleted(autoid);
    });
    const trashButton = document.createElement('button');
    trashButton.classList.add('trash-button');
    trashButton.addEventListener('click', function () {
      removeBookShelfCompleted(autoid);
    });

    container.append(readButton, editButton, trashButton);
  }
  return container;
}

function addBookReadCompleted(autoIDBook) {
  Swal.fire({
    title: 'Pindahkan buku ke Rak selesai baca?',
    showDenyButton: true,
    confirmButtonText: 'Ya',
    denyButtonText: 'Tidak',
  }).then((result) => {
    if (result.isConfirmed) {
      const bookShelfTarget = findDataBook(autoIDBook);
      if (bookShelfTarget == null) return;
      bookShelfTarget.isCompleted = true;
      document.dispatchEvent(new Event(RENDER_EVENT));
      saveDataBook();
      Swal.fire('Buku dipindahkan!', '', 'success');
    } else if (result.isDenied) {
      Swal.fire('Batal pindahkan ke rak', '', 'info');
    }
  });
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

  const swalWithBootstrapButtons = Swal.mixin({
    customClass: {
      confirmButton: 'btn btn-success',
      cancelButton: 'btn btn-danger',
    },
    buttonsStyling: true,
  });

  swalWithBootstrapButtons
    .fire({
      title: 'Yakin ingin menghapus data ini?',
      text: 'Anda tidak akan dapat mengembalikannya!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya',
      cancelButtonText: 'Tidak',
      reverseButtons: true,
    })
    .then((result) => {
      if (result.isConfirmed) {
        if (bookShelfTarget == -1) return;
        saving.splice(bookShelfTarget, 1);
        document.dispatchEvent(new Event(RENDER_EVENT));
        saveDataBook();
        swalWithBootstrapButtons.fire(
          'Dihapus!',
          'Berkas Anda telah dihapus.',
          'success'
        );
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        const msg = 'Data batal dihapus';
        swalWithBootstrapButtons.fire('Batal', msg, 'error');
      }
    });
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
  Swal.fire({
    title: 'Pindahkan ke rak Belum Baca?',
    showDenyButton: true,
    confirmButtonText: 'Ya',
    denyButtonText: 'Tidak',
  }).then((result) => {
    if (result.isConfirmed) {
      const bookShelfTarget = findDataBook(autoIdBook);
      if (bookShelfTarget == null) return;
      bookShelfTarget.isCompleted = false;
      document.dispatchEvent(new Event(RENDER_EVENT));
      saveDataBook();
    } else if (result.isDenied) {
      const msg = 'Batal dipindah ke rak';
      Swal.fire('Info', msg, 'info');
    }
  });
}

function saveDataBook() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(saving);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function searchBooks(keyword) {
  const searchResults = [];
  const lowercaseKeyword = keyword.toLowerCase();

  for (const bookItem of saving) {
    const { title, author, year } = bookItem;
    if (
      title.toLowerCase().includes(lowercaseKeyword) ||
      author.toLowerCase().includes(lowercaseKeyword) ||
      year.toString().includes(keyword)
    ) {
      searchResults.push(bookItem);
    }
  }

  return searchResults;
}

function displaySearchResults(results) {
  const searchResultsContainer = document.getElementById('listPenelusuranBuku');
  searchResultsContainer.innerHTML = '';

  if (results.length === 0) {
    const noResultsMessage = document.createElement('p');
    noResultsMessage.textContent = 'Tidak ada hasil ditemukan.';
    searchResultsContainer.appendChild(noResultsMessage);

    Swal.fire('Tidak ada hasil ditemukan!');
  } else {
    for (const result of results) {
      const bookElement = listBookShelfSearch(result);
      searchResultsContainer.appendChild(bookElement);
    }
  }
}

const searchForm = document.getElementById('searchBook');
searchForm.addEventListener('submit', function (e) {
  e.preventDefault();
  const searchInput = document.getElementById('searchBookTitle').value;
  const searchResults = searchBooks(searchInput);
  displaySearchResults(searchResults);
});

const createButton = (buttonTypeClass, eventListener) => {
  const button = document.createElement('button');
  button.classList.add(buttonTypeClass);

  button.addEventListener('click', function (event) {
    eventListener(event);
  });
  return button;
};

const createReadButton = () => {
  return createButton('read-button', function (event) {
    addBookReadCompleted(event.target.parentElement);
  });
};

const createTrashButton = () => {
  return createButton('trash-book', function (event) {
    removeBookShelfCompleted(event.target.parentElement);
  });
};

const createEditButton = (autoIdBook) => {
  const button = createButton('edit-book', function () {
    editData(autoIdBook);
  });
  return button;
};

function editData(autoIdBook) {
  const bookShelfTarget = findDataBook(autoIdBook);
  if (bookShelfTarget == null) return;

  Swal.fire({
    title: 'Edit Buku',
    html: `
      <input type="text" id="editBookTitle" class="swal2-input" placeholder="Judul Buku" value="${bookShelfTarget.title}" required>
      <input type="text" id="editBookAuthor" class="swal2-input" placeholder="Penulis" value="${bookShelfTarget.author}" required>
      <input type="number" id="editBookYear" class="swal2-input" placeholder="Tahun Terbit" value="${bookShelfTarget.year}" required>
    `,
    showCancelButton: true,
    confirmButtonText: 'Simpan',
    cancelButtonText: 'Batal',
    focusConfirm: false,
    preConfirm: () => {
      const editedBookTitle =
        Swal.getPopup().querySelector('#editBookTitle').value;
      const editedBookAuthor =
        Swal.getPopup().querySelector('#editBookAuthor').value;
      const editedBookYear = parseInt(
        Swal.getPopup().querySelector('#editBookYear').value
      );

      if (!editedBookTitle || !editedBookAuthor || !editedBookYear) {
        Swal.showValidationMessage('Data harus diisi lengkap');
      }

      const bookShelfTarget = findDataBook(autoIdBook);
      if (bookShelfTarget == null) return;

      bookShelfTarget.title = editedBookTitle;
      bookShelfTarget.author = editedBookAuthor;
      bookShelfTarget.year = editedBookYear;

      document.dispatchEvent(new Event(RENDER_EVENT));
      saveDataBook();
    },
  });
}

function listBookShelfSearch(bookShelfObject) {
  const listBookTitle = document.createElement('h3');
  listBookTitle.innerText = bookShelfObject.title;

  const listBookAuthor = document.createElement('p');
  listBookAuthor.innerText = bookShelfObject.author;

  const listBookYear = document.createElement('p');
  listBookYear.innerText = bookShelfObject.year;

  const textContainer = document.createElement('div');
  textContainer.classList.add('inner');
  textContainer.append(listBookTitle, listBookAuthor, listBookYear);

  const container = document.createElement('div');
  container.classList.add('detailBook');
  container.append(textContainer);
  container.setAttribute('autoid', `saving-${bookShelfObject.autoid}`);

  return container;
}
