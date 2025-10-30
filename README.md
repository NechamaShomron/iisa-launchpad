
# 🧩 IISA Project

This project is built with **Angular** and uses **Firebase** as its backend for data storage and real-time updates.

---

## ⚙️ Run the Project Locally

Follow these steps to set up and run the project on your local machine:

### 1. Clone the repository
```bash 
git clone https://github.com/NechamaShomron/iisa-launchpad.git
cd iisa-launchpad
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Firebase configuration

The project uses Firebase as a backend, so you’ll need to connect it to your own Firebase project (instructions below 👇).

### 4. Run the development server

```bash
npm start
```

By default, the app will be available at:
👉 http://localhost:4200

---

## 🔥 Firebase Configuration

This project uses **Firebase** for its real time database.

To make it work locally, you need to create your own Firebase project and link it to this app.

### Steps:

1. Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.

2. In your project settings, find the **Firebase SDK configuration** (under *Project Settings → General*).

3. In your local Angular project, create the file:

   ```
   `environment.ts` in the root of the project (next to package.json)

   ```

4. Add the following code to that file:

   ```ts
   export const environment = {
     production: false,
     firebase: {
       apiKey: "YOUR_API_KEY",
       authDomain: "YOUR_PROJECT.firebaseapp.com",
       databaseURL: "https://YOUR_PROJECT.firebaseio.com",
       projectId: "YOUR_PROJECT_ID",
       storageBucket: "YOUR_PROJECT.appspot.com",
       messagingSenderId: "YOUR_SENDER_ID",
       appId: "YOUR_APP_ID",
       measurementId: "YOUR_MEASUREMENT_ID"
     }
   };
   ```
