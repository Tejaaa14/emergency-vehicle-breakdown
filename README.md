# 🚨 Emergency Vehicle Breakdown Services

**Emergency Vehicle Breakdown Services** is a full-stack web application that allows users to quickly request roadside assistance such as towing, flat tire help, fuel delivery, and more.  
It features an interactive admin dashboard to manage and resolve requests in real-time.

---

## 🌟 Features

- 🚗 Submit and track emergency assistance requests
- 📊 Admin dashboard with live request status (New, In Progress, Completed)
- 🔍 Filter and search service requests dynamically
- 📝 Add technician notes and manage request status
- 📱 Mobile responsive design
- ⚙️ REST API powered by Flask backend

---

## 🛠️ Tech Stack

- **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
- **Backend:** Python (Flask), Flask-CORS
- **UI Styling:** Custom CSS with minimal UI components

> ✅ This is a full-stack application. All request data is handled via Flask APIs.

---

## 🚀 Getting Started

To run the project locally:

1. **Clone the repository:**

    ```bash
    git clone https://github.com/yourusername/emergency-vehicle-breakdown.git
    cd emergency-vehicle-breakdown
    ```

2. **Install dependencies and run the Flask server:**

    ```bash
    pip install flask flask-cors
    python app.py
    ```

3. **Open `index.html` in your browser:**

    ```bash
    open index.html
    ```

> For real-time admin features, open `admin.html` in a separate tab.

---

## 📷 Screenshots

### 🧾 User Request Form  
![User Form](images/user-form.png)

### 🛠️ Admin Dashboard  
![Admin Dashboard](images/admin-dashboard.png)

### 📋 Request Detail Panel  
![Detail Panel](images/request-detail.png)

---

## 📂 Project Structure

```text
index.html        # User-facing form to submit breakdown requests
admin.html        # Admin panel for viewing and updating requests
styles.css        # Custom responsive styles
script.js         # User-side form logic and validation
admin.js          # Admin dashboard interactions and auto-refresh
app.py            # Flask backend API
