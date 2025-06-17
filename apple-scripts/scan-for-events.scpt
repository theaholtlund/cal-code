with timeout of 300 seconds
  tell application "Calendar"
    set calRef to calendar (system attribute "CALENDAR_NAME")
    if calRef is missing value then error "Calendar not found"

    set outputLines to {}
    set evList to every event of calRef
    repeat with ev in evList
      try
        set evNotes to notes of ev as text
      on error
        set evNotes to ""
      end try
      if evNotes = "Totalt: " then
        set evStart to start date of ev
        set evSummary to summary of ev
        set evISO to evStart as «class isot»
        copy (evSummary & "|||" & evISO) to end of outputLines
      end if
    end repeat
  end tell

  return outputLines as text
end timeout
