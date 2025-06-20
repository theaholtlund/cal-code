#!/usr/bin/env osascript -l JavaScript
ObjC.import("stdlib");

const app = Application.currentApplication();
app.includeStandardAdditions = true;

const cwd = $.getenv("PWD");
const envPath = `${cwd}/.env`;

function loadEnv(path) {
  const fm = $.NSFileManager.defaultManager;

  const content = $.NSString.stringWithContentsOfFileEncodingError(
    path,
    $.NSUTF8StringEncoding,
    null
  );

  const lines = ObjC.unwrap(content).split("\n");
  const env = {};
  lines.forEach((line) => {
    line = line.trim();
    const [key, ...vals] = line.split("=");
    const keyTrimmed = key.trim();
    const valueRaw = vals.join("=");
    env[keyTrimmed] = valueRaw;
  });
  return env;
}

const env = loadEnv(envPath);
const calendarName = env.CALENDAR_NAME;
const searchText = env.CALENDAR_SEARCH_TEXT;

const scriptPath = `${cwd}/apple-scripts/search-notes-inclusion.scpt`;

try {
  const raw = `CALENDAR_NAME="${calendarName}" CALENDAR_SEARCH_TEXT="${searchText}" osascript "${scriptPath}"`;
  const out = app.doShellScript(raw);

  if (!out.trim()) {
    console.log("✅ No matching events found.");
    $.exit(0);
  }

  // Normalize line endings and split into lines
  const normalizedOutput = out.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  console.log(normalizedOutput);

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
