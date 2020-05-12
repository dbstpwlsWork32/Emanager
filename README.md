# Emanager

entertainment file and entertainment site search and manage

## FEATURE
---

#### USERDATA FOLDER PATH

`C:\Users\${userName}\AppData\Roaming\emanager`, `C:\Users\${userName}\AppData\Roaming\emanager_doc`

#### Program authority

1. file read

2. file write/delete only on `USERDATA FOLDER PATH`

3. No use any server

4. In program when click `Delete` on dir card, do delete only `database`, not delete real folder

### Image viewer

1. SHORT CUT

| HOT KEY | DO  | WHEN  |
| ---------------------|:---------------------:|:-------------------:|
| up - arrow            |  GO NEXT PICTURE FOLDER  | IMAGE VIEWER MODE  |
| down - arrow          |  PREV NEXT PICTURE FOLDER  | IMAGE VIEWER MODE  |

### Video viewer

1. Automatically watch subtitle file and convert to .vtt

2. Extensions other than mp4, ogg, and webm are not supported ( Convert file to ffmpeg is too heavy ), so not supported file is open external program


## Develope Lib & FrameWork
---

1. @vue/cli 3 + electron + vuex + vutify + typescript + nedb

2. ffmepg

## TODO
---

- [ ] E-FILE SEARCH AND ADD SUBJECT TAG

- [ ] E-SITE WEB CROLLING

## LAST-TODO
---

- [ ] VPN

- [ ] web torrent server
