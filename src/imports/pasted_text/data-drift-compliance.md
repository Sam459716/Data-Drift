DATA DRIFT COMPLIANCE AUTOPILOT
Tagline:

"Register once. Stay compliant continuously."

The main objective is to give vendors a strong practical reason to register and continue using DataDrift.

The feature should NOT be just another registration page, rating system, or verification badge.

It should function as a complete Vendor Compliance Management Center.

1. ADD A NEW VENDOR DASHBOARD SECTION
Add a new navigation item inside the existing Vendor Dashboard:

"Compliance Center"

Do not create a separate application.

The existing Vendor Dashboard should remain intact.

Inside Compliance Center create:

Compliance Overview
Digital Compliance Wallet
Compliance Autopilot
Instrument Compliance
Certificate & Expiry Management
Renewal Actions
Compliance Cost Analysis
Digital Compliance Passport
Compliance History
Reuse the existing DataDrift UI components and design language.

2. DIGITAL COMPLIANCE WALLET
Create a central dashboard where the vendor can manage all Legal Metrology compliance information.

Show:

Total instruments
Registered instruments
Verified instruments
Pending verification
Failed instruments
Expired certificates
Certificates expiring soon
Pending compliance actions
Last inspection
Next required action
Example:

COMPLIANCE HEALTH

94 / 100

🟢 HEALTHY

8 Instruments
8 Registered
7 Valid
1 Expiring Soon

2 Actions Required

[View Compliance Details]

The score must be deterministic and connected to the existing compliance system.

Do not use random values.

3. COMPLIANCE AUTOPILOT
Create a service/module called:

complianceAutopilotService

The Compliance Autopilot should continuously monitor the vendor's compliance information.

It should identify:

Certificate expiry
Verification expiry
Pending applications
Pending inspections
Failed verification
Expired instruments
Suspended instruments
Missing information
Incomplete documents
Required renewal
Compliance risks
Generate clear actions for the vendor.

Example:

⚠ ACTION REQUIRED

Electronic Weighing Scale
Instrument ID: LM-1028

Verification expires in 18 days.

[Start Renewal]

The button must actually open the existing renewal/verification workflow.

4. SMART EXPIRY ALERTS
Create configurable expiry alerts.

Example:

60 days before expiry:
"Your instrument verification expires in 60 days."

30 days:
"Your instrument verification expires in 30 days."

15 days:
"Verification expires soon."

7 days:
"Urgent: Verification expires in 7 days."

Expired:
"Certificate expired. Immediate action required."

Integrate these alerts with the existing notification system.

Do not create fake notifications.

5. INSTRUMENT COMPLIANCE TABLE
Create an instrument compliance section.

Show:

Instrument ID
Instrument type
Serial number
Certificate
Verification status
Certificate expiry
Compliance status
Next action
Example:

Instrument:
LM-1028

Type:
Electronic Weighing Scale

Certificate:
LM-CERT-23891

Status:
🟢 Valid

Expiry:
18 Sep 2026

Action:
[View] [Renew]

Each button must work.

Use existing instrument and certificate data if available.

6. ONE-CLICK RENEWAL
When an instrument requires renewal, show:

RENEWAL REQUIRED

Instrument:
Electronic Weighing Scale

Instrument ID:
LM-1028

Certificate:
LM-CERT-23891

Expiry:
18 Sep 2026

[START RENEWAL]

When clicked, open the EXISTING renewal/verification workflow.

Automatically pre-fill available information:

Vendor name
Business information
Instrument ID
Instrument type
Serial number
Existing certificate
Previous verification information
Existing location
The vendor should not have to enter information that already exists.

Workflow:

Existing Data
↓
Pre-filled Renewal Application
↓
Submit
↓
Officer Assignment
↓
Inspection
↓
GPS
↓
Evidence
↓
Verification
↓
Digital Certificate

7. "WHAT NEEDS MY ATTENTION?" SECTION
Add a highly visible action center.

Example:

WHAT NEEDS MY ATTENTION?

🔴 1 Expired Certificate

🟠 2 Certificates Expiring Soon

🟡 1 Instrument Requires Updated Information

🟢 5 Instruments Fully Compliant

Each item must be clickable and lead to the appropriate existing workflow.

8. COMPLIANCE COST DECISION ENGINE
This is one of the MOST IMPORTANT new features.

Create:

complianceCostService

The system should help the vendor compare:

VERIFY EXISTING INSTRUMENT

versus

REPLACE INSTRUMENT

Do NOT assume that verification is always cheaper.

Do NOT hard-code government fees.

Use configurable/demo values that can later be connected to official fee data.

Inputs may include:

Current instrument age
Verification cost
Instrument purchase price
Maintenance cost
Estimated remaining useful life
Replacement/setup cost
Previous verification history
Number of successful inspections
9. INTERACTIVE VERIFY VS REPLACE CALCULATOR
Create an interactive screen.

Example:

COMPLIANCE COST ANALYSIS

Instrument:
Electronic Weighing Scale

OPTION A

VERIFY EXISTING

Verification Cost:
₹X

Maintenance:
₹X/year

Estimated Remaining Life:
3 years

Compliance History:
Available

OPTION B

REPLACE

New Instrument:
₹Y

Setup:
₹Z

Verification:
Required

Previous History:
Lost

DATADRIFT RECOMMENDATION

🟢 VERIFY EXISTING

Estimated 3-year cost:
₹XX,XXX

Replacement estimated cost:
₹YY,XXX

Potential difference:
₹XX,XXX

Recommendation should explain WHY.

Example:

"Based on the current demo assumptions, continuing with the existing instrument appears more economical."

OR:

"Based on the current demo assumptions, replacement may be more economical."

Never present demo calculations as official government pricing.

Clearly label demo/configurable assumptions.

10. ALLOW THE VENDOR TO CHANGE COST ASSUMPTIONS
Make the calculator interactive.

Allow the vendor to modify:

Verification fee
Replacement cost
Maintenance cost
Instrument age
Expected remaining life
When the values change, recalculate the comparison immediately.

This must be functional.

11. DIGITAL COMPLIANCE PASSPORT
Create a new feature:

Digital Compliance Passport

This is NOT a replacement for the official government certificate.

It is a consolidated DataDrift compliance profile.

Example:

DATA DRIFT

DIGITAL COMPLIANCE PASSPORT

Business:
ABC Traders

Location:
Nashik, Maharashtra

Compliance Score:
94/100

Status:
🟢 COMPLIANT

Instruments:
8 Registered

Certificates:
7 Valid
1 Expiring Soon

Verification History:
2026 ✓
2025 ✓
2024 ✓

Validated Complaints:
0

Last Inspection:
18 Aug 2026

Add buttons:

[View Passport]

[Download Passport]

[Share Passport]

[Generate QR]

All buttons must work.

12. PUBLIC COMPLIANCE PASSPORT
Create a public-safe version of the Compliance Passport.

The public page should show only information intended for public visibility.

Example:

DATA DRIFT PUBLIC VERIFICATION

ABC Traders

🟢 COMPLIANT

✓ Business registered
✓ Applicable instruments registered
✓ Certificates currently valid

Compliance Score:
94/100

Last verification:
18 Aug 2026

Do NOT expose:

Private phone numbers
Private email
Payment information
Internal audit information
Internal fraud investigation information
Sensitive officer information
The QR generated from the passport should open this public verification page.

13. COMPLIANCE SCORE
Integrate with the existing compliance scoring system.

Create:

complianceScoreService

Calculate the score using deterministic factors such as:

Certificate validity
Instrument registration
Verification history
Failed inspections
Validated complaints
Renewal timeliness
Documentation completeness
Compliance trends
Score range:

0–100

Categories:

90–100 = Excellent
75–89 = Good
50–74 = Moderate
25–49 = High Risk
0–24 = Critical

The score must NOT randomly change.

14. COMPLIANCE SCORE BREAKDOWN
Display:

COMPLIANCE SCORE

94 / 100

Certificate Validity
98%

Verification History
95%

Renewal Timeliness
90%

Documentation
94%

Inspection Record
96%

Complaint Record
98%

Show why the score is increasing or decreasing.

Example:

+3 Successful verification

+2 Timely renewal

-4 Validated complaint

+1 Documentation completed

15. COMPLIANCE HISTORY
Create a timeline.

Example:

COMPLIANCE HISTORY

2026
✓ Instrument verified
✓ Certificate issued

2025
✓ Inspection completed
✓ Verification passed

2024
✓ Certificate renewed

2023
⚠ Verification delayed

Use actual existing records wherever possible.

16. AI COMPLIANCE ASSISTANT
Integrate this feature with the EXISTING Vendor AI Assistant.

The AI Assistant should understand the vendor's compliance context.

The vendor should be able to ask:

"What instruments need renewal?"

"Which certificate expires first?"

"Why is my compliance score 87?"

"What should I do next?"

"Should I verify or replace this instrument?"

"Show my compliance history."

"What is causing my compliance score to decrease?"

"How many instruments are currently compliant?"

Do NOT give the AI unrestricted database access.

Create a controlled service layer that retrieves only the logged-in vendor's permitted data.

17. ADD MICROPHONE / VOICE INPUT
Inside the existing Vendor AI Assistant message input, add a microphone button beside Send.

Example:

┌──────────────────────────────────────────────┐
│ Ask DataDrift anything... 🎙️ ➤ │
└──────────────────────────────────────────────┘

Click microphone:

┌──────────────────────────────────────────────┐
│ 🔴 Listening... 〰️〰️〰️〰️ ✕ 🎙️ │
└──────────────────────────────────────────────┘

Requirements:

Request browser microphone permission.
Start actual speech recognition.
Show "Listening..." indicator.
Show animated waveform.
Clicking microphone again stops recording.
Add Cancel option.
Convert speech to text.
Put transcript inside the normal chat input.
Allow vendor to edit transcript.
Vendor sends message normally.
Handle microphone permission denial.
Handle unsupported browsers.
Handle microphone errors.
Do not break normal text chat.
Create:

voiceInputService

with methods:

start()
stop()
cancel()
isSupported()
requestPermission()

Keep voice recognition independent from the AI chatbot service.

If browser-native speech recognition is unavailable, create a clean abstraction that can later connect to a production speech-to-text API.

18. VOICE + COMPLIANCE USE CASE
The following must work conceptually:

Vendor clicks 🎙️

Says:

"Which of my instruments expire this month?"

Speech becomes:

"Which of my instruments expire this month?"

The vendor can edit it.

Then clicks Send.

AI responds using the vendor's actual available compliance data.

Example:

"You have one instrument expiring this month: LM-1028, an Electronic Weighing Scale. Its verification expires on 18 September 2026."

19. AI COMPLIANCE INSIGHTS
Add an AI-assisted insight section.

Example:

AI-ASSISTED INSIGHT

🟢 Your business is currently compliant.

⚠ One instrument requires renewal within 30 days.

💡 Based on the configured cost assumptions, verification currently appears more economical than replacement.

📈 Your compliance score increased by 4 points this quarter.

Clearly label these as:

"AI-assisted insight"

Do not represent AI output as an official government decision.

20. NOTIFICATIONS
Integrate with the existing notification system.

Vendor notifications should include:

Certificate expiring
Verification required
Renewal reminder
Application submitted
Inspection scheduled
Inspection completed
Certificate issued
Compliance score changed
Compliance risk increased
Action required
21. VENDOR DASHBOARD OVERVIEW
Add a compact Compliance Health card to the existing Vendor Dashboard.

Example:

COMPLIANCE HEALTH

94 / 100

🟢 HEALTHY

8 Instruments
7 Valid
1 Expiring Soon

[Manage Compliance]

Also add:

NEXT ACTION

Electronic Weighing Scale
LM-1028

Verification expires in 18 days.

[Start Renewal]

Do not remove existing dashboard cards.

22. VENDOR VALUE PROPOSITION
Add a subtle section explaining why the vendor should use DataDrift.

Title:

WHY USE DATADRIFT?

Manage all instruments in one place.
Never miss certificate expiry.
Get automated compliance reminders.
Pre-fill renewal applications.
Understand compliance risks.
Compare verification versus replacement economics.
Maintain a digital compliance history.
Generate a Digital Compliance Passport.
Ask the AI Assistant questions using text or voice.
Do not make unsupported legal or financial claims.

23. BACKEND SERVICES
Create or extend these service abstractions:

complianceAutopilotService

expiry monitoring
compliance actions
reminders
renewal recommendations
complianceScoreService

deterministic score
category scores
score history
complianceCostService

verification vs replacement
scenario analysis
cost recommendation
compliancePassportService

passport generation
public-safe data
QR verification
vendorNotificationService

expiry notifications
action reminders
score changes
voiceInputService

microphone handling
speech recognition
transcript handling
permission handling
24. DATABASE
If the existing database already has equivalent tables/entities, EXTEND THEM instead of creating duplicates.

Potential entities:

vendors
instruments
certificates
applications
inspections
compliance_scores
compliance_score_events
compliance_actions
compliance_alerts
compliance_cost_analysis
compliance_passports
notifications

Example:

compliance_actions

id
vendor_id
instrument_id
action_type
priority
due_date
status
created_at
completed_at
related_application_id

compliance_score_events

id
vendor_id
previous_score
new_score
change
reason
source_type
source_id
created_at

compliance_cost_analysis

id
vendor_id
instrument_id
verification_cost
replacement_cost
maintenance_cost
instrument_age
remaining_life
recommendation
calculated_at

25. ROLE-BASED SECURITY
Vendor can only access:

Own instruments
Own certificates
Own applications
Own inspections where permitted
Own compliance score
Own compliance passport
Own cost analysis
Own AI Assistant context
Vendor must NOT access:

Other vendors
Internal admin data
Officer audit logs
Internal fraud investigations
Other vendors' financial information
Respect the existing RBAC system.

26. DESIGN REQUIREMENTS
IMPORTANT:

Keep the EXISTING DataDrift design language.

Do NOT redesign the application.

Reuse:

Existing colors
Existing typography
Existing sidebar
Existing cards
Existing buttons
Existing icons
Existing spacing
Existing tables
Existing modals
Existing toast notifications
Existing responsive components
The new Compliance Center must look like it was always part of DataDrift.

Use a clean, professional, government-grade interface.

27. RESPONSIVE DESIGN
The new feature must work properly on:

Desktop
Tablet
Mobile
On mobile:

Convert large tables into cards.
Keep compliance status visible.
Make renewal actions easy to tap.
Make microphone controls touch-friendly.
Make charts responsive.
Avoid horizontal overflow.
Keep important alerts above the fold.
28. DEMO DATA
Create realistic deterministic demo data.

Example vendors:

Shree Ganesh Grocery
Mahalaxmi Traders
Sai General Store
Om Weighing Solutions

Example instruments:

Electronic Weighing Scale
Platform Scale
Counter Scale
Digital Weighing Machine

Use Indian districts/cities.

Use fictional data only.

Do not use real people's personal information.

29. IMPORTANT PRODUCT POSITIONING
The final product should NOT communicate:

"Register because DataDrift says so."

Instead communicate:

"Register because DataDrift makes compliance easier."

The core value proposition is:

REGISTER ONCE → DATA DRIFT MANAGES YOUR COMPLIANCE
Vendor Registration
↓
Digital Compliance Wallet
↓
Instrument Management
↓
Certificate Monitoring
↓
Expiry Alerts
↓
Compliance Risk
↓
Renewal Recommendation
↓
Pre-filled Renewal
↓
Officer Inspection
↓
GPS + Evidence
↓
Verification
↓
Digital Certificate
↓
Compliance Passport
↓
Continuous Compliance

30. IMPORTANT: DO NOT CREATE FAKE BUTTONS
Every major button must perform a real action.

Examples:

Start Renewal
→ Existing renewal workflow

View Certificate
→ Existing certificate details

View Inspection
→ Existing inspection record

View Passport
→ Actual passport page/modal

Download Passport
→ Generate/download document

Share Passport
→ Generate public-safe verification link

Generate QR
→ Generate actual QR

View on Map
→ Existing map system

Ask AI
→ Existing AI service

Microphone
→ Actual speech recognition

31. FINAL TESTING
Before finishing:

Test Vendor Dashboard.
Test Compliance Center.
Test Compliance Wallet.
Test instrument list.
Test certificate expiry.
Test expiry alerts.
Test renewal workflow.
Test cost calculator.
Test changing cost assumptions.
Test compliance score.
Test compliance history.
Test Compliance Passport.
Test public passport.
Test QR.
Test notifications.
Test AI Assistant.
Test microphone.
Test microphone permission.
Test permission denied state.
Test speech transcription.
Test transcript editing.
Test mobile layout.
Test desktop layout.
Test RBAC.
Test navigation.
Check console errors.
Check broken imports.
Check TypeScript/JavaScript errors.
Ensure project builds successfully.
32. FINAL ACCEPTANCE FLOW
A vendor must be able to complete this complete journey:

REGISTER
↓
ADD INSTRUMENT
↓
VIEW CERTIFICATE
↓
VIEW COMPLIANCE SCORE
↓
RECEIVE EXPIRY ALERT
↓
OPEN COMPLIANCE CENTER
↓
SEE ACTION REQUIRED
↓
OPEN COST ANALYSIS
↓
COMPARE VERIFY VS REPLACE
↓
CHOOSE RENEWAL
↓
OPEN PRE-FILLED RENEWAL
↓
SUBMIT APPLICATION
↓
OFFICER ASSIGNMENT
↓
INSPECTION
↓
GPS + DIGITAL EVIDENCE
↓
VERIFICATION
↓
DIGITAL CERTIFICATE
↓
COMPLIANCE SCORE UPDATED
↓
COMPLIANCE PASSPORT UPDATED
↓
VENDOR NOTIFICATION

AI ASSISTANT:

TYPE QUESTION
OR
🎙️ SPEAK QUESTION
↓
SPEECH TO TEXT
↓
EDIT TRANSCRIPT
↓
SEND
↓
AI RESPONSE
↓
COMPLIANCE ACTION IF REQUIRED

33. MOST IMPORTANT GOAL
The final Vendor Dashboard should make a vendor think:

"I don't want to lose this account because it keeps track of my instruments, certificates, renewals and compliance automatically."

The platform should therefore feel like:

DATA DRIFT COMPLIANCE AUTOPILOT
"Register once. Stay compliant continuously."
Do not remove or break any existing DataDrift functionality while implementing this feature.