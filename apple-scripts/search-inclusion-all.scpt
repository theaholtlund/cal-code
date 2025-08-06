-- Substring filter through case-insensitive contains
-- Matches if searchText appears anywhere within the description of the calendar event

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
	set calendarName to system attribute "CALENDAR_NAME"
	set searchText to system attribute "CALENDAR_SEARCH_TEXT"

	tell application "Calendar"
		set calRef to calendar calendarName
		if calRef is missing value then error "Calendar not found: " & calendarName

		set filteredEvents to every event of calRef whose description contains searchText

		set outputLines to {}
		repeat with i from 1 to count of filteredEvents
			set ev to item i of filteredEvents
			set evSummary to summary of ev
			set evISO to my isoDate(start date of ev)
			copy ("✓ \"" & evSummary & "\" @ " & evISO) to end of outputLines
		end repeat

		set AppleScript's text item delimiters to linefeed
		return outputLines as text
	end tell
end timeout
