# 🛡️ VaultStamp — Decentralized IP Protection Platform

VaultStamp is a decentralized intellectual property (IP) protection platform deployed on the Internet Computer (ICP). It timestamps and verifies design file hashes fully on-chain to prevent plagiarism and establish verifiable proof-of-creation. Creators can upload files, generate cryptographic hashes, and immutably store them with a blockchain timestamp. The platform supports Internet Identity (II) login, empowering designers and digital creators with verifiable ownership tools in a trustless, censorship-resistant environment.

---

## 🎬 Pitch Video

> **Please see our BUIDL page for the team pitch video, covering:**
> - Team introduction
> - Motivation/problem statement
> - Solution description
> - Business model
> - Future roadmap

---

## 🔥 Motivation & Problem Statement

Digital creators face increasing risks of plagiarism, content theft, and disputes over ownership. Existing solutions are fragmented, centralized, and often expensive. There is a need for a trustless, censorship-resistant platform that provides verifiable proof of creation and helps creators defend their intellectual property.

---

## 💡 Solution Description

VaultStamp enables creators to:
- Upload design files and generate cryptographic hashes (SHA-256, pHash).
- Store file hashes and metadata immutably on the ICP blockchain with a timestamp.
- Verify ownership and originality of designs at any time.
- Detect duplicates and near-duplicates globally across all users.
- Receive notifications and AI-powered plagiarism alerts (roadmap).
- Access legal guidance and escalation tools via an integrated chatbot.

---

## 🔹 Hackathon-Ready VaultStamp Flow

### 1. File Upload

- User uploads a file via the frontend.
- The frontend computes:
  - **SHA-256 hash** for exact match detection.
  - **pHash** for near-duplicate detection (Motoko backend).
  - **CLIP embedding** for semantic similarity (optional, future roadmap).

### 2. Check for Duplicates

- The backend canister compares the uploaded file’s hashes/embeddings against those already stored.
- If a match or near-duplicate is found:
  - Flags it as “Possible Plagiarism.”
  - Identifies the original uploader.

### 3. AI-Generated Legal Summary

- **(Planned)** Will generate a customized message to the original uploader:
  - Explains the similarity detected.
  - Suggests possible legal steps.
  - Optionally, provides a plain-English summary of copyright infringement law related to design files.
- **Tools:** OpenAI GPT (or open-source LLM, planned integration).
- **Prompt template:**  
  “Summarize potential copyright issues and suggest next steps based on uploaded design similarity.”

### 4. Notifications

- Sends the AI-generated message to the user (via frontend alert, dashboard, or email).
- Optionally, logs all “plagiarism alerts” in the ICP canister for future reference.

---

## ✅ Iteration & Development Progress

VaultStamp has evolved from a Solana-based vanilla JS prototype to a robust ICP dApp with a React frontend:

- **Internet Identity (II) login:** Secure, password-free authentication.
- **Global duplicate detection:** Prevents multiple uploads of the same file across users.
- **Notifications page:** Alerts for successful uploads, duplicates, and future plagiarism events.
- **Chatbot support:** On-demand guidance (Legal, Plagiarism, General Help).
- **Legal / Enforcement layer:** Under development to escalate verified infringement cases.
- **Backend-ready perceptual hashes (p-hashes):** For AI-powered similarity checks.

---

## 🧪 New Features & Functional Additions

- 🛡️ **On-Chain File Hash & Timestamp Storage:** Immutable proof-of-creation.
- 🔍 **File Verification:** Integrity checks, duplicate prevention, metadata display (name, type, hash, timestamp).
- 📄 **Uploaded File List:** Review file proofs with timestamps.
- 💡 **Future AI Monitoring:** Planned plagiarism alerts.
- 🤖 **Chatbot Support:** Category-based guidance for creators.
- 🧠 **Legal Escalation:** Connects verified infringements to legal follow-ups.

---

## 🗂️ Project Structure

```
vaultstamp-v2/
├── backend/
│   └── app.mo                  # Motoko backend canister code (with detailed comments)
├── frontend/
│   ├── public/
│   │   └── questions.json      # Chatbot questions/categories
│   ├── src/
│   │   ├── App.jsx             # Main React frontend (with detailed comments)
│   │   └── index.css           # Main frontend CSS (includes bell/chat icon styles)
│   └── index.html              # Main frontend HTML
├── dfx.json                    # DFINITY project configuration (defines canisters)
├── package.json                # (If using npm for frontend tooling)
├── README.md                   # Project documentation
└── .gitignore                  # Files to ignore in Git
```

---

## 🚀 Local Development & Deployment

### Prerequisites

- [DFINITY SDK (dfx)](https://internetcomputer.org/docs/current/developer-docs/setup/sdk-installation/) installed
- Node.js and npm (for frontend builds, if needed)
- A modern browser (Chrome, Firefox, Edge)
- Internet access

### Steps

1. **Clone the repository**
    ```bash
    git clone https://github.com/Asdiqaat/vaultstamp-v2.git
    cd vaultstamp-v2
    ```

2. **Start the ICP Local Replica**
    ```bash
    dfx start --background
    ```

3. **Generate and Build Canisters**
    ```bash
    dfx generate
    dfx build
    ```

4. **Deploy the Canisters**
    ```bash
    dfx deploy
    ```

5. **Build the Frontend (if you make changes to JS/CSS)**
    ```bash
    npm install
    npm run build
    ```

6. **Run the Frontend**
    - Open `frontend/index.html` directly in your browser  
      *or*  
    - Use a live server extension (e.g. VS Code Live Server) for hot reload

---

## 💡 Tech Stack

| Layer       | Tools / Files                        |
|-------------|-------------------------------------|
| Frontend    | React, HTML5, CSS3 (`App.jsx`, `index.css`, `index.html`) |
| Blockchain  | Internet Computer Protocol (ICP)    |
| Backend     | Motoko (`app.mo`)                   |
| Config      | `dfx.json` (ICP canister/project config) |
| Storage     | On-chain hash storage               |
| AI Module   | (Planned) Web & Social similarity checker |
| UI Extras   | Animated notification bell and chat icons, chatbot |

---

## 🧭 Business Model & Market Readiness

**Target Market:**
- Creative professionals (designers, artists, architects)
- Design studios and agencies
- Educational institutions (student projects, research outputs)
- Enterprises creating digital content
- IP law firms

**Business Model:**
- Freemium: basic stamping & verification, limited uploads
- Subscription/SaaS: unlimited uploads, AI alerts, team management, priority support
- Enterprise / White-Label: custom branding, API integration, legal escalation workflow
- Legal Services: paid IP enforcement and consultation

**Go-To-Market Strategy (GTM):**
- Hackathon & university partnerships
- Social media campaigns targeting creators
- Integrations with creative platforms (Figma, Canva, GitHub)
- Referral programs and enterprise outreach

**Market Validation:**
- Increasing demand for IP protection in digital design
- Rising risks of plagiarism and content theft
- ICP blockchain offers decentralized, cost-efficient, and censorship-resistant infrastructure

---

## 🎯 Future Roadmap

- [ ] AI image similarity backend (Python + ICP canister)
- [ ] CLIP embedding for semantic similarity
- [ ] IPFS support for permanent design storage (opt-in)
- [ ] Browser drag-and-drop upload
- [ ] Email alerts when a match is detected
- [ ] More chatbot categories and answers
- [ ] **AI-generated legal summaries and copyright explanations for flagged files**

---

## 🙌 Acknowledgments

- Built during the **Brunel Hackathon 2025** 🥈
- Inspired by creators who deserve control and recognition  
- Special thanks to the Internet Computer Protocol (ICP) community

# Team
- Kaashifa Asdiqaat
- Dia Johara Khan
- Alisha Sana

---

## 📬 Contact

For issues, feature requests, or collaboration ideas, please visit our GitHub profile:  
🔗 [https://github.com/Asdiqaat](https://github.com/Asdiqaat)
