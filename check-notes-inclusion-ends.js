#!/usr/bin/env osascript -l JavaScript
// Import macOS system libraries for environment and file operations
ObjC.import("stdlib");
ObjC.import("Foundation");

// Create the main application object and enable standard scripting additions
const app = Application.currentApplication();
app.includeStandardAdditions = true;

// Get current working directory and config file path
const cwd = $.getenv("PWD");
const configPath = `${cwd}/config.json`;

/**
 * Load configuration values from a JSON file.
 */
function loadConfig(path) {
  const fm = $.NSFileManager.defaultManager;
  if (!fm.fileExistsAtPath(path)) {
    console.log(`Configuration file not found at ${path}`);
    $.exit(1);
  }
  const content = $.NSString.stringWithContentsOfFileEncodingError(
    path,
    $.NSUTF8StringEncoding,
    null
  );
  if (!content) {
    console.log(`Unable to read configuration file at ${path}`);
    $.exit(1);
  }

  try {
    return JSON.parse(ObjC.unwrap(content));
  } catch (e) {
    console.log(`Invalid JSON in configuration file at ${path}`);
    $.exit(1);
  }
}

/**
 * Validate that a required configuration variable is set.
 */
function validateConfig(varName, value) {
  if (!value) {
    console.log(`${varName} not set in configuration file`);
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

// Load configuration and validate
const config = loadConfig(configPath);
const calendarName = config.CALENDAR_NAME;
const searchText = config.CALENDAR_SEARCH_TEXT;

validateConfig("CALENDAR_NAME", calendarName);
validateConfig("CALENDAR_SEARCH_TEXT", searchText);

// Path to the AppleScript file to execute
const scriptPath = `${cwd}/apple-scripts/search-inclusion-ends.scpt`;

try {
  // Escape shell arguments and pass them as environment variables
  const escapedCalendar = calendarName.replace(/'/g, `'\\''`);
  const escapedSearch = searchText.replace(/'/g, `'\\''`);
  const command = `CALENDAR_NAME='${escapedCalendar}' CALENDAR_SEARCH_TEXT='${escapedSearch}' osascript "${scriptPath}"`;
  const output = app.doShellScript(command);

  // If no matching output, notify and exit cleanly
  if (!output.trim()) {
    console.log("No matching events found");
    $.exit(0);
  }

  // Parse and sort the AppleScript output lines by event start datetime
  const lines = normaliseOutput(output)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  lines.sort((a, b) => {
    const dateA = parseDateFromLine(a);
    const dateB = parseDateFromLine(b);
    if (!dateA || !dateB) return 0;
    return dateA - dateB;
  });

  // Print sorted and formatted lines
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
