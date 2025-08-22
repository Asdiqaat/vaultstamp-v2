/************************************************************
 * VaultStamp Frontend: React Views & UI Helpers
 *
 * This file contains all main React components for the VaultStamp user interface:
 * - Navigation bar with animated notification bell
 * - Landing page with typewriter effect and main actions
 * - About page with tabbed content
 * - File upload and listing views
 * - Plagiarism check placeholder
 * - File verification page
 * - Notifications view
 * - Floating chat icon and interactive chatbot
 *
 * Components are designed to be pure and controlled where possible.
 * Authentication, backend actor wiring, and routing are handled in the App shell.
 * Each function is documented with its purpose, inputs, and key behaviors.
 ************************************************************/

// ---------------------------
// Imports: external libraries & local modules
// ---------------------------
import { AuthClient } from '@dfinity/auth-client'; // Used for Internet Identity login/logout (referenced only for context here)
import { createActor } from 'declarations/backend'; // Exposed to clarify source of window.actor in verification/notifications
import { canisterId } from 'declarations/backend/index.js'; // Backend canister ID (context)
import React, { useState, useEffect } from 'react'; // Core React + hooks
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom'; // SPA routing primitives
import '../index.css'; // Global styles (Tailwind or custom)

// ---------------------------
// Network & Identity Provider setup
// ---------------------------

// DFX_NETWORK is provided by the bundler/dev server (e.g., Vite/webpack) via env injection.
// It distinguishes local development ("local") from mainnet ("ic"). This determines which
// identity provider the AuthClient should use for login flows. Keeping this here (even if not
// consumed in this file) documents the identity service URLs used by the surrounding app.
const network = process.env.DFX_NETWORK;
const identityProvider =
  network === 'ic'
    ? 'https://identity.ic0.app' // Internet Computer mainnet identity service (OIDC compatible)
    : 'http://rdmx6-jaaaa-aaaaa-aaadq-cai.localhost:4943'; // Local II canister URL; must match dfx.json + replica config

/************************************************************************************
 * Header
 *
 * Purpose:
 * - Renders the top navigation bar with route-aware link highlighting and an
 *   auth button that toggles Login/Logout based on `isAuthenticated`.
 *
 * Inputs/Props:
 * - isAuthenticated:boolean (renders Login/Logout)
 * - login:() => Promise<void> (callback wired by parent; triggers II login)
 * - logout:() => Promise<void> (callback wired by parent; clears session)
 *
 * External dependencies:
 * - `useLocation` from react-router supplies the active pathname for styling.
 *
 * Side effects:
 * - None (pure render component). Uses anchor tags; navigation is handled by
 *   the router since the app is an SPA (ensure server serves index.html for routes).
 *
 * Notes/Pitfalls:
 * - Uses <a> instead of <Link>; this works when dev server handles history fallback,
 *   but <Link> avoids full page reloads. Consider replacing with <NavLink>.
 * - Bell icon uses inline SVG to avoid extra assets and allow CSS control.
 ************************************************************************************/
function Header({ isAuthenticated, login, logout }) {
  const location = useLocation(); // Current route path (e.g., "/about") for active link styling

  return (
    <header className="header">
      <div className="header-container">
        <nav className="navbar">
          <div className="nav-links">
            {/* Each link compares its href to the current pathname for active styling */}
            <a href="/" className={location.pathname === "/" ? "active" : ""}>Home</a>
            <a href="/about" className={location.pathname === "/about" ? "active" : ""}>About</a>
            <a href="/upload" className={location.pathname === "/upload" ? "active" : ""}>Upload</a>
            <a href="/my-stamps" className={location.pathname === "/my-stamps" ? "active" : ""}>My Stamps</a>
            <a href="/verify-design" className={location.pathname === "/verify-design" ? "active" : ""}>Verify Design</a>
            <a href="/plagiarism-check" className={location.pathname === "/plagiarism-check" ? "active" : ""}>AI Plagiarism Check</a>

            {/* Notifications entry rendered as a bell button; kept as an <a> to preserve routing semantics */}
            <a href="/notifications" style={{ display: "inline-block" }}>
              <button className="button" style={{ marginLeft: "8px" }}>
                {/* Inline SVG ensures no network fetch; scalable and stylable via CSS */}
                <svg viewBox="0 0 448 512" className="bell">
                  <path d="M224 0c-17.7 0-32 14.3-32 32V49.9C119.5 61.4 64 124.2 64 200v33.4c0 45.4-15.5 89.5-43.8 124.9L5.3 377c-5.8 7.2-6.9 17.1-2.9 25.4S14.8 416 24 416H424c9.2 0 17.6-5.3 21.6-13.6s2.9-18.2-2.9-25.4l-14.9-18.6C399.5 322.9 384 278.8 384 233.4V200c0-75.8-55.5-138.6-128-150.1V32c0-17.7-14.3-32-32-32zm0 96h8c57.4 0 104 46.6 104 104v33.4c0 47.9 13.9 94.6 39.7 134.6H72.3C98.1 328 112 281.3 112 233.4V200c0-57.4 46.6-104 104-104h8zm64 352H224 160c0 17 6.7 33.3 18.7 45.3s28.3 18.7 45.3 18.7s33.3-6.7 45.3-18.7s18.7-28.3 18.7-45.3z"></path>
                </svg>
              </button>
            </a>
          </div>
        </nav>

        {/* Auth call-to-action: the callbacks are passed from parent App and handle the full login/logout flow */}
        {isAuthenticated ? (
          <button onClick={logout} className="sign-in-btn">Logout</button>
        ) : (
          <button onClick={login} className="sign-in-btn">Login</button>
        )}
      </div>
    </header>
  );
}

/*****************************************************************************************
 * Home
 *
 * Purpose:
 * - Landing view with brand logo, a typewriter animation for the welcome headline, and
 *   primary call-to-action links.
 *
 * Internal behavior:
 * - On mount, runs a small typewriter effect that progressively reveals text by mutating
 *   an element’s textContent. This uses `setTimeout` and a closure over `i`.
 *
 * Dependencies:
 * - Direct DOM access via `document.getElementById` (imperative). This is small enough
 *   to leave as-is; for complex effects, prefer refs to avoid querying by id.
 *
 * Side effects & cleanup:
 * - No resource allocations or subscriptions; timers are short-lived. Cleanup isn’t
 *   required here because the loop self-terminates when the string completes.
 *
 * Accessibility/UX:
 * - The animation doesn’t block rendering; CTA links are available immediately.
 * - Provide alt text for the logo image for screen readers.
 *****************************************************************************************/
function Home() {
  useEffect(() => {
    const typewriterElem = document.getElementById('welcomeTypewriter'); // Imperative handle (simple/contained)
    if (typewriterElem) {
      const text = "Welcome to VaultStamp";
      let i = 0; // Current character index
      function type() {
        if (i <= text.length) {
          typewriterElem.textContent = text.slice(0, i); // Write substring [0..i)
          i++;
          setTimeout(type, 120); // Re-schedule next character (approx. 8 chars/sec)
        }
      }
      type(); // Kick off the animation loop
    }
  }, []); // [] ensures this only runs once after initial mount

  return (
    <main className="home-main">
      {/* Centered logo; ensure ../logo.png resolves relative to bundler/public config */}
      <div className="logo-centered">
        <img src="../logo.png" alt="VaultStamp Logo" className="logo-big" />
      </div>

      {/* Animated headline target + short product value proposition */}
      <div className="welcome">
        <h1 className="typewriter" id="welcomeTypewriter"></h1>
        <p>Protect your original designs with blockchain timestamps and AI-powered plagiarism alerts.</p>
      </div>

      {/* Primary actions: routing to upload & user’s stamped files */}
      <div className="action-buttons">
        <a href="/upload" className="action-btn">Upload Files</a>
        <a href="/my-stamps" className="action-btn">View My Stamps</a>
      </div>

      {/* Context block: brief explanation of the product and ICP usage */}
      <div className="about-preview">
        <h2>What is VaultStamp?</h2>
        <p>
          VaultStamp helps creators prove ownership of their logos, images, and designs.
          Your upload is hashed, timestamped, and stored on-chain using Internet Computer Protocol (ICP).
          The integrated AI scans social media for lookalike content — and if it detects a 90%+ match, you'll be notified directly.
        </p>
      </div>
    </main>
  );
}

/*****************************************************************************************
 * About
 *
 * Purpose:
 * - Marketing/informational page with three tabs ("vision", "expertise", "innovation").
 *   Renders one content panel at a time based on local state.
 *
 * State management:
 * - `tab` (string) holds the active tab key. No external dependencies or persistence.
 *
 * Performance:
 * - Tab content is small static markup; toggling classes is O(1) and instant.
 *
 * Accessibility/UX:
 * - Buttons act as tab headers; `aria-selected`/role could be added for AT support.
 * - CSS toggling via "active" class controls visibility and styling.
 *
 * Extensibility:
 * - To add a new tab, append a button + a corresponding content panel using the same key.
 *****************************************************************************************/
function About() {
  const [tab, setTab] = useState("vision"); // Default to "vision" on first render

  return (
    <div className="view active">
      {/* Hero/Tagline section */}
      <section className="tagline-section">
        <div className="huge-tagline">
          <h1>Lock your legacy</h1>
          <h1>Verify With Vault Stamp</h1>
          <p className="tagline-subtext">VaultStamp isn’t just about verification — it’s about protecting your creativity.</p>
        </div>
      </section>

      {/* Tab headers: update `tab` state to switch content */}
      <div className="tabs-container">
        <button className={`tab-button${tab === "vision" ? " active" : ""}`} onClick={() => setTab("vision")}>Vision</button>
        <button className={`tab-button${tab === "expertise" ? " active" : ""}`} onClick={() => setTab("expertise")}>Expertise</button>
        <button className={`tab-button${tab === "innovation" ? " active" : ""}`} onClick={() => setTab("innovation")}>Innovation</button>
      </div>

      {/* Tab content panels: only the active one gets the "active" class */}
      <div className="tab-content-container">
        <div className={`tab-content${tab === "vision" ? " active" : ""}`}>
          <p>
            VaultStamp empowers creators to protect their original designs and ideas. We believe everyone should be able to prove ownership of their digital assets — permanently and transparently. With VaultStamp, your logo or artwork gets a cryptographic timestamp on the blockchain, making idea theft a thing of the past.
          </p>
        </div>

        <div className={`tab-content${tab === "expertise" ? " active" : ""}`}>
          <p>
            VaultStamp uses Internet Computer Protocol (ICP) to store secure file fingerprints — not the files themselves. This keeps your data private while proving it’s yours.
          </p>
        </div>

        <div className={`tab-content${tab === "innovation" ? " active" : ""}`}>
          <p>
            Our AI-powered system scans the web and social media platforms to detect if your design appears elsewhere. If it finds a match with 90% or higher similarity, it notifies you directly — giving you real-time awareness of potential plagiarism.
          </p>
        </div>
      </div>
    </div>
  );
}

/*****************************************************************************************
 * Uploads
 *
 * Purpose:
 * - Controlled file input widget that delegates the actual upload logic to the parent
 *   via `handleFileUpload`. Displays success/error status messages from props.
 *
 * Inputs/Props:
 * - handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void|Promise<void>
 * - errorMessage?: string (rendered when present)
 * - uploadSuccessMessage?: string (rendered when present)
 *
 * Behavior:
 * - Keeps UI stateless; all side effects (hashing, actor calls, list refresh) are in parent.
 *
 * UX:
 * - Uses a plain <input type="file">; enhance with accept multiple/drag-drop if needed.
 *****************************************************************************************/
function Uploads({ handleFileUpload, errorMessage, uploadSuccessMessage }) {
  return (
    <div className="view active">
      <h2 className="text-xl font-bold mb-4">Upload Document</h2>
      <p>Upload your document to VaultStamp for secure timestamping on the blockchain.</p>

      {/* File picker; the parent handles the onChange (reading file, hashing, actor upload) */}
      <div className="mb-4">
        <input
          type="file"
          onChange={handleFileUpload} // Delegate all logic upward for single source of truth
        />
      </div>

      {/* Status messages are mutually exclusive in normal flow; both are optional */}
      {errorMessage && (
        <div className="status-msg" id="uploadStatus">{errorMessage}</div>
      )}
      {uploadSuccessMessage && (
        <div className="status-msg" id="uploadStatus">{uploadSuccessMessage}</div>
      )}
    </div>
  );
}

/*****************************************************************************************
 * UploadedFiles
 *
 * Purpose:
 * - Renders a simple list of the user's previously uploaded artifacts ("stamps")
 *   with file name, hash, and timestamp. Provides a one-click "Copy Hash" action.
 *
 * Inputs/Props:
 * - files: Array<{ name:string; hash:string; timestamp?: bigint|number|string }>
 *
 * Behavior:
 * - Pure view; no internal state. Timestamp is assumed to be in nanoseconds and is
 *   converted to a human-readable local string by dividing by 1,000,000.
 *
 * Security/Permissions:
 * - `navigator.clipboard` requires a secure context (https or localhost). If used in
 *   insecure contexts, the copy action may throw; here we assume modern environments.
 *****************************************************************************************/
function UploadedFiles({ files }) {
  return (
    <div className="view active">
      <h2 className="text-xl font-bold mb-4">My Stamps</h2>
      <p>View your previously uploaded documents and their verification status.</p>

      <div className="space-y-2">
        {/* Empty state: guide the user to upload */}
        {files.length === 0 ? (
          <>
            <p className="py-8 text-center text-gray-500">No files have been uploaded yet.</p>
            <p className="text-center text-gray-500">Start uploading files to see them listed here.</p>
          </>
        ) : (
          // Render each file with name + hash + humanized timestamp
          files.map((file) => (
            <div key={file.name} className="tab-content active">
              <div className="flex items-center justify-between">
                <span>{file.name}</span>
                {/* Copy hash to clipboard (UX: immediate feedback could be added with a toast) */}
                <button
                  onClick={() => navigator.clipboard.writeText(file.hash)}
                  style={{ marginLeft: "10px" }}
                >
                  Copy Hash
                </button>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                <div>Hash: <span className="font-mono">{file.hash}</span></div>
                <div>
                  {/* Convert nanoseconds → milliseconds (ns / 1,000,000) → Date → localized string */}
                  Timestamp: {file.timestamp
                    ? new Date(Number(file.timestamp) / 1_000_000).toLocaleString()
                    : "N/A"}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/*****************************************************************************************
 * PlagiarismCheck
 *
 * Purpose:
 * - Placeholder view advertising upcoming AI plagiarism scanning and legal assistance.
 *
 * Behavior:
 * - Static content only; no state, no side effects. Keeps structure ready for future
 *   integration (e.g., a form to submit URLs, an analysis queue, progress updates).
 *
 * Extensibility:
 * - Replace the text sections with a wizard that accepts an image/document, then calls
 *   a backend AI service and subscribes to results (websocket/polling).
 *
 * Performance/Security:
 * - None currently; when adding AI uploads later, consider client-side hashing,
 *   MIME validation, and PII redaction before sending to any third-party service.
 *****************************************************************************************/
function PlagiarismCheck() {
  return (
    <div className="view active">
      {/* Coming-soon: AI pipeline marketing copy */}
      <div className="plagiarism-container">
        <h1 className="plagiarism-title">AI-Powered Plagiarism Detection</h1>
        <p className="plagiarism-description">
          Our advanced AI technology is designed to help you identify potential plagiarism in your designs and documents. Stay tuned as we bring this cutting-edge feature to life, ensuring your intellectual property remains protected.
        </p>
      </div>

      <br /><br />

      {/* Coming-soon: legal assistance portal copy */}
      <div className="contact-lawyer-container">
        <h2 className="contact-lawyer-title">Legal Assistance at Your Fingertips</h2>
        <p className="contact-lawyer-description">
          Need professional legal advice? Our platform will soon connect you with experienced intellectual property lawyers to safeguard your rights and resolve disputes effectively.
        </p>
      </div>
    </div>
  );
}

/*****************************************************************************************
 * VerifyFiles
 *
 * Purpose:
 * - Client-side verification flow that computes a SHA-256 hash of a selected file and
 *   queries the backend canister (via `window.actor.verifyFileByHash`) to check for a
 *   matching record. Displays details if a match is found.
 *
 * State:
 * - result: unknown (expects array of file records from backend; rendered defensively)
 * - error: string for user-facing errors (no file, network failure, not found, etc.)
 * - loading: toggles "Verifying..." feedback while async operations are in flight
 * - checked: indicates a verification attempt completed (success or fail) to control UI
 *
 * Implementation details:
 * - Uses Web Crypto SubtleCrypto to hash the file ArrayBuffer in the browser (no upload).
 * - Hex encoding: converts Uint8Array digest → hex string to match backend expectations.
 * - Time conversion assumes nanoseconds from the canister and divides by 1,000,000.
 *
 * Pitfalls:
 * - `window.actor` must be initialized by the parent (App) before use; otherwise calls
 *   will fail. Errors are caught and surfaced to the user.
 *****************************************************************************************/
function VerifyFiles() {
  const [result, setResult] = useState(null);   // Backend response (array of matching records or null)
  const [error, setError] = useState("");       // Human-readable error message for UI
  const [loading, setLoading] = useState(false); // Spinner/feedback control
  const [checked, setChecked] = useState(false); // Marks that we attempted verification

  // onChange handler for the file input
  async function handleVerify(event) {
    setError("");
    setResult(null);
    setLoading(true);
    setChecked(false);

    const file = event.target.files[0]; // Only single-file handling here
    if (!file) {
      setError("Please select a file to verify.");
      setLoading(false);
      setChecked(true);
      return;
    }

    // 1) Read file bytes into memory as an ArrayBuffer (no network I/O)
    const arrayBuffer = await file.arrayBuffer();

    // 2) Compute SHA-256 hash using Web Crypto; returns an ArrayBuffer of 32 bytes
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);

    // 3) Convert ArrayBuffer → Uint8Array for iteration
    const hashArray = Array.from(new Uint8Array(hashBuffer));

    // 4) Convert bytes → hex string (two hex chars per byte, zero-padded)
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Debug logs useful during development; remove or gate behind env in prod
    console.log("Frontend hash:", hashHex);
    console.log("Verifying hash:", hashHex);

    try {
      // 5) Ask backend to verify this hash; expects either falsy or an array of matches
      const res = await window.actor.verifyFileByHash(hashHex);

      setChecked(true);

      if (!res) {
        // No match found at the canister
        setResult(null);
        setError("No matching file found.");
      } else {
        // Found one or more matching records; store for rendering
        setResult(res);
        console.log("Verification result:", res);
        setError("");
      }
    } catch (err) {
      // Network/actor errors or backend traps result in a generic failure message
      setError("Verification failed.");
      setResult(null);
      setChecked(true);
    }

    setLoading(false);
  }

  return (
    <div style={{ marginLeft: "40px" }}>
      <h2>Verify Design</h2>

      {/* File picker (local only) triggers handleVerify which performs hashing + canister query */}
      <input type="file" onChange={handleVerify} />

      {/* Async feedback */}
      {loading && <p>Verifying...</p>}

      {/* Results block renders only after an attempt completes and we are not loading */}
      {checked && !loading && (
        // Defensive checks: ensure `result` is an array with at least one object containing `name`
        Array.isArray(result) && result.length > 0 && result[0].name ? (
          <div>
            <h3>File Verified!</h3>
            {/* Map over all results; the canister may return multiple owners/entries per hash */}
            {result.map((file, idx) => (
              <div key={idx}>
                <p>Name: {file.name}</p>
                <p>Type: {file.fileType}</p>
                <p>
                  {/* Convert canister timestamp (ns) to human string */}
                  Timestamp: {file.timestamp
                    ? new Date(Number(file.timestamp) / 1_000_000).toLocaleString()
                    : "N/A"}
                </p>
                {/* owner principal may be a Principal-like object; align toString guard accordingly */}
                <p>Owner: {file.owner.toString ? file.owner.toString() : String(file.owner)}</p>
              </div>
            ))}
          </div>
        ) : (
          <div>
            <h3>No matching file found.</h3>
          </div>
        )
      )}

      {/* Error banner (includes "not found" and network/actor errors) */}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

/*****************************************************************************************
 * Notifications
 *
 * Purpose:
 * - Displays server-sourced alerts/notifications. On mount (or when `actor` changes),
 *   requests the backend to push a dummy notification, then fetches the alert list.
 *
 * Inputs/Props:
 * - actor: backend actor instance with methods `sendDummyNotification` and `getAlerts`.
 *
 * Behavior:
 * - `useEffect` triggers when `actor` becomes available. Shows a loading state, then
 *   renders either "No notifications" or a bulleted list of alert strings.
 *
 * Error handling:
 * - Catches any actor call failures and surfaces a single fallback message.
 *
 * Notes:
 * - This demo triggers a dummy server mutation on every mount/actor change; for real
 *   systems, replace with a push channel (stream/websocket) or polling strategy.
 *****************************************************************************************/
function Notifications({ actor }) {
  const [alerts, setAlerts] = useState([]);   // List of alert strings retrieved from backend
  const [loading, setLoading] = useState(true); // Loading indicator for UX feedback

  useEffect(() => {
    async function fetchAlerts() {
      setLoading(true);
      try {
        // Demo: force the server to generate an example notification before fetching
        await actor.sendDummyNotification();
        // Retrieve current alert list from the backend canister
        const result = await actor.getAlerts();
        setAlerts(result);
      } catch (e) {
        // On any failure (network, auth, canister), show a single fallback line
        setAlerts(["Failed to fetch notifications."]);
      }
      setLoading(false);
    }
    // Only run when an actor instance is available and when it changes (e.g., login/logout)
    if (actor) fetchAlerts();
  }, [actor]);

  return (
    <div className="view active">
      <h2 className="text-xl font-bold mb-4">Notifications</h2>
      {loading ? (
        // Loading state while calls are in flight
        <p>Loading notifications...</p>
      ) : alerts.length === 0 ? (
        // Empty state when the server returns no alerts
        <p>No notifications yet.</p>
      ) : (
        // Render all alerts as a simple list (could replace with timeline UI)
        <ul>
          {alerts.map((alert, idx) => (
            <li key={idx} className="status-msg">{alert}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
// ======================================================================
// App Component
// ======================================================================
/*
The App component is the root of the VaultStamp frontend.
It manages authentication, file upload, file retrieval, and routing
between different sections of the application.


Detailed responsibilities:
1. Initializes and updates the authentication actor (via Internet Identity).
2. Handles user login/logout flow.
3. Manages file upload, hashing, and storage interaction with the backend.
4. Loads files belonging to the user after successful authentication.
5. Defines the main navigation structure (routes) using React Router.
6. Displays global UI components such as Header, Notifications, and Chatbot.
7. Provides state for error handling and upload success feedback.
*/
function App() {
  // ==============================
  // State variables for global app logic
  // ==============================
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Tracks whether user is logged in
  const [authClient, setAuthClient] = useState(); // Stores the authentication client instance
  const [actor, setActor] = useState(); // Stores the actor object used to call backend canister
  const [files, setFiles] = useState([]); // List of uploaded files retrieved from backend
  const [errorMessage, setErrorMessage] = useState(); // Holds error messages to display to users
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState(""); // Confirmation after upload
  const [showChat, setShowChat] = useState(false); // Toggles chatbot visibility

  // useEffect hook runs once on mount → initializes the actor
  useEffect(() => {
    updateActor();
    setErrorMessage();
  }, []);

  // Whenever authentication changes, fetch files if logged in
  useEffect(() => {
    if (isAuthenticated) {
      loadFiles();
    }
  }, [isAuthenticated]);

  // -------------------------------
  // updateActor
  // -------------------------------
  /*
  Creates or refreshes the authentication actor.
  1. Initializes a new AuthClient instance.
  2. Retrieves the user identity from AuthClient.
  3. Creates an actor object for interacting with backend canister.
  4. Checks if the user is authenticated.
  5. Updates local React state with actor, authClient, and authentication status.
  6. Exposes the actor globally (window.actor) for debugging in browser console.
  */
  async function updateActor() {
    const authClient = await AuthClient.create();
    const identity = authClient.getIdentity();
    const actor = createActor(canisterId, {
      agentOptions: { identity }
    });
    const isAuthenticated = await authClient.isAuthenticated();

    setActor(actor);
    setAuthClient(authClient);
    setIsAuthenticated(isAuthenticated);

    window.actor = actor;
  }

  // -------------------------------
  // login
  // -------------------------------
  /*
  Triggers Internet Identity login flow.
  1. Uses the stored authClient instance.
  2. Redirects user to the appropriate identityProvider (mainnet/local).
  3. On successful login, calls updateActor to refresh the session.
  */
  async function login() {
    await authClient.login({
      identityProvider,
      onSuccess: updateActor
    });
  }

  // -------------------------------
  // logout
  // -------------------------------
  /*
  Handles logging out.
  1. Calls logout() on the authClient instance.
  2. Refreshes the actor state by calling updateActor.
  This ensures UI reflects that the user is no longer authenticated.
  */
  async function logout() {
    await authClient.logout();
    updateActor();
  }

  // -------------------------------
  // loadFiles
  // -------------------------------
  /*
  Fetches all files associated with the authenticated user.
  1. Calls getFiles() from the backend canister.
  2. Updates the `files` state with the returned list.
  3. Handles errors gracefully and shows error messages.
  */
  async function loadFiles() {
    try {
      const fileList = await actor.getFiles();
      setFiles(fileList);
    } catch (error) {
      console.error('Failed to load files:', error);
      setErrorMessage('Failed to load files. Please try again.');
    }
  }

  // -------------------------------
  // handleFileUpload
  // -------------------------------
  /*
  Handles the full file upload process.
  1. Ensures user selected a file.
  2. Checks with backend if the file already exists.
  3. Reads file content into an ArrayBuffer.
  4. Generates a SHA-256 hash of the content for uniqueness verification.
  5. Sends file (name, content, type) to backend via actor.uploadFile.
  6. Updates UI with success or error messages depending on result.
  7. Reloads file list after successful upload.
  */
  async function handleFileUpload(event) {
    const file = event.target.files[0];
    setErrorMessage("");
    setUploadSuccessMessage("");

    if (!file) {
      setErrorMessage("Please select a file to upload.");
      return;
    }

    // Prevent duplicate uploads
    if (await actor.checkFileExists(file.name)) {
      setErrorMessage(`File "${file.name}" already exists.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target.result;
      const hashBuffer = await crypto.subtle.digest('SHA-256', content);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      console.log("Upload hash:", hashHex);

      try {
        const result = await actor.uploadFile(file.name, new Uint8Array(content), file.type);
        if (result === "File uploaded successfully!") {
          setUploadSuccessMessage(`File "${file.name}" uploaded successfully!`);
          setErrorMessage("");
          loadFiles();
        } else {
          setErrorMessage(result);
          setUploadSuccessMessage("");
        }
      } catch (error) {
        console.error("Upload failed:", error);
        setErrorMessage(`Failed to upload ${file.name}.`);
        setUploadSuccessMessage("");
      }
    };

    reader.readAsArrayBuffer(file);
  }

  // -------------------------------
  // JSX Return: UI structure
  // -------------------------------
  return (
    <Router>
      <Header isAuthenticated={isAuthenticated} login={login} logout={logout} />
      <div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route
            path="/upload"
            element={
              <Uploads
                handleFileUpload={handleFileUpload}
                errorMessage={errorMessage}
                uploadSuccessMessage={uploadSuccessMessage}
              />
            }
          />
          <Route
            path="/my-stamps"
            element={
              <UploadedFiles
                files={files}
              />
            }
          />
          <Route
            path="/plagiarism-check"
            element={<PlagiarismCheck />}
          />
          <Route
            path="/verify-design"
            element={<VerifyFiles />}
          />
          <Route
            path="/notifications"
            element={<Notifications actor={actor} />}
          />
        </Routes>
      </div>
      <ChatIcon onClick={() => setShowChat(true)} />
      {showChat && <Chatbot onClose={() => setShowChat(false)} />}
    </Router>
  );
}


// ======================================================================
// Chatbot Component
// ======================================================================
/*
The Chatbot component renders a fixed-size support assistant.
It loads predefined categories and questions from a JSON file
and guides the user in a structured Q&A format.


Detailed responsibilities:
1. Fetches categories + questions from `/questions.json`.
2. Displays an initial greeting and asks the user to pick a category.
3. Handles state transitions between category → question → answer.
4. Keeps chat history so user can follow the conversation visually.
5. Provides a back button to restart from the category selection.
6. Uses message bubbles for a modern chat-like look.
7. Can be closed via a close button (onClose callback).
*/  
function Chatbot({ onClose }) {
  // ==============================
  // State variables for chatbot
  // ==============================
  const [categories, setCategories] = useState([]);
  const [history, setHistory] = useState([
    { type: "system", text: "👋 Which category do you want to know about?" }
  ]);
  const [step, setStep] = useState("category");
  const [selectedCategoryIdx, setSelectedCategoryIdx] = useState(null);

  useEffect(() => {
    fetch('/questions.json')
      .then(res => res.json())
      .then(data => {
        const validCategories = (data.categories || []).filter(
          cat => cat && cat.name && Array.isArray(cat.questions) && cat.questions.length > 0
        );
        setCategories(validCategories);
      });
  }, []);

  // -------------------------------
  // handleCategory
  // -------------------------------
  /*
  Handles when user selects a category.
  1. Records the category in chat history.
  2. Prompts the user to choose a question within that category.
  3. Advances step to "question" state.
  */
  function handleCategory(idx) {
    setSelectedCategoryIdx(idx);
    setHistory(h => [
      ...h,
      { type: "user", text: categories[idx].name },
      { type: "system", text: "Choose a question you have:" }
    ]);
    setStep("question");
  }

  // -------------------------------
  // handleQuestion
  // -------------------------------
  /*
  Handles when user selects a question.
  1. Retrieves question/answer from selected category.
  2. Adds both user question and system answer to chat history.
  3. Advances step to "answer" state.
  */
  function handleQuestion(idx) {
    const q = categories[selectedCategoryIdx].questions[idx];
    setHistory(h => [
      ...h,
      { type: "user", text: q.q },
      { type: "system", text: q.a }
    ]);
    setStep("answer");
  }

  // -------------------------------
  // handleBack
  // -------------------------------
  /*
  Resets chatbot back to category selection step.
  1. Clears chat history and displays initial greeting again.
  2. Resets selectedCategoryIdx.
  3. Sets step back to "category".
  */
  function handleBack() {
    setHistory([
      { type: "system", text: "👋 Which category do you want to know about?" }
    ]);
    setStep("category");
    setSelectedCategoryIdx(null);
  }

  // -------------------------------
  // chunk (helper)
  // -------------------------------
  /*
  Utility function to split an array into chunks of 2.
  This helps arrange categories/questions into a 2-column grid layout.
  */
  function chunk(arr) {
    const out = [];
    for (let i = 0; i < arr.length; i += 2) out.push(arr.slice(i, i + 2));
    return out;
  }

  // -------------------------------
  // JSX Return: Chatbot UI
  // -------------------------------
  return (
    <div
      style={{
        position: "fixed",
        bottom: "64px",
        right: "64px",
        width: "320px",
        height: "420px",
        background: "#fff",
        borderRadius: "16px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.18)",
        zIndex: 1001,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden"
      }}
    >
      <div style={{
        position: "relative",
        padding: "12px 16px",
        borderBottom: "1px solid #eee",
        fontWeight: "bold",
        color: "#a259f7",
        background: "#f8f6fc",
        fontSize: "15px"
      }}>
        VaultStamp Chatbot
        <button
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            background: "#a259f7",
            color: "#fff",
            border: "none",
            borderRadius: "50%",
            padding: "2px 8px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "16px",
            width: "28px",
            height: "28px",
            lineHeight: "18px"
          }}
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
      </div>
      <div style={{
        flex: 1,
        padding: "12px",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        background: "#f8f6fc",
        overflowY: "auto"
      }}>
        {history.map((msg, idx) => (
          <div
            key={idx}
            style={{
              alignSelf: msg.type === "system" ? "flex-start" : "flex-end",
              background: msg.type === "system" ? "#fff" : "#a259f7",
              color: msg.type === "system" ? "#222" : "#fff",
              borderRadius: "12px",
              padding: "8px 14px",
              marginBottom: "2px",
              maxWidth: "80%",
              fontSize: "14px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.07)"
            }}
          >
            {msg.text}
          </div>
        ))}
        {step === "category" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "4px" }}>
            {chunk(categories).map((row, rIdx) => (
              <div key={rIdx} style={{ display: "flex", gap: "8px" }}>
                {row.map((cat, idx) => (
                  <div
                    key={cat.name || idx}
                    style={{
                      flex: 1,
                      background: "#a259f7",
                      borderRadius: "12px",
                      padding: "8px 10px",
                      color: "#fff",
                      fontWeight: "bold",
                      cursor: "pointer",
                      textAlign: "center",
                      fontSize: "13px",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.07)"
                    }}
                    onClick={() => handleCategory(rIdx * 2 + idx)}
                  >
                    {cat.name}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
        {step === "question" && selectedCategoryIdx !== null && (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "4px" }}>
            {chunk(categories[selectedCategoryIdx].questions).map((row, rIdx) => (
              <div key={rIdx} style={{ display: "flex", gap: "8px" }}>
                {row.map((q, idx) => (
                  <div
                    key={q.q || idx}
                    style={{
                      flex: 1,
                      background: "#a259f7",
                      borderRadius: "12px",
                      padding: "8px 10px",
                      color: "#fff",
                      fontWeight: "bold",
                      cursor: "pointer",
                      textAlign: "center",
                      fontSize: "13px",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.07)"
                    }}
                    onClick={() => handleQuestion(rIdx * 2 + idx)}
                  >
                    {q.q}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
        {step === "answer" && (
          <button
            style={{
              alignSelf: "flex-end",
              background: "#a259f7",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              padding: "4px 12px",
              cursor: "pointer",
              fontWeight: "bold",
              marginTop: "4px",
              fontSize: "14px"
            }}
            onClick={handleBack}
          >
            Back
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * ChatIcon Component
 * ------------------
 * This component renders a floating chat button fixed at the bottom-right
 * corner of the screen. When clicked, it triggers the `onClick` handler
 * passed down as a prop, which typically opens the chatbot interface.
 * 
 * Key Features:
 * 1. Styled as a fixed-position button with a high z-index to float above UI.
 * 2. Includes an accessible `aria-label` for screen readers.
 * 3. Contains an inline SVG icon that visually represents chat bubbles.
 * 4. Shows a tooltip labeled "Chat" for clarity when hovered.
 * 5. Keeps UI lightweight by avoiding unnecessary re-renders.
 */
function ChatIcon({ onClick }) {
  return (
    <button
      className="chatBtn"
      style={{
        position: "fixed",
        bottom: "64px",
        right: "64px",
        zIndex: 1000,
      }}
      onClick={onClick}
      aria-label="Open Chat"
    >
      <svg height="1.6em" fill="white" xmlSpace="preserve" viewBox="0 0 1000 1000">
        <path d="M881.1,720.5H434.7L173.3,941V720.5h-54.4C58.8,720.5,10,671.1,10,610.2v-441C10,108.4,58.8,59,118.9,59h762.2C941.2,59,990,108.4,990,169.3v441C990,671.1,941.2,720.5,881.1,720.5L881.1,720.5z M935.6,169.3c0-30.4-24.4-55.2-54.5-55.2H118.9c-30.1,0-54.5,24.7-54.5,55.2v441c0,30.4,24.4,55.1,54.5,55.1h54.4h54.4v110.3l163.3-110.2H500h381.1c30.1,0,54.5-24.7,54.5-55.1V169.3L935.6,169.3z M717.8,444.8c-30.1,0-54.4-24.7-54.4-55.1c0-30.4,24.3-55.2,54.4-55.2c30.1,0,54.5,24.7,54.5,55.2C772.2,420.2,747.8,444.8,717.8,444.8L717.8,444.8z M500,444.8c-30.1,0-54.4-24.7-54.4-55.1c0-30.4,24.3-55.2,54.4-55.2c30.1,0,54.4,24.7,54.4,55.2C554.4,420.2,530.1,444.8,500,444.8L500,444.8z M282.2,444.8c-30.1,0-54.5-24.7-54.5-55.1c0-30.4,24.4-55.2,54.5-55.2c30.1,0,54.4,24.7,54.4,55.2C336.7,420.2,312.3,444.8,282.2,444.8L282.2,444.8z"></path>
      </svg>
      <span className="tooltip">Chat</span>
    </button>
  );
}

export default App;