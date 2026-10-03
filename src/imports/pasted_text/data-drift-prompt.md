MASTER PROMPT — ADD ANTI-GAMING, AI VOICE ASSISTANT & REAL-WORLD GEO DISCOVERY TO EXISTING DATADRIFT

IMPORTANT:
I already have an existing DataDrift Legal Metrology Verification & Digital Certification platform built from Figma.

DO NOT CREATE A NEW APPLICATION.

Your task is to carefully inspect the EXISTING DataDrift website and ADD the features described below while preserving the existing application.

========================================================
CRITICAL — PRESERVE THE EXISTING DATADRIFT WEBSITE
========================================================

Before making any changes:

1. Inspect the complete existing project.
2. Understand the current:
   - Design system
   - Colors
   - Typography
   - Spacing
   - Navigation
   - Sidebar
   - Header
   - Cards
   - Buttons
   - Forms
   - Tables
   - Modals
   - Dashboards
   - Consumer Portal
   - Vendor Portal
   - Officer Dashboard
   - Admin Dashboard
   - QR verification
   - Certificates
   - Ratings/reviews
   - Trust Score
   - Existing AI functionality
   - Existing maps/location functionality
3. Reuse existing components wherever possible.

DO NOT:

- Redesign the website
- Replace the existing layout
- Change the DataDrift branding
- Change the existing color palette
- Change typography
- Replace the sidebar
- Replace the navigation
- Remove existing features
- Break existing workflows
- Create duplicate pages unnecessarily
- Create fake buttons
- Create visual-only mockups
- Replace existing functionality with placeholders

The new functionality must look as if it was always part of DataDrift.

Only make UI changes where necessary to support the new features.

========================================================
NEW DATADRIFT EXPERIENCE
========================================================

Add three connected systems:

1. Anti-Gaming & Trust Engine
2. AI Consumer Assistant with Voice Input
3. Real GPS + Real Map + Nearby Shop/Instrument Discovery

The overall ecosystem should become:

REAL VERIFIED DATA
        ↓
VERIFIED TRANSACTION
        ↓
CUSTOMER RATING
        ↓
ANTI-GAMING & TRUST ENGINE
        ↓
TRUST SCORE
        ↓
CUSTOMER PREFERENCE
        ↓
INCENTIVE / VISIBILITY


At the same time:

CONSUMER
   ↓
AI ASSISTANT
   ↓
TEXT OR VOICE
   ↓
LOCATION
   ↓
REAL MAP
   ↓
NEARBY SHOPS / INSTRUMENTS
   ↓
VERIFICATION
   ↓
TRUST SCORE
   ↓
QR CERTIFICATE


========================================================
FEATURE 1 — ANTI-GAMING & TRUST ENGINE
========================================================

Create an Anti-Gaming & Trust Layer for the existing Vendor Rating, Review, Trust Score and Incentive ecosystem.

The purpose is to prevent vendors/users from manipulating ratings, reviews, Trust Scores, badges, visibility or incentives.

Core flow:

Vendor
↓
Verified Transaction
↓
Customer Rating
↓
ANTI-GAMING LAYER
↓
Trust Score
↓
Incentive / Visibility


--------------------------------------------------------
1. VERIFIED TRANSACTION ONLY
--------------------------------------------------------

Only customers connected to a genuine verified transaction can submit a rating/review.

Use the existing DataDrift:

- Vendor
- Instrument
- QR verification
- Certificate
- Verification
- Transaction/reference

data wherever available.

Before accepting a review, verify that the required transaction relationship exists.

If no valid verified transaction exists:

Show:

"Rating unavailable"

"Ratings can only be submitted after a verified transaction."

Do not allow submission.

--------------------------------------------------------
2. ONE TRANSACTION = ONE REVIEW
--------------------------------------------------------

A single verified transaction can generate only one review.

If the customer already reviewed that transaction:

Show:

"Review already submitted"

Allow them to view their existing review.

Prevent duplicate submissions.

--------------------------------------------------------
3. SUSPICIOUS RATING DETECTION
--------------------------------------------------------

Create an Anti-Gaming detection service.

Check for patterns including:

- Sudden large increase in ratings
- Unusual concentration of 5-star ratings
- Many ratings within a short period
- Repeated rating behavior
- Suspicious account/session patterns
- Abnormal rating distribution
- Suspicious transaction relationships
- Repeated reviews
- Similar review timing
- Similar review content

Example:

Normal historical rating:
4.4

Recent rating:
4.9

Recent activity:
Unusually high

System:

"Suspicious rating activity detected"

Risk:
MEDIUM


IMPORTANT:

Do not automatically accuse a vendor of fraud.

Flag the activity for human review.

--------------------------------------------------------
4. REVIEW AUTHENTICITY
--------------------------------------------------------

Detect:

- Duplicate reviews
- Nearly identical review text
- Repeated phrases
- Abnormally frequent reviews
- Suspicious review timing
- Suspicious account behavior

Internal status:

NORMAL
SUSPICIOUS
FLAGGED
REVIEWED
CLEARED

These internal detection details should only be visible to authorized Officer/Admin users.

--------------------------------------------------------
5. RATING MANIPULATION DETECTION
--------------------------------------------------------

Monitor vendor rating history over time.

If abnormal behavior occurs:

- Flag the vendor
- Temporarily flag Trust Score
- Prevent suspicious ratings from disproportionately increasing Trust Score
- Notify authorized Officer/Admin users

Example:

"Rating activity is currently under review."

Do not remove legitimate reviews automatically.

--------------------------------------------------------
6. COMPLAINT PENALTY
--------------------------------------------------------

Integrate the existing Consumer Complaint system with Trust Score.

IMPORTANT:

A complaint must NOT reduce Trust Score merely because it was submitted.

Only a validated/confirmed complaint can affect Trust Score.

Workflow:

Complaint Submitted
↓
Under Review
↓
Investigation
↓
Validated / Rejected
↓
Trust Score impact if validated


--------------------------------------------------------
7. TRUST SCORE
--------------------------------------------------------

Use the following conceptual calculation:

Trust Score =
Customer Ratings
+
Verified Compliance
+
Verification History
-
Validated Complaints
-
Suspicious Activity Penalties

Normalize the score to:

0–100


Example:

Trust Score
94/100

Breakdown:

Customer Ratings        30/35
Verified Compliance     30/30
Verification History    25/25
Validated Complaints    -3
Suspicious Activity     -3

Final:
94/100


IMPORTANT:

Do not make Trust Score depend only on star ratings.

--------------------------------------------------------
8. VERIFIED VENDOR BADGE
--------------------------------------------------------

Integrate Trust Score into the existing Vendor Profile.

Example:

✓ VERIFIED VENDOR

Trust Score
94/100

Customer Rating
4.8 ★

Verification Status
Verified


The badge must depend on legitimate verification/compliance conditions.

A vendor must NOT receive a Trusted/Verified badge merely because they have many 5-star ratings.

--------------------------------------------------------
9. INCENTIVE ENGINE
--------------------------------------------------------

Connect Trust Score to the existing incentive concept.

Correct:

Verified
↓
Authentic Ratings
↓
Anti-Gaming Checks
↓
Trust Score
↓
Eligible Incentive
↓
Higher Visibility


Do NOT create:

5-star rating
↓
automatic reward


Use the concept:

"INCENTIVE-DRIVEN ADOPTION"

Do not claim vendor verification is legally compulsory.

--------------------------------------------------------
10. ADMIN/OFFICER ANTI-GAMING VIEW
--------------------------------------------------------

Integrate Anti-Gaming into the existing Officer/Admin dashboard.

Do not create a completely unrelated dashboard.

Add:

Summary cards:

- Ratings Analyzed
- Suspicious Ratings
- Vendors Under Review
- Confirmed Manipulation Cases

Table:

Vendor
Rating Activity
Trust Score
Risk Level
Reason
Status
Last Activity


Statuses:

Normal
Under Review
Cleared
Confirmed Manipulation

--------------------------------------------------------
11. CASE DETAIL VIEW
--------------------------------------------------------

When authorized Officer/Admin opens a suspicious case, show:

Vendor Profile
Trust Score
Customer Rating
Rating History
Rating Distribution
Recent Rating Timeline
Verified Transactions
Suspicious Activity Indicators
Related Complaints
Compliance History
Detection Reasons

Show:

"AI/Automated Detection — Human Review Required"

Actions:

- Under Review
- Clear
- Confirm Manipulation
- Add Remarks

Integrate actions into the existing audit trail.

========================================================
FEATURE 2 — CONSUMER AI ASSISTANT + MICROPHONE
========================================================

Add a fully functional AI Assistant to the EXISTING Consumer Portal.

The AI Assistant must support:

TEXT INPUT
+
VOICE INPUT


The experience should be:

Type → Edit → Send

OR

Speak → Transcribe → Edit → Send


--------------------------------------------------------
1. CHATBOT LOCATION
--------------------------------------------------------

Add the AI Assistant into the existing Consumer Portal.

If an existing chatbot exists:

Upgrade it.

If there is no chatbot:

Add a compact AI Assistant entry point using the existing DataDrift UI style.

Do not create a giant unrelated chatbot interface.

--------------------------------------------------------
2. CONSUMER QUESTIONS
--------------------------------------------------------

The assistant should support questions such as:

"How do I verify a weighing machine?"

"Is this vendor verified?"

"How can I submit a complaint?"

"Where can I find verified shops near me?"

"Show weighing machines within 2 km."

"Is this certificate valid?"

"What does this Trust Score mean?"

"Find verified vendors near me."

"How do I report an inaccurate instrument?"

"How can I track my complaint?"

--------------------------------------------------------
3. CHAT INPUT
--------------------------------------------------------

The input should look like:

[ Type your message...                ] [🎙] [Send]

Place the microphone icon beside the Send button.

Reuse the existing input styling.

--------------------------------------------------------
4. MICROPHONE
--------------------------------------------------------

The microphone must be FUNCTIONAL.

When the user clicks 🎙:

Request browser/device microphone permission.

If permission is granted:

Start recording.

Show:

"Listening…"

Display a subtle animated waveform.

Example:

Listening…
〰〰〰〰〰


Clicking the microphone again:

STOP RECORDING.


--------------------------------------------------------
5. SPEECH TO TEXT
--------------------------------------------------------

After recording stops:

Convert speech into text.

Place the transcription directly into the existing chat input.

Example:

User says:

"Show me verified weighing machines near me"

Input becomes:

"Show me verified weighing machines near me"


DO NOT automatically send the message.

The user must be able to:

- Edit
- Delete
- Correct
- Add text

before sending.

--------------------------------------------------------
6. CANCEL RECORDING
--------------------------------------------------------

While recording show:

Listening…      Cancel

Clicking Cancel:

- Stop recording
- Discard transcription
- Return to normal input state

--------------------------------------------------------
7. MICROPHONE PERMISSION
--------------------------------------------------------

If microphone permission is denied:

Show:

"Microphone access is unavailable. You can type your question instead."

Do not break the chatbot.

Text input must continue working.

--------------------------------------------------------
8. SPEECH SERVICE ARCHITECTURE
--------------------------------------------------------

Create:

speechToTextService

Use browser speech recognition such as Web Speech API where supported.

Keep the speech service separate from the UI.

Make it possible to replace it later with a production speech-to-text provider.

--------------------------------------------------------
9. AI SERVICE
--------------------------------------------------------

Create:

chatbotService

The UI must not be tightly coupled to a specific AI provider.

Support:

- Demo/mock mode
- Future production LLM API

If no real LLM API is configured:

Use deterministic realistic demo responses.

Never expose API keys in frontend code.

--------------------------------------------------------
10. QR CONTEXT
--------------------------------------------------------

If the chatbot is opened from an existing QR verification/certificate screen, pass available context into the chatbot.

Possible context:

Instrument ID
Certificate ID
Vendor
Verification Status
Certificate Expiry
Trust Score

Allow questions such as:

"Is this instrument currently verified?"

"What is this certificate status?"

========================================================
FEATURE 3 — REAL GPS + REAL MAP + NEARBY DISCOVERY
========================================================

This feature must use the user's REAL CURRENT LOCATION.

Do NOT hard-code Pune, Nashik, Mumbai or another fixed location.

When the user opens the website from a different location, the nearby discovery system should adapt to that location after permission is granted.


========================================================
1. REAL BROWSER GEOLOCATION
========================================================

Use browser/device geolocation.

Use:

navigator.geolocation

where appropriate.

Capture:

latitude
longitude
timestamp
accuracy


When the Consumer opens Nearby Discovery:

Show:

"Find verified shops and instruments near you"

Button:

"Use My Location"


When permission is granted:

Center the map on the user's current location.

Show:

"You are here"


--------------------------------------------------------
2. LOCATION PERMISSION
--------------------------------------------------------

If location is denied:

Show:

"Location access is unavailable."

Provide:

"Search by area"

"Search by city"

Do not break the portal.


--------------------------------------------------------
3. REAL INTERACTIVE MAP
--------------------------------------------------------

Use a real map provider.

Possible production integrations:

- Mapbox
- Google Maps
- OpenStreetMap-based provider

Create:

mapService

Do not hard-code map provider logic throughout the UI.

The map must support:

- Zoom
- Pan
- Current location
- Markers
- Marker popups
- Radius
- Nearby results
- Mobile interaction


DO NOT use:

- Static map screenshots
- Fake map images
- Hard-coded marker positions


--------------------------------------------------------
4. SEARCH RADIUS
--------------------------------------------------------

Allow:

1 km
2 km
5 km

Default:

2 km


Changing the radius must update the nearby results.


--------------------------------------------------------
5. REAL SPATIAL SEARCH
--------------------------------------------------------

The SHOP/BUSINESS entity must contain geographic information.

Do NOT store location only in inspection records.

Shop fields should support:

id
name
address
district
city
latitude
longitude
compliance_status
verification_status
trust_score


Instruments should be associated with the shop/business.


--------------------------------------------------------
6. DISTANCE CALCULATION
--------------------------------------------------------

Calculate real distance between:

User coordinates

and

Shop coordinates.


Use a proper geospatial calculation or spatial database query.

Display:

850 m away
1.2 km away
4.6 km away


Sort results by distance.


--------------------------------------------------------
7. NEARBY DISCOVERY
--------------------------------------------------------

Integrate into the existing Consumer Portal.

Example:

NEARBY

[1 km] [2 km] [5 km]

Search:

"grocery shops and weighing machines"


Display:

INTERACTIVE MAP

📍 You

🟢 Shree General Stores
🟢 ABC Mart
🟡 Metro Traders
🔴 XYZ Store


Below/alongside the map:

Shree General Stores
1.2 km
✓ Registered and verified


ABC Mart
1.6 km
✓ Registered and verified


Metro Traders
1.9 km
⚠ Verification pending


--------------------------------------------------------
8. COMPLIANCE STATUS
--------------------------------------------------------

Use the existing DataDrift compliance model.

GREEN:

"Registered and verified."


YELLOW:

"Verification pending or expiring soon."


RED:

"Unregistered or not currently verified."


Always show text.

Do not depend only on color.


--------------------------------------------------------
9. SHOP MAP MARKER
--------------------------------------------------------

Clicking a shop marker should show:

Business Name
Address
Distance
Verification Status
Trust Score
Customer Rating
Registered Instruments
Latest Verification Date


Actions:

View Shop
View Instruments
View Verification
Get Directions


--------------------------------------------------------
10. INSTRUMENT DISCOVERY
--------------------------------------------------------

Consumers must be able to discover DataDrift-registered instruments nearby.

Example:

"Show weighing machines within 2 km."


Results:

Electronic Weighing Scale
Instrument ID: LM-INS-2048
Shree General Stores
✓ Registered and verified
1.2 km


Show:

Instrument Type
Instrument ID
Business
Verification Status
Certificate Status
Distance


--------------------------------------------------------
11. REAL-WORLD PLACE DATA VS DATADRIFT DATA
--------------------------------------------------------

IMPORTANT:

Do not confuse a real-world shop with a verified DataDrift vendor.

Separate:

REAL MAP/PLACE DATA

from

DATADRIFT VERIFIED DATA.


If an external map/places provider identifies a shop but the shop does NOT exist in the DataDrift verified database:

Show:

"Not registered with DataDrift."


Never show:

✓ Verified

unless the business/instrument exists in the DataDrift verified dataset.


This distinction is mandatory.


--------------------------------------------------------
12. CHATBOT + MAP INTEGRATION
--------------------------------------------------------

The AI Assistant must be able to use the nearby discovery service.

Example user says:

"Show me verified weighing machines near me."


System:

AI Assistant
↓
Check location permission
↓
Get current GPS
↓
Search nearby DataDrift records
↓
Apply selected/default radius
↓
Return results
↓
Display results on map
↓
Display distance-sorted list


The chatbot should NOT simply respond with a text list if map data is available.

It should connect to the actual Nearby Discovery UI.


--------------------------------------------------------
13. LOCATION-INDEPENDENT BEHAVIOR
--------------------------------------------------------

Do not assume the user is always in a particular city.

Example:

User opens website in Pune
→ Detect current location
→ Show nearby DataDrift results.


User travels to Mumbai
→ Refresh/reopen Nearby Discovery
→ Detect current location
→ Show Mumbai-area results.


User travels to another city
→ Show results for that area.


The system must be location-independent.


--------------------------------------------------------
14. LOCATION ACCURACY
--------------------------------------------------------

Use GPS accuracy information.

Example:

Location accuracy:
±25 m


If accuracy is poor:

"Your location may be approximate."


Never falsely claim exact location.


========================================================
FEATURE 4 — CONNECT EVERYTHING TO EXISTING DATADRIFT
========================================================

Do not create three isolated features.

Connect them into one ecosystem:

CONSUMER
↓
AI ASSISTANT
↓
TEXT / VOICE
↓
CURRENT LOCATION
↓
NEARBY SHOPS / INSTRUMENTS
↓
VERIFIED DATA
↓
QR CERTIFICATE
↓
VERIFIED TRANSACTION
↓
CUSTOMER RATING
↓
ANTI-GAMING ENGINE
↓
TRUST SCORE
↓
CUSTOMER PREFERENCE
↓
INCENTIVE / VISIBILITY


========================================================
FEATURE 5 — DATA MODEL
========================================================

Extend existing data models rather than creating duplicate entities.

Shop/Business:

- id
- name
- address
- district
- city
- latitude
- longitude
- location_accuracy
- verification_status
- compliance_status
- trust_score


Instrument:

- id
- instrument_id
- shop_id
- instrument_type
- serial_number
- verification_status
- certificate_status


Transaction:

- id
- vendor_id
- instrument_id
- customer_reference
- verification_reference
- date


Review:

- id
- transaction_id
- vendor_id
- rating
- review_text
- created_at
- authenticity_status


Anti-Gaming:

- id
- vendor_id
- risk_score
- detection_reason
- status
- created_at


Trust Score:

- vendor_id
- rating_component
- compliance_component
- verification_component
- complaint_penalty
- suspicious_activity_penalty
- final_score


========================================================
FEATURE 6 — RESPONSIVE DESIGN
========================================================

Everything must work on:

Desktop
Tablet
Mobile


Desktop:

Nearby discovery can use:

LEFT = result list
RIGHT = map


Mobile:

Use:

Map
↓
Nearby result cards


Chatbot:

Desktop:
comfortable chat panel

Mobile:
full-width responsive chat interface where appropriate.


Microphone:

Must have an easy-to-tap touch target.

Do not allow keyboard/input overlap.

========================================================
FEATURE 7 — PRIVACY & SECURITY
========================================================

Consumer GPS should preferably be used for current-session discovery.

Do not permanently store consumer exact GPS coordinates unless explicitly required and appropriately consented.

Do not expose consumer location to vendors.

Never expose AI API keys in frontend code.

Use backend/environment variables for production integrations.

========================================================
FEATURE 8 — ERROR AND EMPTY STATES
========================================================

Location denied:

"Location access is unavailable. Search by area or city instead."


No nearby results:

"No registered DataDrift vendors or instruments were found within 2 km."


Map/network failure:

"Unable to load nearby locations. Please try again."


External place but no DataDrift verification:

"This location was found on the map, but no verified DataDrift record was found."


Microphone denied:

"Microphone access is unavailable. You can type your question instead."


Poor GPS accuracy:

"Your location may be approximate."


========================================================
FEATURE 9 — DEMO DATA
========================================================

Use realistic deterministic fictional Indian demo data.

Examples:

Shree General Stores
ABC Wholesale Market
Metro Traders
Reliable Weighing Solutions
Maharashtra Retail Point


Use fictional instrument IDs.

Example:

LM-INS-2048


Do not use real people's personal information.

Do not generate random values that change on every refresh.


========================================================
FEATURE 10 — NO FAKE FUNCTIONALITY
========================================================

This is extremely important.

Do NOT create:

- Fake microphone buttons
- Fake voice recording
- Fake GPS
- Static maps
- Fake nearby locations
- Fake verification status
- Fake Trust Scores that randomly change
- Fake review submission
- Fake Anti-Gaming detection

Where a real production API is unavailable:

Create a clean service abstraction and deterministic demo implementation.

Examples:

speechToTextService
locationService
mapService
nearbySearchService
chatbotService
antiGamingService
trustScoreService


These services must be designed so real APIs can be connected later without rebuilding the UI.


========================================================
FINAL USER EXPERIENCE
========================================================

The finished DataDrift Consumer experience should feel like a real modern government-grade digital platform.

Example:

User opens DataDrift.

↓


"Find verified shops and instruments near you"

↓


User taps:

"Use My Location"

↓


Browser requests location permission.

↓


Real current location is detected.

↓


Interactive real map opens.

↓


Nearby DataDrift shops and instruments appear.

↓


User selects:

Shree General Stores

↓


Sees:

✓ Registered and verified
Trust Score: 94/100
Customer Rating: 4.8 ★
Verified Instrument
Latest Certificate

↓


User opens AI Assistant.

↓


User taps 🎙.

↓


"Listening…"

↓


User says:

"Is this weighing machine verified and can I trust this shop?"

↓


Speech converts to editable text.

↓


User edits if necessary.

↓


User presses Send.

↓


AI uses the available DataDrift verification, Trust Score and certificate information.

↓


AI responds.

========================================================
FINAL QUALITY CHECK
========================================================

Before finishing:

1. Test existing navigation.
2. Test existing dashboards.
3. Test Consumer Portal.
4. Test Vendor Portal.
5. Test Officer Portal.
6. Test Admin Portal.
7. Test QR verification.
8. Test certificate functionality.
9. Test rating submission.
10. Test one-transaction-one-review.
11. Test Anti-Gaming detection.
12. Test Trust Score calculation.
13. Test microphone permission.
14. Test recording.
15. Test stop recording.
16. Test cancel recording.
17. Test speech-to-text.
18. Test transcription editing.
19. Test chatbot.
20. Test browser location permission.
21. Test real GPS.
22. Test map loading.
23. Test 1 km radius.
24. Test 2 km radius.
25. Test 5 km radius.
26. Test distance sorting.
27. Test nearby shops.
28. Test nearby instruments.
29. Test verified vs unregistered businesses.
30. Test chatbot → nearby discovery integration.
31. Test mobile responsiveness.
32. Test desktop responsiveness.
33. Test permission-denied states.
34. Test empty states.
35. Test network errors.
36. Check console errors.
37. Check broken imports.
38. Check TypeScript/JavaScript errors.
39. Ensure existing functionality remains unchanged.
40. Ensure the application builds successfully.

========================================================
MOST IMPORTANT PRINCIPLE
========================================================

This is an UPGRADE to an existing DataDrift Figma-based platform.

Do not rebuild DataDrift.

Do not redesign DataDrift.

Do not replace existing screens.

Do not remove existing functionality.

ADD the new functionality INTO the existing product.

The final product should communicate:

"DataDrift doesn't simply digitize verification; it creates a trusted, location-aware, AI-assisted reputation ecosystem."

Core story:

VERIFY
↓
DISCOVER
↓
TRUST
↓
CHOOSE
↓
ADOPT

And:

"DataDrift doesn't simply create a rating system; it creates a trusted reputation system with safeguards against rating manipulation."

Use:

"INCENTIVE-DRIVEN ADOPTION"

Do not claim vendor verification is legally compulsory.