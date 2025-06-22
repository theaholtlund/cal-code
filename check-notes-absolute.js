#!/usr/bin/env osascript -l JavaScript
// Import macOS system libraries for environment and file operations
ObjC.import("stdlib");

// Create the main application object and enable standard scripting additions
const app = Application.currentApplication();
app.includeStandardAdditions = true;

// Get current working directory and path to env file
const cwd = $.getenv("PWD");
const envPath = `${cwd}/.env`;

/**
 * Load environment variables from an env file.
 */
function loadEnv(path) {
  const fm = $.NSFileManager.defaultManager;
  if (!fm.fileExistsAtPath(path)) {
    console.log(`❌ .env file not found at ${path}`);
    $.exit(1);
  }
  const content = $.NSString.stringWithContentsOfFileEncodingError(
    path,
    $.NSUTF8StringEncoding,
    null
  );
  if (!content) {
    console.log(`❌ Unable to read .env file at ${path}`);
    $.exit(1);
  }
  const lines = ObjC.unwrap(content).split("\n");
  const env = {};
  lines.forEach((line) => {
    line = line.trim();
    if (!line || line.startsWith("#")) return; // Ignore empty lines and comments
    const [key, ...vals] = line.split("=");
    env[key.trim()] = vals.join("=");
  });
  return env;
}

/**
 * Validate that a required environment variable is set.
 */
function validateEnv(varName, value) {
  if (!value) {
    console.log(`❌ ${varName} not set in .env`);
    $.exit(1);
  }
}

/**
 * Normalise the AppleScript output by fixing line endings and splitting into lines.
 */
function normaliseOutput(output) {
  return output.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim().split("\n");
}

// Load environment variables
const env = loadEnv(envPath);
const calendarName = env.CALENDAR_NAME;
const searchText = env.CALENDAR_SEARCH_TEXT;

// Validate required env variables exist
validateEnv("CALENDAR_NAME", calendarName);
validateEnv("CALENDAR_SEARCH_TEXT", searchText);

// Path to the AppleScript file to execute
const scriptPath = `${cwd}/apple-scripts/search-notes-absolute.scpt`;

try {
  // Construct and run AppleScript command with environment variables passed inline
  const command = `CALENDAR_NAME="${calendarName}" CALENDAR_SEARCH_TEXT="${searchText}" osascript "${scriptPath}"`;
  const output = app.doShellScript(command);

  // If no matching output, notify and exit cleanly
  if (!output.trim()) {
    console.log("✅ No matching events found");
    $.exit(0);
  }

  // Print each non-empty line of AppleScript output
  normaliseOutput(output).forEach((line) => {
    const trimmed = line.trim();
    if (trimmed.length > 0) console.log(trimmed);
  });
} catch (e) {
  // Handle AppleScript timeout or other errors gracefully
  if (e.errorNumber === -1712) {
    console.log("❌ AppleScript timed out");
  } else {
    console.log(`❌ AppleScript error: ${e}`);
  }
  $.exit(1);
}
