on run
  -- Read environment variables passed as system attributes
  set calendarName to system attribute "CALENDAR_NAME"
  set searchText to system attribute "CALENDAR_SEARCH_TEXT"
  
  if calendarName is missing value or calendarName = "" then
    error "CALENDAR_NAME not set"
  end if
  
  if searchText is missing value or searchText = "" then
    error "CALENDAR_SEARCH_TEXT not set"
  end if
  
  tell application "Calendar"
    set calRef to calendar calendarName
    
    set outputLines to {}
    set evList to every event of calRef
    repeat with ev in evList
      try
        set evNotes to notes of ev as text
      on error
        set evNotes to ""
      end try
      
      if evNotes contains searchText or evNotes contains (do shell script "echo " & quoted form of searchText & " | tr '[:upper:]' '[:lower:]'") then
        set evSummary to summary of ev
        set evStart to start date of ev
        set evISO to evStart as «class isot»
        copy (evSummary & "|||" & evISO) to end of outputLines
      end if
    end repeat
  end tell
  
  return outputLines as text
end run
