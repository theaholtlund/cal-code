with timeout of 300 seconds
  tell application "Calendar"
    set calRef to calendar (system attribute "CALENDAR_NAME")

    set outputLines to {}
  end tell

  return outputLines as text
end timeout
