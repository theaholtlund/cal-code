#!/usr/bin/env osascript -l JavaScript
ObjC.import("stdlib");

const app = Application.currentApplication();
app.includeStandardAdditions = true;

const cwd = $.getenv("PWD");
const envPath = `${cwd}/.env`;
