import React, { useState, useEffect } from 'react';
import emailjs from '@emailjs/browser';
import '../styles/filepage.css'; // You can reuse the same styles!

// --- IndexedDB Operations ---
const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('FilesDB', 2); // <-- IMPORTANT: version 2 to have 'logs' store

    request.onsuccess = (e) => {
      resolve(e.target.result);
    };

    request.onerror = (e) => {
      reject(e.target.error);
    };
  });
};

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

// ---- ✅ ADD THIS: Save Worker Logs ----
const saveLogToDB = async (logEntry) => {
  const db = await openDB();
  const transaction = db.transaction(['logs'], 'readwrite');
  const store = transaction.objectStore('logs');
  store.add(logEntry);
};

// --- Send OTP using EmailJS ---
const sendOTPToEmail = (email, otp) => {
  const serviceId = 'service_f5lick567'; // your EmailJS service ID
  const templateId = 'template_c0w75ea'; // your EmailJS template ID
  const userId = 'RW-hXbOHEK7gIkLJK';    // your EmailJS user ID

  const templateParams = {
    to_email: email,
    otp_code: otp,
  };

  return emailjs.send(serviceId, templateId, templateParams, userId);
};

export default function ExecutiveDashboard() {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [otp, setOtp] = useState('');
  const [generatedOTP, setGeneratedOTP] = useState(null);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [fileToDownload, setFileToDownload] = useState(null);
  const [email, setEmail] = useState('');

  useEffect(() => {
    loadFiles();

    // Get logged-in user's email
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser && currentUser.email) {
      setEmail(currentUser.email);
    } else {
      console.error('No logged-in user found.');
    }
  }, []);

  const loadFiles = async () => {
    const files = await getAllFilesFromDB();
    // Only show files with sensitivity low, medium, high
    const filteredFiles = files.filter(file => 
      file.sensitivity === 'low' || 
      file.sensitivity === 'medium' || 
      file.sensitivity === 'critical' || 
      file.sensitivity === 'high'
    );
    setUploadedFiles(filteredFiles);
  };

  const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
  };

  const handleDownload = async (fileName) => {
    const fileEntry = uploadedFiles.find(f => f.fileName === fileName);
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
        setShowOTPModal(true);
      } catch (error) {
        console.error('Failed to send OTP:', error);
        alert('Failed to send OTP. Please try again.');
      }
    } else {
      alert('No user email found. Please login again.');
    }
  };

  const handleOTPSubmit = async () => {
    if (otp === String(generatedOTP)) {
      alert('OTP verified! Starting download...');

      if (fileToDownload && fileToDownload.fileData) {
        const blob = fileToDownload.fileData;
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = fileToDownload.fileName;
        a.click();

        URL.revokeObjectURL(url);

        // ---- ✅ Save Worker Download Log ----
        const logEntry = {
          action: 'Downloaded',
          fileName: fileToDownload.fileName,
          timestamp: new Date().toISOString(),
          role: 'executive',
          email: email,
        };
        await saveLogToDB(logEntry);
      } else {
        alert('Invalid file to download.');
      }

      // Reset after download
      setShowOTPModal(false);
      setOtp('');
      setGeneratedOTP(null);
      setFileToDownload(null);
    } else {
      alert('Incorrect OTP! Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    alert('You have been logged out.');
    window.location.href = '/login';
  };

  return (
    <div className="files-page-container">
      <h1>Worker Dashboard</h1>

      <button onClick={handleLogout} style={{ marginBottom: '20px' }}>Logout</button>

      <div className="uploaded-files-table">
        <h2>Available Files</h2>
        {uploadedFiles.length === 0 ? (
          <p>No files available for you.</p>
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

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
