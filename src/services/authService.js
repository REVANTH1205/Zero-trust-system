// Read users from LocalStorage
export function getUsers() {
    const users = localStorage.getItem('users');
    return users ? JSON.parse(users) : [];
  }
  
  // Find a user by email and password
  export function findUserByEmailPassword(email, password) {
    const users = getUsers();
    return users.find(user => user.email === email && user.password === password);
  }
  
  // Register a new user
  export function registerUser(newUser) {
    const users = getUsers();
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
  }
  
  // ✅ Check if a user already exists by email
  export function doesUserExist(email) {
    const users = getUsers();
    return users.some(user => user.email === email);
  }
  