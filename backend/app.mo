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
import SHA256 "mo:sha2/Sha256";
import hex "mo:hex";
import Nat8 "mo:base/Nat8";
import Debug "mo:base/Debug";
import Nat64 "mo:base/Nat64";


// Define the persistent actor named Filevault
persistent actor Filevault {

  // Updated File type with phash
  type File = {
    name: Text;       // The name of the file
    content: Blob;    // The entire file content as binary data
    totalSize: Nat;   // The total size of the file in bytes
    fileType: Text;   // The MIME type of the file (e.g., "image/png")
    hash: Text;       // The SHA-256 hash of the file content
    phash: Nat32;         // Principal hash of the owner
    timestamp: Int;   // The timestamp when the file was uploaded
    owner: Principal; // The owner of the file (user principal)
  };

  // Define a data type for storing files associated with a user principal
  type UserFiles = HashMap.Map<Text, File>; // Maps file names (Text) to File objects

  // HashMap to store all user data, where each user (Principal) has their own UserFiles
  private var files = HashMap.new<Principal, UserFiles>();

  // Global registry: hash -> File
  private var globalRegistry = HashMap.new<Text, File>();

  private var alerts = HashMap.new<Principal, [Text]>();

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
  public shared (msg) func uploadFile(name: Text, content: Blob, fileType: Text): async Text {
    // Calculate the SHA-256 hash of the file content
    let bytes: [Nat8] = Blob.toArray(content);
    let digest = SHA256.Digest(#sha256);
    digest.writeArray(bytes);
    let hashBytes: [Nat8] = Blob.toArray(digest.sum());
    let hash: Text = hex.toText(hashBytes);

    // Get the current timestamp
    let timestamp = Time.now();
    let phash: Nat32 = Principal.hash(msg.caller);

    if (Option.isSome(HashMap.get(globalRegistry, thash, hash))) {
      return "This file already exists and is owned by another user.";
    } else {
      let file: File = {
        name = name;
        content = content;
        totalSize = content.size();
        fileType = fileType;
        hash = hash;
        phash = phash;
        timestamp = timestamp;
        owner = msg.caller;
      };

      // Store in global registry
      let _ = HashMap.put(globalRegistry, thash, hash, file);

      // Store in user's files
      let userFiles = getUserFiles(msg.caller);
      let _ = HashMap.put(userFiles, thash, name, file);

      // Add notification: file uploaded successfully
      let alertMsg1 = "File uploaded successfully!";
      let currentAlerts1 = Option.get(HashMap.get(alerts, phash, msg.caller), []);
      let updatedAlerts1 = Array.append(currentAlerts1, [alertMsg1]);
      let _ = HashMap.put(alerts, phash, msg.caller, updatedAlerts1);

      // Add notification: view file details in My Stamps
      let alertMsg2 = "View the file details in My Stamps section.";
      let currentAlerts2 = Option.get(HashMap.get(alerts, phash, msg.caller), []);
      let updatedAlerts2 = Array.append(currentAlerts2, [alertMsg2]);
      let _ = HashMap.put(alerts, phash, msg.caller, updatedAlerts2);

      Debug.print("Backend upload hash: " # hash # " phash: " # Nat32.toText(phash));
      return "File uploaded successfully!";
    }
  };

  // Public method to retrieve a list of all files for the current user
  public shared (msg) func getFiles(): async [{ name: Text; size: Nat; fileType: Text; hash: Text; phash: Nat32; timestamp: Int }] {
    // Iterate over all files in the user's files HashMap and return their metadata
    Iter.toArray(
      Iter.map(
        HashMap.vals(getUserFiles(msg.caller)), // Get all file values for the user
        func(file: File): { name: Text; size: Nat; fileType: Text; hash: Text; phash: Nat32; timestamp: Int } {
          {
            name = file.name;       // Return the file name
            size = file.totalSize;  // Return the file size
            fileType = file.fileType; // Return the file type (MIME type)
            hash = file.hash;       // Return the hash of the file content
            phash = file.phash;         // Return the principal hash of the owner
            timestamp = file.timestamp;     // Return the upload timestamp
          };
        }
      )
    );
  };

  // Verify if a file with the given hash exists for the current user
  public shared (msg) func verifyFileByHash(hash: Text): async ?{ name: Text; fileType: Text; timestamp: Int; owner: Principal; phash: Nat32 } {
    Debug.print("Backend verify hash: " # hash);
    switch (HashMap.get(globalRegistry, thash, hash)) {
      case null {
        Debug.print("No match for hash: " # hash);
        null;
      };
      case (?file) {
        Debug.print("Match found for hash: " # hash # " phash: " # Nat32.toText(file.phash));
        ?{
          name = file.name;
          fileType = file.fileType;
          timestamp = file.timestamp;
          owner = file.owner;
          phash = file.phash;
        };
      };
    }
  };

  // Helper: Calculate Hamming distance between two Nat64 values
  func hammingDistance(a: Nat64, b: Nat64): Nat {
    var x = a ^ b; // XOR to get differing bits
    var dist: Nat = 0;
    while (x != 0) {
      dist += Nat64.toNat(x & 1);
      x >>= 1;
    };
    dist
  };

  // Find files with similar pHash (≥ 90%)
  public shared (msg) func findFilesWithSimilarPhash(phash: Nat64): async [{ name: Text; hash: Text; phash: Nat64; owner: Principal; similarity: Nat }] {
    var result: [{ name: Text; hash: Text; phash: Nat64; owner: Principal; similarity: Nat }] = [];
    for ((_, file) in HashMap.entries(globalRegistry)) {
      let filePhash: Nat64 = Nat64.fromNat(Nat32.toNat(file.phash));
      let dist = hammingDistance(phash, filePhash);
      let similarity = (64 - dist) * 100 / 64;
      if (similarity >= 90) {
        result := Array.append(result, [{
          name = file.name;
          hash = file.hash;
          phash = filePhash;
          owner = file.owner;
          similarity = similarity;
        }]);
      }
    };
    result
  };

  // Converts a Nat32 to [Nat8] in big-endian order
  func nat32ToBytes(n: Nat32): [Nat8] {
    [
      Nat8.fromNat(Nat32.toNat((n >> 24) & 0xff)),
      Nat8.fromNat(Nat32.toNat((n >> 16) & 0xff)),
      Nat8.fromNat(Nat32.toNat((n >> 8) & 0xff)),
      Nat8.fromNat(Nat32.toNat(n & 0xff))
    ]
  };

  public shared (msg) func sendDummyNotification(): async Text {
    let alertMsg = "Welcome! This is a dummy notification for your account.";
    let currentAlerts = Option.get(HashMap.get(alerts, phash, msg.caller), []);
    let updatedAlerts = Array.append(currentAlerts, [alertMsg]);
    let _ = HashMap.put(alerts, phash, msg.caller, updatedAlerts);
    return "Notification sent!";
  };

  public shared (msg) func getAlerts(): async [Text] {
    Option.get(HashMap.get(alerts, phash, msg.caller), [])
  }
};