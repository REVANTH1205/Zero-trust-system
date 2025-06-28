import React, { useState, useEffect } from 'react';
import { getAllLogsFromDB } from '../services/logService';
import '../styles/audit.css';   // ✅ Un-comment and import your CSS!

export default function AuditLogPage() {
  const [logs, setLogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState(''); // State to hold the search query

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const fetchedLogs = await getAllLogsFromDB();
        console.log('Fetched Logs for display:', fetchedLogs);
        setLogs(fetchedLogs);
      } catch (error) {
        console.error('Error fetching logs:', error);
      }
    };

    fetchLogs();
  }, []);

  // Filter logs based on the search query
  const filteredLogs = logs.filter((log) =>
    log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="audit-log-container">
      <h1>Audit Log</h1>

      {/* Search Input */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Search by action, file name, or role..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)} // Update search query
        />
      </div>

      <table className="audit-log-table">
        <thead>
          <tr>
            <th>Action</th>
            <th>File Name</th>
            <th>Timestamp</th>
            
          </tr>
        </thead>
        <tbody>
          {filteredLogs.length === 0 ? (
            <tr>
              <td colSpan="4">No logs found.</td>
            </tr>
          ) : (
            filteredLogs.map((log, index) => (
              <tr key={index}>
                <td>{log.action}</td>
                <td>{log.fileName}</td>
                <td>{new Date(log.timestamp).toLocaleString()}</td> {/* Optional: format timestamp nicely */}
                
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
