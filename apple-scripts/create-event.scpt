tell application "Calendar"
	tell calendar "Personal"
		make new event at end with properties {summary:"Random Fake Event", start date:(current date), end date:((current date) + 1 * hours)}
	end tell
end tell
