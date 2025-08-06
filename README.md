### 🕵️‍♂️ CalCode: Apple Calendar Searches

This is a macOS JavaScript for Automation (JXA) project to perform various search operations with Apple Calendar.

## Prerequisites

- Environment with macOS, version 10.10+
- Apple Calendar, and permissions to access calendar data. The macOS will prompt when running the scripts for the first time

## Installation and Execution

### 1. Make Scripts Executable

Run the following command to make the scripts directly runnable:

```bash
chmod +x check-notes-absolute.js
chmod +x check-notes-inclusion-all.js
chmod +x check-notes-inclusion-ends.js
```

### 2. Set Environment Variables

Specify the calendar name and the search text in calendar event notes using environment variables:

```bash
export CALENDAR_NAME="YOUR-CAL-NAME"
export CALENDAR_SEARCH_TEXT="YOUR-SEARCH-TEXT"
```

### 3. Run The Desired Main Script

Execute desired script from the terminal:

```bash
./check-notes-absolute.js
./check-notes-inclusion-all.js
./check-notes-inclusion-ends.js
```
