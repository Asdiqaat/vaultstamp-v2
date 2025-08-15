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
            <a href="/uploads" className={location.pathname === "/uploads" ? "active" : ""}>Uploads</a>
            <a href="/uploaded-files" className={location.pathname === "/uploaded-files" ? "active" : ""}>Uploaded Files</a>
            <a href="/verify-files" className={location.pathname === "/verify-files" ? "active" : ""}>Verify Files</a>
            <a href="/plagiarism-check" className={location.pathname === "/plagiarism-check" ? "active" : ""}>AI Plagiarism Check</a>
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
        <a href="/uploads" className="action-btn">Upload Files</a>
        <a href="/uploaded-files" className="action-btn">View Uploaded Files</a>
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

function UploadedFiles({ files, handleFileDownload, handleFileDelete }) {
  return (
    <div className="view active">
      <h2 className="text-xl font-bold mb-4">Uploaded Files</h2>
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
                <div className="action-buttons">
                  <button onClick={() => handleFileDownload(file.name)} className="action-btn">
                    Download
                  </button>
                  <button onClick={() => handleFileDelete(file.name)} className="action-btn">
                    Delete
                  </button>
                </div>
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

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authClient, setAuthClient] = useState();
  const [actor, setActor] = useState();
  const [files, setFiles] = useState([]);
  const [errorMessage, setErrorMessage] = useState();
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState("");

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
      agentOptions: {
        identity
      }
    });
    const isAuthenticated = await authClient.isAuthenticated();

    setActor(actor);
    setAuthClient(authClient);
    setIsAuthenticated(isAuthenticated);
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
      try {
        await actor.uploadFile(file.name, new Uint8Array(content), file.type);
        setUploadSuccessMessage(`File "${file.name}" uploaded successfully!`);
        loadFiles();
      } catch (error) {
        console.error("Upload failed:", error);
        setErrorMessage(`Failed to upload ${file.name}.`);
      }
    };

    reader.readAsArrayBuffer(file);
  }

  async function handleFileDownload(name) {
    try {
      const fileContent = await actor.getFile(name);
      if (!fileContent) {
        setErrorMessage(`File "${name}" not found.`);
        return;
      }

      const blob = new Blob([new Uint8Array(fileContent)], { type: "application/octet-stream" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = name;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
      setErrorMessage(`Failed to download ${name}.`);
    }
  }

  return (
    <Router>
      <Header isAuthenticated={isAuthenticated} login={login} logout={logout} />
      <div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route
            path="/uploads"
            element={
              <Uploads
                handleFileUpload={handleFileUpload}
                errorMessage={errorMessage}
                uploadSuccessMessage={uploadSuccessMessage}
              />
            }
          />
          <Route
            path="/uploaded-files"
            element={
              <UploadedFiles
                files={files}
                handleFileDownload={handleFileDownload}
                handleFileDelete={() => {}}
              />
            }
          />
          <Route
            path="/plagiarism-check"
            element={<PlagiarismCheck />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
