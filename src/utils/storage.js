// utils/storage.js

// Function to get files from local storage or return an empty array
export const getFilesFromStorage = () => {
    const storedFiles = localStorage.getItem('uploadedFiles');
    return storedFiles ? JSON.parse(storedFiles) : [];
  };
  
  // Function to save files to local storage
  export const saveFilesToStorage = (files) => {
    localStorage.setItem('uploadedFiles', JSON.stringify(files));
  };
  
  // Function to add a new file to the storage
  export const addFileToStorage = (newFile) => {
    const files = getFilesFromStorage();
    files.push(newFile);
    saveFilesToStorage(files);
  };
  
  // Function to delete a file from the storage
  export const deleteFileFromStorage = (fileName) => {
    let files = getFilesFromStorage();
    files = files.filter(file => file.fileName !== fileName);
    saveFilesToStorage(files);
  };
  