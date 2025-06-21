#!/usr/bin/env osascript -l JavaScript

ObjC.import("stdlib");
ObjC.import("Foundation");

const app = Application.currentApplication();
app.includeStandardAdditions = true;

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
    if (!line || line.startsWith("#")) return;
    const [key, ...vals] = line.split("=");
    const keyTrimmed = key.trim();
    const valueRaw = vals.join("=");
    env[keyTrimmed] = valueRaw;
  });
  return env;
}

const cwd = $.getenv("PWD");
const envPath = `${cwd}/.env`;
const env = loadEnv(envPath);

const calendarName = env.CALENDAR_NAME;
const searchText = env.CALENDAR_SEARCH_TEXT;

if (!calendarName) {
  console.log("❌ CALENDAR_NAME not set in .env");
  $.exit(1);
}
if (!searchText) {
  console.log("❌ CALENDAR_SEARCH_TEXT not set in .env");
  $.exit(1);
}

const scriptPath = `${cwd}/apple-scripts/search-notes-absolute.scpt`;

try {
  const raw = `CALENDAR_NAME="${calendarName}" CALENDAR_SEARCH_TEXT="${searchText}" osascript "${scriptPath}"`;
  const out = app.doShellScript(raw);

  if (!out.trim()) {
    console.log("✅ No matching events found");
    $.exit(0);
  }

  // Normalise line endings and split output into bullet lines
  const normalizedOutput = out.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  normalizedOutput
    .trim()
    .split("\n")
    .forEach((line) => {
      const trimmed = line.trim();
      if (trimmed.length > 0) {
        console.log(trimmed);
      }
    });
} catch (e) {
  if (e.errorNumber === -1712) {
    console.log("❌ AppleScript timed out");
  } else {
    console.log(`❌ AppleScript error: ${e}`);
  }
  $.exit(1);
}
