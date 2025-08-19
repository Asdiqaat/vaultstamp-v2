import { AuthClient } from '@dfinity/auth-client';
import { createActor } from 'declarations/backend';
import { canisterId } from 'declarations/backend/index.js';
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import '../index.css';

const network = process.env.DFX_NETWORK;
const identityProvider =
  network === 'ic'
    ? 'https://identity.ic0.app'
    : 'http://rdmx6-jaaaa-aaaaa-aaadq-cai.localhost:4943';

function Header({ isAuthenticated, login, logout }) {
  const location = useLocation();

  return (
    <header className="header">
      <div className="header-container">
        <nav className="navbar">
          <div className="nav-links">
            <a href="/" className={location.pathname === "/" ? "active" : ""}>Home</a>
            <a href="/about" className={location.pathname === "/about" ? "active" : ""}>About</a>
            <a href="/upload" className={location.pathname === "/upload" ? "active" : ""}>Upload</a>
            <a href="/my-stamps" className={location.pathname === "/my-stamps" ? "active" : ""}>My Stamps</a>
            <a href="/verify-design" className={location.pathname === "/verify-design" ? "active" : ""}>Verify Design</a>
            <a href="/plagiarism-check" className={location.pathname === "/plagiarism-check" ? "active" : ""}>AI Plagiarism Check</a>
            {/* Replace Notifications link with bell icon button */}
            <a href="/notifications" style={{ display: "inline-block" }}>
              <button className="button" style={{ marginLeft: "8px" }}>
                <svg viewBox="0 0 448 512" className="bell">
                  <path d="M224 0c-17.7 0-32 14.3-32 32V49.9C119.5 61.4 64 124.2 64 200v33.4c0 45.4-15.5 89.5-43.8 124.9L5.3 377c-5.8 7.2-6.9 17.1-2.9 25.4S14.8 416 24 416H424c9.2 0 17.6-5.3 21.6-13.6s2.9-18.2-2.9-25.4l-14.9-18.6C399.5 322.9 384 278.8 384 233.4V200c0-75.8-55.5-138.6-128-150.1V32c0-17.7-14.3-32-32-32zm0 96h8c57.4 0 104 46.6 104 104v33.4c0 47.9 13.9 94.6 39.7 134.6H72.3C98.1 328 112 281.3 112 233.4V200c0-57.4 46.6-104 104-104h8zm64 352H224 160c0 17 6.7 33.3 18.7 45.3s28.3 18.7 45.3 18.7s33.3-6.7 45.3-18.7s18.7-28.3 18.7-45.3z"></path>
                </svg>
              </button>
            </a>
          </div>
        </nav>
        {isAuthenticated ? (
          <button onClick={logout} className="sign-in-btn">Logout</button>
        ) : (
          <button onClick={login} className="sign-in-btn">Login</button>
        )}
      </div>
    </header>
  );
}

function Home() {
  useEffect(() => {
    const typewriterElem = document.getElementById('welcomeTypewriter');
    if (typewriterElem) {
      const text = "Welcome to VaultStamp";
      let i = 0;
      function type() {
        if (i <= text.length) {
          typewriterElem.textContent = text.slice(0, i);
          i++;
          setTimeout(type, 120);
        }
      }
      type();
    }
  }, []);

  return (
    <main className="home-main">
      <div className="logo-centered">
        <img src="../logo.png" alt="VaultStamp Logo" className="logo-big" />
      </div>
      <div className="welcome">
        <h1 className="typewriter" id="welcomeTypewriter"></h1>
        <p>Protect your original designs with blockchain timestamps and AI-powered plagiarism alerts.</p>
      </div>

      <div className="action-buttons">
        <a href="/upload" className="action-btn">Upload Files</a>
        <a href="/my-stamps" className="action-btn">View My Stamps</a>
      </div>
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

function About() {
  const [tab, setTab] = useState("vision");

  return (
    <div className="view active">
      <section className="tagline-section">
        <div className="huge-tagline">
          <h1>Lock your legacy</h1>
          <h1>Verify With Vault Stamp</h1>
          <p className="tagline-subtext">VaultStamp isn’t just about verification — it’s about protecting your creativity.</p>
        </div>
      </section>
      <div className="tabs-container">
        <button className={`tab-button${tab === "vision" ? " active" : ""}`} onClick={() => setTab("vision")}>Vision</button>
        <button className={`tab-button${tab === "expertise" ? " active" : ""}`} onClick={() => setTab("expertise")}>Expertise</button>
        <button className={`tab-button${tab === "innovation" ? " active" : ""}`} onClick={() => setTab("innovation")}>Innovation</button>
      </div>
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

function Uploads({ handleFileUpload, errorMessage, uploadSuccessMessage }) {
  return (
    <div className="view active">
      <h2 className="text-xl font-bold mb-4">Upload Document</h2>
      <p>Upload your document to VaultStamp for secure timestamping on the blockchain.</p>
      <div className="mb-4">
        <input
          type="file"
          onChange={handleFileUpload}
        />
      </div>
      {errorMessage && (
        <div className="status-msg" id="uploadStatus">{errorMessage}</div>
      )}
      {uploadSuccessMessage && (
        <div className="status-msg" id="uploadStatus">{uploadSuccessMessage}</div>
      )}
    </div>
  );
}

function UploadedFiles({ files }) {
  return (
    <div className="view active">
      <h2 className="text-xl font-bold mb-4">My Stamps</h2>
      <p>View your previously uploaded documents and their verification status.</p>
      <div className="space-y-2">
        {files.length === 0 ? (
          <>
            <p className="py-8 text-center text-gray-500">No files have been uploaded yet.</p>
            <p className="text-center text-gray-500">Start uploading files to see them listed here.</p>
          </>
        ) : (
          files.map((file) => (
            <div key={file.name} className="tab-content active">
              <div className="flex items-center justify-between">
                <span>{file.name}</span>
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

function PlagiarismCheck() {
  return (
    <div className="view active">
      <div className="plagiarism-container">
        <h1 className="plagiarism-title">AI-Powered Plagiarism Detection</h1>
        <p className="plagiarism-description">
          Our advanced AI technology is designed to help you identify potential plagiarism in your designs and documents. Stay tuned as we bring this cutting-edge feature to life, ensuring your intellectual property remains protected.
        </p>
      </div>
      <br /><br />
      <div className="contact-lawyer-container">
        <h2 className="contact-lawyer-title">Legal Assistance at Your Fingertips</h2>
        <p className="contact-lawyer-description">
          Need professional legal advice? Our platform will soon connect you with experienced intellectual property lawyers to safeguard your rights and resolve disputes effectively.
        </p>
      </div>
    </div>
  );
}

function VerifyFiles() {
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);

  async function handleVerify(event) {
    setError("");
    setResult(null);
    setLoading(true);
    setChecked(false);

    const file = event.target.files[0];
    if (!file) {
      setError("Please select a file to verify.");
      setLoading(false);
      setChecked(true);
      return;
    }

    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    console.log("Frontend hash:", hashHex);
    console.log("Verifying hash:", hashHex);

    try {
      const res = await window.actor.verifyFileByHash(hashHex);
      setChecked(true);
      if (!res) {
        setResult(null);
        setError("No matching file found.");
      } else {
        setResult(res);
        console.log("Verification result:", res);
        setError("");
      }
    } catch (err) {
      setError("Verification failed.");
      setResult(null);
      setChecked(true);
    }
    setLoading(false);
  }

  return (
    <div style={{ marginLeft: "40px" }}>
      <h2>Verify Design</h2>
      <input type="file" onChange={handleVerify} />
      {loading && <p>Verifying...</p>}
      {checked && !loading && (
        Array.isArray(result) && result.length > 0 && result[0].name ? (
          <div>
            <h3>File Verified!</h3>
            {result.map((file, idx) => (
              <div key={idx}>
                <p>Name: {file.name}</p>
                <p>Type: {file.fileType}</p>
                <p>
                  Timestamp: {file.timestamp
                    ? new Date(Number(file.timestamp) / 1_000_000).toLocaleString()
                    : "N/A"}
                </p>
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
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

function Notifications({ actor }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAlerts() {
      setLoading(true);
      try {
        await actor.sendDummyNotification(); // Send dummy notification
        const result = await actor.getAlerts(); // Fetch alerts
        setAlerts(result);
      } catch (e) {
        setAlerts(["Failed to fetch notifications."]);
      }
      setLoading(false);
    }
    if (actor) fetchAlerts();
  }, [actor]);

  return (
    <div className="view active">
      <h2 className="text-xl font-bold mb-4">Notifications</h2>
      {loading ? (
        <p>Loading notifications...</p>
      ) : alerts.length === 0 ? (
        <p>No notifications yet.</p>
      ) : (
        <ul>
          {alerts.map((alert, idx) => (
            <li key={idx} className="status-msg">{alert}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authClient, setAuthClient] = useState();
  const [actor, setActor] = useState();
  const [files, setFiles] = useState([]);
  const [errorMessage, setErrorMessage] = useState();
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState("");
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    updateActor();
    setErrorMessage();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadFiles();
    }
  }, [isAuthenticated]);

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

  async function login() {
    await authClient.login({
      identityProvider,
      onSuccess: updateActor
    });
  }

  async function logout() {
    await authClient.logout();
    updateActor();
  }

  async function loadFiles() {
    try {
      const fileList = await actor.getFiles();
      setFiles(fileList);
    } catch (error) {
      console.error('Failed to load files:', error);
      setErrorMessage('Failed to load files. Please try again.');
    }
  }

  async function handleFileUpload(event) {
    const file = event.target.files[0];
    setErrorMessage("");
    setUploadSuccessMessage("");

    if (!file) {
      setErrorMessage("Please select a file to upload.");
      return;
    }

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


// --- Chatbot with fixed size and message bubbles ---
function Chatbot({ onClose }) {
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

  function handleCategory(idx) {
    setSelectedCategoryIdx(idx);
    setHistory(h => [
      ...h,
      { type: "user", text: categories[idx].name },
      { type: "system", text: "Choose a question you have:" }
    ]);
    setStep("question");
  }

  function handleQuestion(idx) {
    const q = categories[selectedCategoryIdx].questions[idx];
    setHistory(h => [
      ...h,
      { type: "user", text: q.q },
      { type: "system", text: q.a }
    ]);
    setStep("answer");
  }

  function handleBack() {
    setHistory([
      { type: "system", text: "👋 Which category do you want to know about?" }
    ]);
    setStep("category");
    setSelectedCategoryIdx(null);
  }

  // Helper for grid layout: chunk array into rows of 2
  function chunk(arr) {
    const out = [];
    for (let i = 0; i < arr.length; i += 2) out.push(arr.slice(i, i + 2));
    return out;
  }

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