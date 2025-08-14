import Bool "mo:base/Bool";
import Array "mo:base/Array";
import HashMap "mo:map/Map";
import { phash; thash } "mo:map/Map";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Nat32 "mo:base/Nat32";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Option "mo:base/Option";
import Blob "mo:base/Blob";
import Time "mo:base/Time";


// Define the persistent actor named Filevault
persistent actor Filevault {

  // Define a data type for a file's metadata and content
  type File = {
    name: Text;       // The name of the file
    content: Blob;    // The entire file content as binary data
    totalSize: Nat;   // The total size of the file in bytes
    fileType: Text;   // The MIME type of the file (e.g., "image/png")
    hash: Text;       // The SHA-256 hash of the file content
    timestamp: Int;   // The timestamp when the file was uploaded
  };

  // Define a data type for storing files associated with a user principal
  type UserFiles = HashMap.Map<Text, File>; // Maps file names (Text) to File objects

  // HashMap to store all user data, where each user (Principal) has their own UserFiles
  private var files = HashMap.new<Principal, UserFiles>();

  // Helper function to retrieve the files associated with a specific user (Principal)
  private func getUserFiles(user: Principal): UserFiles {
    // Check if the user already has files stored
    switch (HashMap.get(files, phash, user)) {
      case null {
        // If no files exist for the user, create a new empty HashMap for their files
        let newFileMap = HashMap.new<Text, File>();
        // Store the new empty HashMap in the main files HashMap
        let _ = HashMap.put(files, phash, user, newFileMap);
        newFileMap; // Return the newly created empty HashMap
      };
      case (?existingFiles) existingFiles; // If files exist, return them
    };
  };

  // Public method to check if a file with the given name exists for the current user
  public shared (msg) func checkFileExists(name: Text): async Bool {
    // Check if the file name exists in the user's files HashMap
    Option.isSome(HashMap.get(getUserFiles(msg.caller), thash, name));
  };

  // Public method to upload an entire file at once
  public shared (msg) func uploadFile(name: Text, content: Blob, fileType: Text): async () {
    // Retrieve the user's files HashMap
    let userFiles = getUserFiles(msg.caller);

    // Calculate the SHA-256 hash of the file content
    let hash = Nat32.toText(Blob.hash(content)); // Convert the hash to Text format

    // Get the current timestamp
    let timestamp = Time.now();

    // Check if a file with the given name already exists
    switch (HashMap.get(userFiles, thash, name)) {
      case null {
        // If the file does not exist, create a new entry in the user's files HashMap
        let _ = HashMap.put(userFiles, thash, name, {
          name = name;               // Set the file name
          content = content;         // Store the file content
          totalSize = content.size(); // Calculate and store the file size
          fileType = fileType;       // Store the file type (MIME type)
          hash = hash;               // Store the hash of the file content
          timestamp = timestamp;     // Store the upload timestamp
        });
      };
      case (?existingFile) {
        // If the file already exists, overwrite it with the new content
        let _ = HashMap.put(
          userFiles,
          thash,
          name,
          {
            name = name;               // Set the file name
            content = content;         // Overwrite the file content
            totalSize = content.size(); // Update the file size
            fileType = fileType;       // Update the file type (MIME type)
            hash = hash;               // Update the hash of the file content
            timestamp = timestamp;     // Update the upload timestamp
          }
        );
      };
    };
  };

  // Public method to retrieve a list of all files for the current user
  public shared (msg) func getFiles(): async [{ name: Text; size: Nat; fileType: Text; hash: Text; timestamp: Int }] {
    // Iterate over all files in the user's files HashMap and return their metadata
    Iter.toArray(
      Iter.map(
        HashMap.vals(getUserFiles(msg.caller)), // Get all file values for the user
        func(file: File): { name: Text; size: Nat; fileType: Text; hash: Text; timestamp: Int } {
          {
            name = file.name;       // Return the file name
            size = file.totalSize;  // Return the file size
            fileType = file.fileType; // Return the file type (MIME type)
            hash = file.hash;       // Return the hash of the file content
            timestamp = file.timestamp;     // Return the upload timestamp
          };
        }
      )
    );
  };

  // Public method to retrieve the content of a specific file
  public shared (msg) func getFile(name: Text): async ?Blob {
    // Check if the file exists in the user's files HashMap
    switch (HashMap.get(getUserFiles(msg.caller), thash, name)) {
      case null null; // If the file does not exist, return null
      case (?file) ?file.content; // If the file exists, return its content
    };
  };

  // Public method to retrieve the MIME type of a specific file
  public shared (msg) func getFileType(name: Text): async ?Text {
    // Check if the file exists in the user's files HashMap
    switch (HashMap.get(getUserFiles(msg.caller), thash, name)) {
      case null null; // If the file does not exist, return null
      case (?file) ?file.fileType; // If the file exists, return its MIME type
    };
  };

  // Public method to delete a specific file
  public shared (msg) func deleteFile(name: Text): async Bool {
    // Remove the file from the user's files HashMap and return whether the operation was successful
    Option.isSome(HashMap.remove(getUserFiles(msg.caller), thash, name));
  };

  // Get the current timestamp
  let timestamp = Time.now();
};
