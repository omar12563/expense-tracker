# Expense Tracker

A simple web application for tracking personal expenses. You can add, edit, delete, and filter expenses, while the summary cards show the total amount, number of expenses, and highest expense.

## How to run

### Backend

1. Open the project in VS Code.
2. Open PostgreSQL and create a database named `expense_tracker`.
3. Run the `schema.sql` file on the database.
4. Open the `backend` folder.
5. Create a `.env` file and add your PostgreSQL connection details.
6. Open the terminal inside the `backend` folder.
7. Install the dependencies:

```bash
npm install
```

8. Start the server:

```bash
node server.js
```

The backend will run on:

```text
http://localhost:3000
```

### Frontend

1. Open the `frontend` folder in VS Code.
2. Open `index.html`.
3. Right-click the file.
4. Select **Open with Live Server**.
5. Keep the backend server running while using the application.

## Features

* [x] Add an expense with validation
* [x] Delete an expense
* [x] Edit an expense
* [x] Filter by category
* [x] Summary cards (total, count, highest)
* [x] Data is saved in a PostgreSQL database

## Screenshots

Add screenshots of the application here:

* Desktop view
https://drive.google.com/file/d/1Lqg9taNm8e01J8hz_d9FVbA3O3ry_vPb/view?usp=sharing
* Mobile view
https://drive.google.com/file/d/1J0eHtZsO-imoH2CsPTsl4Uf6mgrEZmck/view?usp=sharing
* Add/Edit 
expense https://drive.google.com/file/d/1_6L4yUR5GrSlphcVqZM99pBMfOK5oyuZ/view?usp=sharing

## Screen Recording

[Watch the screen recording]
https://drive.google.com/file/d/1q1oBzwikW4LvmSthdlVMv-ta7u5iWO0o/view?usp=sharing

## What was the hardest part?

The hardest part was connecting the frontend to the backend and making sure the data was saved correctly in PostgreSQL. I solved this by testing the API endpoints first and then connecting the frontend to them using `fetch`, `async`, and `await`.
## Project Link

[View the project on GitHub](https://github.com/omar12563/expense-tracker)
