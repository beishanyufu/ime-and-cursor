#Requires AutoHotkey v2.0

#SingleInstance Force

MsgBox("这是一个使用开源软件AutoHotkey制作的小工具，运行后会驻留在系统托盘中，可通过右键菜单关闭。`n功能：将【单击Shift键】操作转为【Shift+Space】（仅作用于VSCode窗口）。","IME and Cursor 助手 v1.1.0")

#HotIf WinActive("ahk_exe Code.exe")
; LShift::{
;     if (KeyWait("LShift","T0.3")) {
;         Send("+{Space}")
;     } else {
;         Send("{Shift down}")
;         KeyWait("Shift")
;         Send("{Shift up}")
;     }
; } 
~LShift::
~RShift::{
    key := LTrim(ThisHotkey,'~')
    if (KeyWait(key,"T0.5") && (A_PriorKey == key)) {        
        Send("{Shift}+{Space}")
    } 
} 
#HotIf