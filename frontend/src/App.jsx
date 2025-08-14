import { AuthClient } from '@dfinity/auth-client';
import { createActor } from 'declarations/backend';
import { canisterId } from 'declarations/backend/index.js';
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import '../index.css';

const network = process.env.DFX_NETWORK;
const identityProvider =
  network === 'ic'
    ? 'https://identity.ic0.app' // Mainnet
    : 'http://rdmx6-jaaaa-aaaaa-aaadq-cai.localhost:4943'; // Local

function Header({ isAuthenticated, login, logout }) {
  return (
    <header className="bg-gray-800 text-white py-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">FileVault</h1>
        <nav>
          <ul className="flex space-x-4">
            <li><a href="/" className="hover:underline">Home</a></li>
            <li><a href="/about" className="hover:underline">About</a></li>
            <li><a href="/uploads" className="hover:underline">Uploads</a></li>
            <li><a href="/uploaded-files" className="hover:underline">Uploaded Files</a></li>
            <li><a href="/verify-files" className="hover:underline">Verify Files</a></li>
            <li><a href="/plagiarism-check" className="hover:underline">AI Plagiarism Check</a></li>
          </ul>
        </nav>
        {isAuthenticated ? (
          <button onClick={logout} className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">
            Logout
          </button>
        ) : (
          <button onClick={login} className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">
            Login
          </button>
        )}
      </div>
    </header>
  );
}

function Home() {
  return <div className="p-4">Welcome to the Home page!</div>;
}

function About() {
  return <div className="p-4">Learn more about us on the About page.</div>;
}

function Uploads({ handleFileUpload, errorMessage, uploadSuccessMessage }) {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Upload Files</h2>
      <div className="mb-4">
        <input
          type="file"
          onChange={handleFileUpload}
          className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>

      {/* Display error message */}
      {errorMessage && (
        <div className="mt-4 rounded-md border border-red-400 bg-red-100 p-3 text-red-700">{errorMessage}</div>
      )}

      {/* Display success message */}
      {uploadSuccessMessage && (
        <div className="mt-4 rounded-md border border-green-400 bg-green-100 p-3 text-green-700">
          {uploadSuccessMessage}
        </div>
      )}
    </div>
  );
}

function UploadedFiles({ files, handleFileDownload, handleFileDelete }) {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Uploaded Files</h2>
      <p className="mb-4 text-gray-600">
        This page displays all the files you have uploaded. You can download or delete files from here.
      </p>
      <div className="space-y-2">
        {files.length === 0 ? (
          <>
            <p className="py-8 text-center text-gray-500">No files have been uploaded yet.</p>
            <p className="text-center text-gray-500">Start uploading files to see them listed here.</p>
          </>
        ) : (
          files.map((file) => (
            <div key={file.name} className="flex flex-col rounded-lg bg-white p-3 shadow">
              <div className="flex items-center justify-between">
                <span>{file.name}</span>
                <div className="flex space-x-2">
                  <button onClick={() => handleFileDownload(file.name)} className="btn">
                    Download
                  </button>
                  <button onClick={() => handleFileDelete(file.name)} className="btn">
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
      const content = e.target.result; // ArrayBuffer
      try {
        await actor.uploadFile(file.name, new Uint8Array(content), file.type);
        setUploadSuccessMessage(`File "${file.name}" uploaded successfully!`);
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
      <div className="container mx-auto p-4">
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
        </Routes>
      </div>
    </Router>
  );
}

export default App;
