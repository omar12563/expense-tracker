const API_URL = "http://localhost:3000/api/expenses";

const expenseForm = document.getElementById("expenseForm");
const expensesTableBody = document.getElementById("expensesTableBody");
const categoryFilter = document.getElementById("categoryFilter");

const totalAmount = document.getElementById("totalAmount");
const expenseCount = document.getElementById("expenseCount");
const highestExpense = document.getElementById("highestExpense");

const loadingSpinner = document.getElementById("loadingSpinner");
const alertContainer = document.getElementById("alertContainer");

const editTitle = document.getElementById("editTitle");
const editAmount = document.getElementById("editAmount");
const editCategory = document.getElementById("editCategory");
const editDate = document.getElementById("editDate");
const saveEditButton = document.getElementById("saveEditButton");

const editModalElement = document.getElementById("editExpenseModal");
const editModal = new bootstrap.Modal(editModalElement);

let expenses = [];
let editingExpenseId = null;


function showAlert(message, type = "danger") {
  const alert = document.createElement("div");

  alert.className =
    "alert alert-" +
    type +
    " alert-dismissible fade show";

  alert.setAttribute("role", "alert");

  alert.textContent = message;

  const closeButton = document.createElement("button");

  closeButton.type = "button";
  closeButton.className = "btn-close";
  closeButton.setAttribute("data-bs-dismiss", "alert");

  alert.appendChild(closeButton);

  alertContainer.innerHTML = "";
  alertContainer.appendChild(alert);
}


function showSpinner() {
  loadingSpinner.classList.remove("d-none");
}


function hideSpinner() {
  loadingSpinner.classList.add("d-none");
}


async function getExpenses() {
  try {
    const response = await fetch(API_URL);

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to fetch expenses"
      );
    }

    return data;

  } catch (error) {
    console.error(error);

    showAlert(
      "Unable to load expenses. Make sure the server is running."
    );

    return [];
  }
}


async function refresh() {
  showSpinner();

  try {
    expenses = await getExpenses();

    applyFilter();

  } finally {
    hideSpinner();
  }
}


function renderTable(list) {
  expensesTableBody.innerHTML = "";

  if (list.length === 0) {
    expensesTableBody.innerHTML =
      "<tr>" +
      "<td colspan='5' class='text-center'>" +
      "No expenses found." +
      "</td>" +
      "</tr>";

    return;
  }

  list.forEach(function (expense) {
    const row = document.createElement("tr");

    row.innerHTML =
      "<td>" +
      expense.title +
      "</td>" +

      "<td>" +
      Number(expense.amount).toFixed(2) +
      "</td>" +

      "<td>" +
      "<span class='badge bg-primary'>" +
      expense.category +
      "</span>" +
      "</td>" +

      "<td>" +
      expense.date +
      "</td>" +

      "<td>" +

      "<button " +
      "type='button' " +
      "class='btn btn-warning btn-sm edit-button me-1' " +
      "data-id='" +
      expense.id +
      "'>" +
      "Edit" +
      "</button>" +

      "<button " +
      "type='button' " +
      "class='btn btn-danger btn-sm delete-button' " +
      "data-id='" +
      expense.id +
      "'>" +
      "Delete" +
      "</button>" +

      "</td>";

    expensesTableBody.appendChild(row);
  });
}


function renderSummary(list) {
  const count = list.length;

  const total = list.reduce(function (sum, expense) {
    return sum + Number(expense.amount);
  }, 0);

  let highest = 0;

  if (list.length > 0) {
    highest = Math.max(
      ...list.map(function (expense) {
        return Number(expense.amount);
      })
    );
  }

  totalAmount.textContent = total.toFixed(2);
  expenseCount.textContent = count;
  highestExpense.textContent = highest.toFixed(2);
}


function applyFilter() {
  const selectedCategory = categoryFilter.value;

  let filteredExpenses = expenses;

  if (selectedCategory !== "All") {
    filteredExpenses = expenses.filter(function (expense) {
      return expense.category === selectedCategory;
    });
  }

  renderTable(filteredExpenses);
  renderSummary(expenses);
}


async function addExpense(data) {
  showSpinner();

  try {
    const response = await fetch(API_URL, {
      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || "Failed to add expense"
      );
    }

    expenseForm.reset();

    showAlert(
      "Expense added successfully.",
      "success"
    );

    await refresh();

  } catch (error) {
    console.error(error);
    showAlert(error.message);

  } finally {
    hideSpinner();
  }
}


async function updateExpense(id, data) {
  showSpinner();

  try {
    const response = await fetch(
      API_URL + "/" + id,
      {
        method: "PUT",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify(data)
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || "Failed to update expense"
      );
    }

    showAlert(
      "Expense updated successfully.",
      "success"
    );

    await refresh();

  } catch (error) {
    console.error(error);
    showAlert(error.message);

  } finally {
    hideSpinner();
  }
}


async function deleteExpense(id) {
  const confirmed = confirm(
    "Are you sure you want to delete this expense?"
  );

  if (!confirmed) {
    return;
  }

  showSpinner();

  try {
    const response = await fetch(
      API_URL + "/" + id,
      {
        method: "DELETE"
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || "Failed to delete expense"
      );
    }

    showAlert(
      "Expense deleted successfully.",
      "success"
    );

    await refresh();

  } catch (error) {
    console.error(error);
    showAlert(error.message);

  } finally {
    hideSpinner();
  }
}


function openEditModal(id) {
  const expense = expenses.find(function (item) {
    return item.id === id;
  });

  if (!expense) {
    showAlert("Expense not found.");
    return;
  }

  editingExpenseId = id;

  editTitle.value = expense.title;
  editAmount.value = expense.amount;
  editCategory.value = expense.category;
  editDate.value = expense.date;

  editModal.show();
}


async function saveEditedExpense() {
  const title = editTitle.value.trim();
  const amount = editAmount.value;
  const category = editCategory.value;
  const date = editDate.value;

  if (title === "") {
    showAlert("Title is required.");
    return;
  }

  if (amount === "" || Number(amount) <= 0) {
    showAlert("Amount must be greater than 0.");
    return;
  }

  if (category === "") {
    showAlert("Please select a category.");
    return;
  }

  if (date === "") {
    showAlert("Date is required.");
    return;
  }

  const data = {
    title: title,
    amount: Number(amount),
    category: category,
    date: date
  };

  editModal.hide();

  await updateExpense(
    editingExpenseId,
    data
  );

  editingExpenseId = null;
}


expenseForm.addEventListener(
  "submit",
  async function (event) {
    event.preventDefault();

    const title =
      document.getElementById("title").value.trim();

    const amount =
      document.getElementById("amount").value;

    const category =
      document.getElementById("category").value;

    const date =
      document.getElementById("date").value;

    if (title === "") {
      showAlert("Title is required.");
      return;
    }

    if (amount === "" || Number(amount) <= 0) {
      showAlert("Amount must be greater than 0.");
      return;
    }

    if (category === "") {
      showAlert("Please select a category.");
      return;
    }

    if (date === "") {
      showAlert("Date is required.");
      return;
    }

    const data = {
      title: title,
      amount: Number(amount),
      category: category,
      date: date
    };

    await addExpense(data);
  }
);


categoryFilter.addEventListener(
  "change",
  applyFilter
);


expensesTableBody.addEventListener(
  "click",
  function (event) {
    const editButton =
      event.target.closest(".edit-button");

    const deleteButton =
      event.target.closest(".delete-button");

    if (editButton) {
      const id = Number(editButton.dataset.id);

      openEditModal(id);
    }

    if (deleteButton) {
      const id = Number(deleteButton.dataset.id);

      deleteExpense(id);
    }
  }
);


saveEditButton.addEventListener(
  "click",
  saveEditedExpense
);


refresh();

