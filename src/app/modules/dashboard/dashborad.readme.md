



`api: /dashboard/calender/reminders`

## 1️⃣ Callbacks →

Context:
1. These are applications that
2. Have not been processed yet
3. Have been sitting too long
4. Require a call from sales/admin

Logical Rule ---->
status IN (PENDING, IN_REVIEW)
AND submittedDate <= now - X days
(X = 3 days)

Meaning ---->
If an application is still pending or under review after 3 days,
it is considered stale and requires a callback.

____________________________________________________________________

## 2️⃣ Follow-Ups →

Context:
1. These are applications that
2. Have already been approved
3. But no recent activity has happened
4. Require follow-up engagement

Logical Rule ---->
status = APPROVED
AND updatedAt <= now - X days
(X = 15 days)

Meaning ---->
If an approved application has not been updated for 15 days,
it likely needs sales follow-up.

____________________________________________________________________

## 3️⃣ Lease Expirations →

Context:
1. These are approved customers
2. Who are renters
3. Likely approaching lease renewal cycle
4. May need renewal or upgrade conversation

Logical Rule ---->
status = APPROVED
AND residencyType = RENT

____________________________________________________________________


## 4️⃣ Service Due →

Context:
1. These are approved customers
2. Who have completed the application process
3. And are due for post-approval service/contact
4. Require maintenance or periodic check

Logical Rule ---->
status = APPROVED
AND hasCoSigner = true