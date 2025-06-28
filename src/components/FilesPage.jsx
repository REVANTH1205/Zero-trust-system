import React, { useState, useEffect } from 'react';
import emailjs from '@emailjs/browser';
import '../styles/filepage.css';

// Open IndexedDB
// Open IndexedDB
const openDB = () => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('FilesDB', 2); // Increment version number to trigger upgrade
  
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        
        // Create 'files' object store if it doesn't exist
        if (!db.objectStoreNames.contains('files')) {
          db.createObjectStore('files', { keyPath: 'fileName' });
        }
  
        // Create 'logs' object store if it doesn't exist
        if (!db.objectStoreNames.contains('logs')) {
          db.createObjectStore('logs', { keyPath: 'timestamp' });
        }
      };
  
      request.onsuccess = (e) => {
        resolve(e.target.result);
      };
  
      request.onerror = (e) => {
        reject(e.target.error);
      };
    });
  };
  
const currentUser = JSON.parse(localStorage.getItem('currentUser'));
const role = currentUser ? currentUser.role : 'Unknown';  // Default to 'Unknown' if no role is found
console.log('Role:', role);

// Add file to IndexedDB
const addFileToDB = async (fileData) => {
  const db = await openDB();
  const transaction = db.transaction(['files'], 'readwrite');
  const store = transaction.objectStore('files');
  store.put(fileData);
  logAction('UPLOAD', fileData.fileName ,role);  // Log upload action
};

// Get all files from IndexedDB
const getAllFilesFromDB = async () => {
  const db = await openDB();
  const transaction = db.transaction(['files'], 'readonly');
  const store = transaction.objectStore('files');

  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e.target.error);
  });
};

// Delete file from IndexedDB
const deleteFileFromDB = async (fileName) => {
  const db = await openDB();
  const transaction = db.transaction(['files'], 'readwrite');
  const store = transaction.objectStore('files');
  store.delete(fileName);
  logAction('DELETE', fileName ,role);  // Log delete action
};

// Function to send OTP using EmailJS
const sendOTPToEmail = (email, otp) => {
  const serviceId = 'service_f5lick567'; // Replace with your Service ID
  const templateId = 'template_c0w75ea'; // Replace with your Template ID
  const userId = 'RW-hXbOHEK7gIkLJK'; // Replace with your User ID

  const templateParams = {
    to_email: email,
    otp_code: otp, // Variable name should match your template on EmailJS
  };

  return emailjs.send(serviceId, templateId, templateParams, userId);
};

// Logging function to log actions
// Logging function
const logAction = (actionType, fileName, role) => {
    const timestamp = new Date().toISOString();
    const logEntry = { action: actionType, fileName, role, timestamp };
    console.log('Log entry created:', logEntry);
  
    // Add to IndexedDB
    const db = openDB();
    db.then((db) => {
      const transaction = db.transaction(['logs'], 'readwrite');
      const store = transaction.objectStore('logs');
      store.put(logEntry);  // Store the log entry
      console.log('Log entry added to DB');
    }).catch((error) => {
      console.error('Error adding log entry to DB:', error);
    });
  };
  

export default function FilesPage() {
  const [file, setFile] = useState(null);
  const [sensitivity, setSensitivity] = useState('low');
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const [otp, setOtp] = useState('');
  const [generatedOTP, setGeneratedOTP] = useState(null);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [fileToDownload, setFileToDownload] = useState(null);
  const [fileToDelete, setFileToDelete] = useState(null); // NEW: For deleting files
  const [email, setEmail] = useState('');

  useEffect(() => {
    loadFiles();

    // Get logged in user's email from localStorage
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser && currentUser.email) {
      setEmail(currentUser.email);
    } else {
      console.error('No logged-in user found.');
    }
  }, []);

  const loadFiles = async () => {
    const files = await getAllFilesFromDB();
    setUploadedFiles(files);
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSensitivityChange = (e) => {
    setSensitivity(e.target.value);
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Please select a file to upload.');
      return;
    }

    const fileData = {
      fileName: file.name,
      fileSize: file.size,
      sensitivity,
      fileData: file,
    };

    await addFileToDB(fileData);
    alert('File uploaded successfully!');
    
    logAction('UPLOAD', file.name,role);  // Log upload action

    setFile(null);
    setSensitivity('low');
    loadFiles();
  };

  const handleDownload = async (fileName) => {
    const fileEntry = uploadedFiles.find((f) => f.fileName === fileName);
    if (!fileEntry) {
      alert('File not found!');
      return;
    }

    const otp = generateOTP();
    setGeneratedOTP(otp);
    setFileToDownload(fileEntry);

    console.log('Generated OTP:', otp);

    if (email) {
      try {
        await sendOTPToEmail(email, otp);
        alert('OTP sent to your email!');
        setShowOTPModal(true); // Show OTP input modal
        logAction('DOWNLOAD', fileName,role);  // Log download action
      } catch (error) {
        console.error('Failed to send OTP:', error);
        alert('Failed to send OTP. Please try again.');
      }
    } else {
      alert('No user email found. Please login again.');
    }
  };

  const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
  };

  const handleOTPSubmit = async () => {
    if (otp === String(generatedOTP)) {
      alert('OTP verified!');

      // If it's for Download
      if (fileToDownload && fileToDownload.fileData) {
        const blob = fileToDownload.fileData;
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = fileToDownload.fileName;
        a.click();

        URL.revokeObjectURL(url);

        setFileToDownload(null);
      }

      // If it's for Delete
      if (fileToDelete) {
        await deleteFileFromDB(fileToDelete.fileName);
        alert('File deleted successfully!');
        setFileToDelete(null);
        loadFiles(); // Refresh the list
      }

      // Reset OTP flow
      setShowOTPModal(false);
      setOtp('');
      setGeneratedOTP(null);
    } else {
      alert('Incorrect OTP! Please try again.');
    }
  };

  const handleDelete = async (fileName) => {
    const fileEntry = uploadedFiles.find((f) => f.fileName === fileName);
    if (!fileEntry) {
      alert('File not found!');
      return;
    }

    const otp = generateOTP();
    setGeneratedOTP(otp);
    setFileToDelete(fileEntry);

    console.log('Generated OTP for delete:', otp);

    if (email) {
      try {
        await sendOTPToEmail(email, otp);
        alert('OTP sent to your email for deletion!');
        setShowOTPModal(true); // Show the same OTP modal
        logAction('DELETE', fileName,role);  // Log delete action
      } catch (error) {
        console.error('Failed to send OTP:', error);
        alert('Failed to send OTP. Please try again.');
      }
    } else {
      alert('No user email found. Please login again.');
    }
  };

  return (
    <div className="files-page-container">
      <h1>Manage Files</h1>

      {/* Upload Form */}
      <div className="upload-form">
        <label>Select File</label>
        <input type="file" onChange={handleFileChange} />

        <label>Choose Sensitivity Level</label>
        <select value={sensitivity} onChange={handleSensitivityChange}>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <button onClick={handleUpload}>Upload</button>
      </div>

      {/* Uploaded Files Table */}
      <div className="uploaded-files-table">
        <h2>Uploaded Files</h2>
        {uploadedFiles.length === 0 ? (
          <p>No files uploaded yet.</p>
        ) : (
          <table border="1" cellPadding="10">
            <thead>
              <tr>
                <th>File Name</th>
                <th>Size (KB)</th>
                <th>Sensitivity</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {uploadedFiles.map((file, index) => (
                <tr key={index}>
                  <td className='hell'>{file.fileName}</td>
                  <td className='hell'>{(file.fileSize / 1024).toFixed(2)}</td>
                  <td className='hell'>
                    {file.sensitivity
                      ? file.sensitivity.charAt(0).toUpperCase() + file.sensitivity.slice(1)
                      : 'Unknown'}
                  </td>
                  <td>
                    <button onClick={() => handleDownload(file.fileName)}>Download</button>
                    <button onClick={() => handleDelete(file.fileName)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* OTP Modal */}
      {showOTPModal && (
        <div className="otp-modal">
          <h2>Enter OTP</h2>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter OTP"
          />
          <button onClick={handleOTPSubmit}>Submit</button>
        </div>
      )}
    </div>
  );
}
