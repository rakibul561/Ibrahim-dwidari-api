# 📄 Credit Application Management System (Backend)

A robust **Credit Application Management System** built with **Node.js, Express, Prisma (MongoDB)** to handle **Personal & Business credit applications**, admin review workflow, and dashboard overview.

---

## 🚀 Features Implemented

### ✅ Application Types

* Personal Credit Application
* Business Credit Application

### ✅ Application Workflow

* Draft → Pending → In Review → Approved / Rejected
* Step-wise data submission
* Clean API responses based on application type

### ✅ Admin Dashboard Support

* Overview cards (Total, Pending Review, Approved Today, Rejected)
* Application list with:

  * Pagination
  * Search
  * Filter by type & status
  * Date range filter

### ✅ Application Management

* Get all applications (formatted by type)
* Get single application (type-based response)
* Update application status (Approve / Reject / In Review)

---

## 🛠️ Tech Stack

* **Node.js**
* **Express.js**
* **TypeScript**
* **Prisma ORM**
* **MongoDB**
* **Zod** (Request Validation)

---

## 📂 Project Structure

```
src/
├── app/
│   ├── modules/
│   │   └── application/
│   │       ├── application.controller.ts
│   │       ├── application.service.ts
│   │       ├── application.route.ts
│   │       ├── application.validation.ts
│   │       └── application.overview.service.ts
│   ├── utils/
│   │   ├── catchAsync.ts
│   │   ├── sendResponse.ts
│   │   └── PrismaQueryBuilder.ts
│   ├── errors/
│   │   └── ApiError.ts
│   └── prisma/
│       └── prisma.ts
```

---

## 🔑 API Endpoints

### 📌 Application Overview

```
GET /applications/overview
```

**Response**

```json
{
  "totalApplications": 6,
  "pendingReview": 4,
  "approvedToday": 0,
  "rejected": 1
}
```

---

### 📌 Get All Applications (List)

```
GET /applications
```

**Supports**

* Pagination
* Search (name, email, referenceId, ssn, businessName)
* Filter by type & status
* Date range filter

---

### 📌 Get Single Application

```
GET /applications/:id
```

**Behavior**

* If `type = PERSONAL` → returns personal + employment info
* If `type = BUSINESS` → returns business, bank & guarantor info

---

### 📌 Update Application Status (Admin)

```
PATCH /applications/:id/status
```

**Request Body**

```json
{
  "status": "APPROVED",
  "note": "All documents verified"
}
```

**Rules**

* `PENDING → IN_REVIEW`
* `IN_REVIEW → APPROVED / REJECTED`
* Approved / Rejected cannot be changed again

---

## 🧠 Business Logic Highlights

* Single application collection (Personal + Business)
* Type-based response formatting
* Separate overview aggregation (fast & scalable)
* Safe ObjectId validation
* Clean route ordering to prevent conflicts

---

## ⚙️ Setup Instructions

### 1️⃣ Clone Repository

```bash
git clone <repository-url>
cd project-folder
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Environment Variables

Create `.env` file:

```env
DATABASE_URL="mongodb+srv://<user>:<password>@cluster.mongodb.net/dbname"
PORT=5000
```

### 4️⃣ Prisma Setup

```bash
npx prisma generate
```

### 5️⃣ Run Server

```bash
npm run dev
```

---

## 🧪 Validation & Error Handling

* Zod-based request validation
* Centralized error handling
* Meaningful HTTP status codes

---

## 🔐 Security Notes

* ObjectId validation before DB queries
* Sensitive fields filtered in responses
* Ready for role-based access control

---

## 📈 Future Improvements

* Status change history tracking
* Monthly statistics for charts
* Sales performance tracking
* Notification & reminder system
* Role-based permissions (Admin / Sales)
