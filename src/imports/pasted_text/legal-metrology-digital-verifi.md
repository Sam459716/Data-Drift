Build a modern, realistic, responsive web + mobile application for **SIH 2026 – Team DataDrift** to digitize and streamline Legal Metrology workflows.

The project should be a professional Government/Enterprise-style platform for Users/Businesses, Legal Metrology Officers and Administrators.

## PROJECT NAME

**Legal Metrology Digital Verification & Instrument Management System**

Use a premium, trustworthy government design with:

* Clean white and blue theme
* Professional typography
* Modern cards and tables
* Clear status badges
* Timelines
* Progress indicators
* Responsive layouts
* Desktop web interface
* Mobile-friendly Officer interface
* Realistic sample data
* Accessible and simple UX

Do not invent official government rules, fees or legal limits. Use configurable placeholders for fees, permissible limits and legal requirements.

---

# 1. USER / BUSINESS PORTAL

Create a complete User/Business dashboard.

### Navigation

Dashboard
My Instruments
Register Instrument
Applications
Payments
Inspections
Certificates
Instrument Passport
Complaints
AI Assistant
Notifications
Profile
Logout

### User features

Users can:

* Sign up and log in
* Register instruments
* Receive a unique Instrument ID
* Apply for verification/re-verification
* Pay configurable fees
* Schedule/request inspection
* Track application status
* View inspection history
* View/download digital certificates
* Verify certificates through QR
* Receive expiry and renewal reminders
* Submit complaints
* Chat with an AI assistant

---

# 2. UNIQUE INSTRUMENT ID

Every registered instrument must receive a unique ID.

Example:

**LM-MH-PUN-000123**

Instrument information should include:

* Instrument ID
* Serial number
* Instrument type
* Manufacturer
* Model
* Capacity/range
* Owner/business
* Location
* Registration date
* Current status
* Documents
* Certificate

---

# 3. INSTRUMENT PASSPORT

Create an **Instrument Passport** page.

Show:

* Instrument ID
* Instrument details
* Owner/business
* Current location
* Current verification status
* Certificate status
* Validity date
* Previous locations
* Verification history
* Inspection history
* Re-verification history
* Certificates

Show the history as a clear timeline.

Example:

Registration
↓
Verification
↓
Certificate Issued
↓
Inspection
↓
Location Changed
↓
Re-verification
↓
New Certificate

Add **Cross-Location History** so previous locations and verification records remain visible.

---

# 4. APPLICATION WORKFLOW

Use this complete workflow:

Registration
→ Instrument Registration
→ Fee Payment
→ Application
→ Scheduling
→ Officer Assignment
→ Field Verification
→ Result
→ Certificate
→ QR Activation
→ Public Verification
→ Notifications/Renewal

Application statuses:

Submitted
Under Review
Payment Pending
Payment Paid
Scheduled
Inspection Completed
Approved
Rejected
Re-verification Required
Certificate Generated

Display status using badges and progress indicators.

---

# 5. OFFICER PORTAL / MOBILE APP

Create a separate **mobile-first Officer interface** using the same backend/database.

Officer login must be separate from normal User login.

Use Role-Based Access Control.

Example:

User account → User Dashboard

Officer account → Officer Dashboard

Admin account → Admin Dashboard

Normal users must not be able to access Officer or Admin pages.

### Officer navigation

Dashboard
My Assignments
Scan Instrument
Field Verification
Instrument History
Measurement Analysis
Certificates
Complaints
Notifications
Profile
Logout

### Officer Dashboard

Show:

* Today's assignments
* Pending verification
* Completed verification
* High-priority cases
* Expiring certificates
* Assigned instruments
* Recent activities

Use realistic sample data.

---

# 6. OFFICER FIELD VERIFICATION

Create a simple mobile-first workflow:

Assigned Case
→ Scan QR / Enter Instrument ID
→ Instrument Details
→ Owner History
→ Previous Verification History
→ Instrument Check
→ Enter Measurements
→ Automatic Error Calculation
→ AI Anomaly Analysis
→ Officer Decision
→ Certificate

Make buttons large and easy to use in the field.

Minimize typing wherever possible.

---

# 7. MEASUREMENT & ERROR CALCULATION

Create a measurement form.

Fields:

* Standard Value
* Observed Value
* Permissible Limit
* Multiple measurement readings

Automatically calculate:

**Error = Observed Value − Standard Value**

**Percentage Error = (Error / Standard Value) × 100**

Show:

* Error
* Percentage Error
* Permissible Limit
* Pass/Fail

Keep permissible limits configurable.

Do not invent official Legal Metrology limits.

---

# 8. AI ANOMALY DETECTION

Add an AI Analysis section for officers.

Show:

* Risk Score
* Risk Level
* Detected Pattern
* Explanation
* Recommendation

Example:

**Risk Score: 18/100**

**Risk Level: Low**

"Measurements appear consistent with previous records."

For the prototype, mock/demo AI analysis can be used until a real machine-learning model is connected.

Clearly label demo AI results as **AI Demo Analysis**.

---

# 9. AI CHAT ASSISTANT FOR USERS

Add an **AI Chat Assistant** inside the User Dashboard.

Create a floating chat button and a dedicated AI Assistant page.

The assistant should help users with:

* How to register an instrument
* Application status
* Verification process
* Required documents
* Payment status
* Certificate information
* Renewal reminders
* How to verify a certificate
* General system navigation

Example:

User:
"How can I apply for re-verification?"

AI Assistant:
"Open My Instruments → Select your instrument → Choose Re-verification → Submit the application."

Important:

The AI assistant must NOT invent government laws, fees or legal requirements.

When information is unavailable, it should clearly say that the user should check with the department/officer.

---

# 10. COMPLAINT BOX

Add a **Complaint Box** to the User portal.

User can submit:

* Complaint category
* Subject
* Description
* Instrument ID
* Application ID
* Optional evidence/document
* Date
* Status

Complaint statuses:

Submitted
Under Review
Assigned
In Progress
Resolved
Closed

After submission, show a Complaint ID.

Example:

**CMP-2026-00125**

---

# 11. COMPLAINTS FOR OFFICERS

Complaints submitted by users must appear in the Officer portal.

Create:

**Officer → Complaints**

Officer can:

* View assigned complaints
* View complaint details
* View related instrument/application
* Add remarks
* Upload evidence
* Change status
* Resolve complaint
* Forward/escalate complaint

Show complaint priority:

Low
Medium
High
Urgent

---

# 12. COMPLAINTS FOR ADMIN

Complaints must also appear in the Admin portal.

Admin can:

* View all complaints
* Filter by status
* Filter by district
* Filter by officer
* Filter by category
* Assign complaints to officers
* Reassign complaints
* Escalate complaints
* Monitor resolution time
* View complaint history
* Close complaints

Add complaint analytics:

Total Complaints
Pending
In Progress
Resolved
Escalated
Average Resolution Time

---

# 13. DIGITAL CERTIFICATE

After successful verification, generate a digital certificate.

Certificate should contain:

* Certificate Number
* Certificate ID
* Instrument ID
* Instrument details
* Owner/business
* Verification date
* Validity date
* Officer ID
* Verification ID
* QR code

Use realistic certificate design.

---

# 14. QR CERTIFICATE VERIFICATION

Create a public **Verify Certificate** page.

Users do not need to log in.

Allow:

* Enter Certificate ID
* Scan QR code

The system checks the certificate record.

Show:

**VALID**

**EXPIRED**

or

**INVALID**

Only show non-sensitive certificate information.

Example:

Certificate ID
Instrument ID
Instrument Type
Verification Date
Validity Date
Certificate Status

---

# 15. EXPIRY & RENEWAL ALERTS

Create notification categories:

* Expired
* Expires in 30 days
* Expires in 60 days
* Expires in 90 days

Show alerts in the User dashboard.

Also show relevant expiry cases to Officers and Admins.

---

# 16. ADMIN PORTAL

Create a separate Admin Dashboard.

### Navigation

Dashboard
Users
Officers
Instruments
Applications
Inspections
Payments
Certificates
Complaints
Notifications
Analytics
Reports
Audit Logs
Settings
Logout

Admin can manage:

* Users
* Officers
* Instruments
* Applications
* Inspections
* Payments
* Certificates
* Complaints
* Notifications
* Reports
* Audit logs

---

# 17. ADMIN ANALYTICS

Create a Tableau-style interactive analytics dashboard.

Use:

* KPI cards
* Bar charts
* Line charts
* Pie/donut charts
* Tables
* Filters
* Date ranges
* State/district filters
* Instrument-type filters
* Application-status filters

Show:

* Total Instruments
* Verified Instruments
* Pending Applications
* Expired Certificates
* Failed Verifications
* Re-verifications
* Applications Trend
* Inspection Trend
* Pass/Fail Statistics
* Payment/Revenue Summary
* Active vs Expired Certificates
* District-wise statistics
* State-wise statistics
* Complaint statistics
* Officer workload

---

# 18. AUDIT TRAIL

Create an Audit Logs section.

Record:

* User/officer/admin
* Action
* Date
* Time
* Related instrument/application
* Status change

Example:

Officer #LM102
→ Verified Instrument
→ 28 Aug 2026
→ 10:42 AM

System
→ Certificate Generated
→ 28 Aug 2026
→ 10:45 AM

---

# 19. NOTIFICATIONS

Create notifications for:

Users:

* Application updates
* Payment updates
* Inspection scheduling
* Certificate generation
* Certificate expiry
* Renewal reminders
* Complaint updates

Officers:

* New assignment
* Schedule changes
* High-priority cases
* Complaints assigned
* Expiring instruments

Admins:

* New applications
* Payment updates
* Complaints
* Officer workload
* System alerts

---

# 20. MULTI-LANGUAGE SUPPORT

Add language selection:

English
हिन्दी
मराठी

Changing the language must update the complete interface, including:

* Navigation
* Buttons
* Forms
* Labels
* Status messages
* Notifications
* Dashboard text
* AI assistant interface
* Complaint forms

Do not translate only the navigation; the entire interface should change language.

---

# 21. SECURITY

Implement the UI and architecture for:

* Secure authentication
* Role-Based Access Control
* Protected routes
* API authorization
* Form validation
* Payment-status validation
* Audit logs
* Secure certificate verification

Roles:

USER
OFFICER
ADMIN

---

# 22. RESPONSIVE DESIGN

The User and Admin portals should work well on:

Desktop
Laptop
Tablet
Mobile

The Officer interface should be specifically optimized for mobile field use.

Use:

* Large touch buttons
* Simple navigation
* Minimal typing
* QR scanning
* Clear status indicators
* Step-by-step forms

---

# 23. DEMO FLOW

The complete SIH demonstration should work as:

USER

Login
→ Register Instrument
→ Receive Instrument ID
→ Pay Fee
→ Submit Verification
→ Schedule Inspection
→ Track Status

↓

OFFICER

Login with separate Officer account
→ View Assignment
→ Scan Instrument
→ View Instrument Passport
→ Conduct Field Verification
→ Enter Measurements
→ Calculate Error
→ AI Analysis
→ Approve/Reject/Reverify
→ Generate Certificate

↓

USER / PUBLIC

View Certificate
→ Scan QR
→ Public Certificate Verification
→ Valid/Expired/Invalid

↓

USER

Receive Expiry/Renewal Notification

↓

COMPLAINT

User submits Complaint
→ Officer receives Complaint
→ Officer investigates
→ Admin monitors/assigns/escalates
→ Complaint resolved

---

# 24. IMPORTANT DESIGN & DEVELOPMENT RULES

* Build this as a new clean project.
* Keep the design consistent across User, Officer and Admin.
* Do not make the UI look like a generic template.
* Use realistic Legal Metrology sample data.
* Keep all fees configurable.
* Keep legal rules and permissible limits configurable.
* Do not invent official government regulations.
* Do not expose sensitive user information through QR verification.
* Use simple, maintainable components.
* Avoid unnecessary complexity.
* Make the workflow easy for SIH judges to understand.
* Clearly demonstrate the complete instrument lifecycle.

The core concept should be:

**One Instrument → One Digital Identity → Complete Lifecycle History**

Registration
→ Verification
→ Inspection
→ AI Analysis
→ Certificate
→ QR
→ Public Verification
→ Renewal
→ Future Inspections
→ Complete History

Make the final product look like a realistic, production-ready Government Legal Metrology platform suitable for an SIH 2026 demonstration.