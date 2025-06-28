import { Link } from 'react-router-dom';
import { getUsers } from '../services/authService';
import '../styles/admindash.css';

export default function AdminDashboard() {
  const users = getUsers();
  const admin = users.find(user => user.role === 'admin');

  // If no admin is found, redirect to login (should not happen in theory)
  if (!admin) {
    return <div>No admin found. Please register an admin first.</div>;
  }

  const handleLogout = () => {
    // Clear the current user from localStorage
    localStorage.removeItem('currentUser');
    alert('You have been logged out.');
    // Redirect to login page (adjust the route if necessary)
    window.location.href = '/login'; // or use React Router's `history.push('/login')` for SPA navigation
  };

  return (
    <div className="admin-dashboard-container">
    
           <br></br>
           <br></br>
           <br></br>
           <br></br>
           <br></br>
           <br></br>
           <br></br>
           <br></br>
           <br></br>
           <br></br>
           <br></br>
           <br></br>
           <br></br>
           <br></br>
           <br></br>
           <br></br>
           <br></br>
           
           <br></br>
           <br></br>
           <br></br>
           <br></br>
           <br></br>
           <br></br>
           
           <br></br>
           <br></br>
           <br></br>
           <br></br>
           <br></br>
           <br></br>

      <h1>Welcome, Admin!</h1>
           {/* spacing */}
        
      <div className="dashboard-stats">
        <h2>System Stats</h2>

        <ul>
          <li>Total Users: {users.length}</li>
          <li>Total Workers: {users.filter(user => user.role === 'worker').length}</li>
          <li>Total Executives: {users.filter(user => user.role === 'executive').length}</li>
        </ul>

      </div>
               {/* Logout Button */}
      <button onClick={handleLogout} style={{ marginBottom: '20px' }}>Logout</button>
      <div className="manage-users-link">
        <h2>Manage Users</h2>
        <p>Click below to manage users (add, edit, delete):</p>
        <Link to="/manage-users">
          <button>Go to Manage Users</button>
        </Link>
      </div>

      {/* Files Button */}
      <div className="manage-users-link">
        <h2>Manage Files</h2>
        <p>Click below to manage and upload files:</p>
        <Link to="/files">
          <button>Go to Files</button>
        </Link>
      </div>

         {/* Log Reports Link */}
         <div className="manage-users-link">
        <h2>Log Reports</h2>
        <p>Click below to view audit logs:</p>
        <Link to="/audit-logs">
          <button>Go to Audit Logs</button>
        </Link>
      </div>
    </div>
  );
}
