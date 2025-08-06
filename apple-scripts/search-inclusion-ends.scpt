-- Ends-with match filter using case-sensitive comparison
-- Matches if the event description ends exactly with the searchText, including any trailing whitespace

on isoDate(theDate)
	set y to year of theDate as text
	set m to text -2 thru -1 of ("0" & (month of theDate as integer))
	set d to text -2 thru -1 of ("0" & day of theDate)
	set h to text -2 thru -1 of ("0" & hours of theDate)
	set min to text -2 thru -1 of ("0" & minutes of theDate)
	set s to text -2 thru -1 of ("0" & seconds of theDate)
	return y & "-" & m & "-" & d & "T" & h & ":" & min & ":" & s
end isoDate

with timeout of 600 seconds
	-- Read calendar name and search text from environment
	set calendarName to system attribute "CALENDAR_NAME"
	set searchText to system attribute "CALENDAR_SEARCH_TEXT"

	-- Connect to Calendar app and get matching events
	tell application "Calendar"
		set calRef to calendar calendarName
		set filteredEvents to every event of calRef whose description contains searchText

		set outputLines to {}
		repeat with ev in filteredEvents
			set desc to description of ev
			if desc ends with searchText then
				set evSummary to summary of ev
				set evISO to my isoDate(start date of ev)
				copy ("✓ \"" & evSummary & "\" @ " & evISO) to end of outputLines
			end if
		end repeat

		set AppleScript's text item delimiters to linefeed
		return outputLines as text
	end tell
end timeout
