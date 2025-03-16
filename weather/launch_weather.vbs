Set WShell = CreateObject("WScript.Shell")
Set oShell = CreateObject("Shell.Application")
Set fso = CreateObject("Scripting.FileSystemObject")

On Error Resume Next

' Get the script's directory
strPath = fso.GetParentFolderName(WScript.ScriptFullName)

If Err.Number <> 0 Then
    WScript.Echo "Error getting script path: " & Err.Description
    WScript.Quit
End If

' Get wallpaper path using full path to PowerShell script
pshellCmd = "powershell -executionpolicy bypass -file """ & strPath & "\get-wallpaper.ps1"""
Set wallpaper = WShell.Exec(pshellCmd)
If Err.Number <> 0 Then
    WScript.Echo "Error executing PowerShell: " & Err.Description & vbCrLf & "Command: " & pshellCmd
    WScript.Quit
End If

wallpaperPath = Replace(wallpaper.StdOut.ReadAll(), vbCrLf, "")
If wallpaperPath = "" Then
    WScript.Echo "No wallpaper path returned"
    WScript.Quit
End If

' Launch Chrome with wallpaper parameter
chromeCmd = """C:\Program Files\Google\Chrome\Application\chrome.exe"" --kiosk --app=file:///" & _
           strPath & "/index.html?wallpaper=" & Replace(wallpaperPath, "\", "/")

WShell.Run chromeCmd, 0, False