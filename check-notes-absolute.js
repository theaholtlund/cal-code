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

// Compose path for AppleScript
const scriptPath = `${cwd}/apple-scripts/search-notes-absolute.scpt`;

const out = app.doShellScript(
  `CALENDAR_NAME="${calendarName}" CALENDAR_SEARCH_TEXT="${searchText}" osascript "${scriptPath}"`
);

out.split("\n").forEach((line) => {
  const [title, dateStr] = line.split("|||");
  console.log(`✔ "${title}" @ ${dateStr}`);
});
