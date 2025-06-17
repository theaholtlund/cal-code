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

const out = app.doShellScript(
  `CALENDAR_NAME="${calendarName}" CALENDAR_SEARCH_TEXT="${searchText}" osascript "${scriptPath}"`
);

out.split("\n").forEach((line) => {
  const [title, dateStr] = line.split("|||");
  console.log(`✔ "${title}" @ ${dateStr}`);
});
