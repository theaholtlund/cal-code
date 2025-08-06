#!/usr/bin/env osascript -l JavaScript
ObjC.import("stdlib");

const app = Application.currentApplication();
app.includeStandardAdditions = true;

const cwd = $.getenv("PWD");
const envPath = `${cwd}/.env`;

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
    if (!line || line.startsWith("#")) return;
    const [key, ...vals] = line.split("=");
    env[key.trim()] = vals.join("=");
  });
  return env;
}

function validateEnv(varName, value) {
  if (!value) {
    console.log(`${varName} not set in environment file`);
    $.exit(1);
  }
}

function normaliseOutput(output) {
  return output.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim().split("\n");
}

const env = loadEnv(envPath);
const calendarName = env.CALENDAR_NAME;
const searchText = env.CALENDAR_SEARCH_TEXT;

validateEnv("CALENDAR_NAME", calendarName);
validateEnv("CALENDAR_SEARCH_TEXT", searchText);

const scriptPath = `${cwd}/apple-scripts/search-inclusion-ends.scpt`;

try {
  const command = `CALENDAR_NAME="${calendarName}" CALENDAR_SEARCH_TEXT="${searchText}" osascript "${scriptPath}"`;
  const output = app.doShellScript(command);

  if (!output.trim()) {
    console.log("No matching events found");
    $.exit(0);
  }

  normaliseOutput(output).forEach((line) => {
    const trimmed = line.trim();
    if (trimmed.length > 0) {
      const formattedLine = trimmed.replace(
        /@ (\d{4})-(\d{2})-(\d{2})T(\d{2}:\d{2}).*$/,
        (_, year, month, day, time) => `@ ${day}-${month}-${year} ${time}`
      );
      console.log(formattedLine);
    }
  });
} catch (e) {
  if (e.errorNumber === -1712) {
    console.log("AppleScript timed out");
  } else {
    console.log(`There was an AppleScript error: ${e}`);
  }
  $.exit(1);
}
