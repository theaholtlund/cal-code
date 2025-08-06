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
    console.log(`Environment file not found at ${path}`);
    $.exit(1);
  }
  const content = $.NSString.stringWithContentsOfFileEncodingError(
    path,
    $.NSUTF8StringEncoding,
    null
  );
  if (!content) {
    console.log(`Unable to read environment file at ${path}`);
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
 * Exits with an error message if missing.
 */
function validateEnv(varName, value) {
  if (!value) {
    console.log(`${varName} not set in environment file`);
    $.exit(1);
  }
}

/**
 * Normalise the AppleScript output by fixing line endings and splitting into lines.
 */
function normaliseOutput(output) {
  return output.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim().split("\n");
}

/**
 * Extract ISO datetime from event line and return JavaScript Date object.
 */
function parseDateFromLine(line) {
  const match = line.match(/@ (\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!match) return null;
  const [_, year, month, day, hour, minute] = match;
  return new Date(`${year}-${month}-${day}T${hour}:${minute}:00`);
}

// Load environment variables
const env = loadEnv(envPath);
const calendarName = env.CALENDAR_NAME;
const searchText = env.CALENDAR_SEARCH_TEXT;

// Validate required env variables exist
validateEnv("CALENDAR_NAME", calendarName);
validateEnv("CALENDAR_SEARCH_TEXT", searchText);

// Path to the AppleScript file to execute
const scriptPath = `${cwd}/apple-scripts/search-inclusion-ends.scpt`;

try {
  // Construct and run AppleScript command with environment variables passed inline
  const command = `CALENDAR_NAME="${calendarName}" CALENDAR_SEARCH_TEXT="${searchText}" osascript "${scriptPath}"`;
  const output = app.doShellScript(command);

  // If no matching output, notify and exit cleanly
  if (!output.trim()) {
    console.log("No matching events found");
    $.exit(0);
  }

  // Parse, normalise and filter the AppleScript output lines
  const lines = normaliseOutput(output)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  // Sort lines by event start datetime from oldest to newest
  lines.sort((a, b) => {
    const dateA = parseDateFromLine(a);
    const dateB = parseDateFromLine(b);
    if (!dateA || !dateB) return 0;
    return dateA - dateB;
  });

  // Format and print sorted lines with date in DD-MM-YYYY format
  lines.forEach((line) => {
    const formattedLine = line.replace(
      /@ (\d{4})-(\d{2})-(\d{2})T(\d{2}:\d{2}).*$/,
      (_, year, month, day, time) => `@ ${day}-${month}-${year} ${time}`
    );
    console.log(formattedLine);
  });
} catch (e) {
  // Handle AppleScript timeout or other errors gracefully
  if (e.errorNumber === -1712) {
    console.log("AppleScript timed out");
  } else {
    console.log(`There was an AppleScript error: ${e}`);
  }
  $.exit(1);
}
