# Product Requirements Document: SIPBAJA (Sistem Informasi Pengadaan Barang dan Jasa)

## Product Overview

**Product Vision:** SIPBAJA is a centralized web application that digitizes the entire campus procurement process for goods and services, from permohonan submission, tiered approval, purchasing, and goods receipt, through to per-termin payment, so that every party can work and monitor progress in one place.

**Target Users:**
- **Primary:** Jurusan/Unit/Bidang (pemohon), Perencanaan, Bidang 2 (WD2), PPBJ, PP, PPK, Perlengkapan, and Keuangan as actors in the procurement flow.
- **Secondary:** Admin, who manages user accounts.

**Business Objectives:**
- Centralize procurement data and documents in one system.
- Give pemohon visibility into submission progress without having to ask manually.
- Ensure the tiered approval rules and the dual payment approval are enforced consistently by the system.
- Restrict feature access according to each actor's role.

**Success Metrics:** (qualitative, no numeric targets)
- The submitter of a permohonan can track the status of the permohonan they have created.
- All procurement data is stored centrally.
- No payment is processed before it is approved by PPK and Bidang 2.
- No payment is late.

## Feature Requirements

**Priority:** 1 = top priority, 2 = second priority, 3 = last priority.

| Feature | Description | User Stories | Priority | Acceptance Criteria | Dependencies |
|---------|-------------|--------------|----------|---------------------|--------------|
| **Authentication and role-based access** | Login and redirect to the dashboard matching the role. Each user sees only the menus and features within their authority. | As a user, I want to log in and immediately see the features relevant to my role. | 1 | Credentials are validated. The user is redirected to the dashboard matching their role. No cross-role access. | Account management |
| **Account management** | Admin creates, views, edits, and deletes user accounts. | As Admin, I want to manage the accounts of all application users. | 1 (create), 2 (view, edit), 3 (delete) | Admin can create accounts for all roles. Unused accounts can be deleted without damaging history. | - |
| **Procurement permohonan submission** | The unit enters the letter number, title, originating unit, purpose summary, and budget estimate, and uploads the permohonan document. The document can be re-uploaded during revision. | As a pemohon, I want to submit and revise procurement permohonan online. | 1 (submission), 2 (re-upload) | The permohonan is stored centrally. A re-uploaded document does not delete the previous version. | Authentication |
| **Budget verification and MAK management** | Perencanaan approves or rejects the permohonan and determines the MAK type. The MAK can be changed as long as the pengadaan document has not been approved by PPK and Bidang 2. | As Perencanaan, I want to ensure the budget is available and determine the budget category of each pengadaan. | 1 (verification, determining and changing MAK), 2 (upload RKAKL) | Rejection must include a reason. A MAK change after approval by PPK and Bidang 2 is rejected by the system, and a MAK change replaces the assigned PPK. | Permohonan submission |
| **Tiered approval** | Bidang 2 gives the initial approval by uploading a memo, or rejects with a reason. | As Bidang 2, I want to approve or reject a permohonan with a recorded document and reason. | 1 | Approval includes a memo. Rejection includes a reason. The decision is recorded along with the actor and time. | Budget verification |
| **Pengadaan package management** | PPBJ splits one permohonan into several pengadaan, determines the pengadaan type, pengadaan method, and pengadaan level based on nominal (<50 million, 50–200 million, >200 million), then assigns one of the four PPK according to the budget type. Each pengadaan uses exactly one MAK from the list determined by Perencanaan. The pengadaan document can be uploaded and re-uploaded. | As PPBJ, I want to compose pengadaan packages and determine who reviews them. | 1 (split, method, level, upload, PPK assignment), 2 (re-upload, monitoring) | One permohonan can produce several pengadaan. The level is determined automatically from the nominal. The assigned PPK matches the MAK type and changes when the MAK changes. | Tiered approval |
| **Pengadaan document review** | PP reviews pengadaan worth 50–200 million. PPK signs the review at all levels by uploading proof of signature. | As PP or PPK, I want to review the pengadaan documents I am responsible for. | 1 | PP sees only level 50–200 million pengadaan. PPK sees only the pengadaan assigned to them. | Pengadaan package management |
| **Contract and per-termin payment plan** | PPBJ issues the Kontrak/SPK/Surat Pesanan, sets the per-termin payment plan from the moment the contract is issued, and determines the reminder date of each termin. | As PPBJ, I want to set the schedule and nominal of the termin when the contract is issued. | 1 | Each termin has a nominal and a due date. Reminders are linked to a specific termin. | Pengadaan document review |
| **Goods receipt** | Perlengkapan views the pengadaan documents and SPK, uploads photo documentation of the goods, and uploads the signed berita acara penerimaan. | As Perlengkapan, I want to record goods receipt along with its documentation proof. | 1 (photos, berita acara), 2 (view documents) | Photos and berita acara are stored and linked to the related pengadaan. | Contract |
| **Per-termin payment with dual approval** | PPBJ uploads the payment documents and vendor legality documents per termin. PPK and Bidang 2 must both approve with a memo, or reject with a reason. Keuangan sees only payments approved by both, then uploads proof of payment. | As Keuangan, I want to process only payments that have been fully approved. | 1 | The payment does not appear to Keuangan until PPK and Bidang 2 have both approved. The payment nominal must exactly equal the termin plan. | Contract and payment plan, Goods receipt |
| **Status tracking and notifications** | Full status change history with actor and time, progress visible per unit, in-app and email notifications when status changes, and payment reminders for PPBJ, PPK, and Keuangan. | As a pemohon, I want to see the progress of my permohonan and its pengadaan and be notified when something changes. | 1 (tracking), 2 (notifications, reminders) | Colleagues in the same unit can monitor the same progress. Reminders appear on the dates determined by PPBJ. | Entire procurement flow |
| **Search, filter, and recap** | Permohonan search, filters by month, year, status, letter number, and unit, plus a total budget recap per category for Bidang 2, PPBJ, PPK, and Keuangan. | As Bidang 2, PPBJ, PPK, or Keuangan, I want to filter documents and view the budget recap. | 2 | Filters and search return matching data. The recap sums the pengadaan nominal per budget category. | Pengadaan package management |

**Out of scope for the initial version:** mobile application, public REST API, and automatic integration with Srikandi (letter numbers are entered manually).

## Non-Functional Requirements

### Performance
- **Load Time:** Page loading and status updates complete in ≤3 seconds under normal conditions.
- **Concurrent Users:** The system can be accessed by 100 simultaneous users without crashes or errors.
- **Response Time:** Average response time ≤3 seconds in a load test with 100 virtual users.

### Security
- **Authentication:** Login with credentials. Passwords are stored as bcrypt hashes and are never displayed or logged in plain text. Sessions expire automatically after 60 minutes of inactivity.
- **Authorization:** Role-based access (RBAC). Each role can access only the menus and features within its authority, and the restrictions are enforced on the server side.
- **Data Protection:** Uploads are limited to PDF, JPG, or PNG, validated by the actual file type, with a maximum size of 10 MB per file. File names are hashed before storage so the original name cannot be guessed from the URL.

### Compatibility
- **Devices:** Desktop or laptop devices as the primary target (assumption).
- **Browsers:** Latest versions of modern browsers (assumption).
- **Screen Sizes:** Basic responsive layout (assumption).

### Accessibility
- **Compliance Level:** No specific compliance target in the initial version.
- **Specific Requirements:** None.

## Technical Specifications

### Frontend
- **Technology Stack:** React with Inertia.js and Tailwind CSS in a single monolithic application (Laravel routing on the server, React rendering on the client).
- **Design System:** Not yet decided.
- **Responsive Design:** Basic responsive layout using Tailwind utilities.

### Backend
- **Technology Stack:** PHP 8.5.11 with Laravel 13.
- **API Requirements:** No REST API because the application is an Inertia monolith (communication via the Inertia protocol, not REST). An API layer (Laravel Sanctum for authentication and Scribe for documentation) will only be added if external consumers appear later.
- **Database:** PostgreSQL 18, relational. Document, approval, and status history data are stored in shared tables that can reference various pengadaan objects.