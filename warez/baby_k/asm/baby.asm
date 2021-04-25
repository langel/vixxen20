	processor 6502

	org $1000


; 10 SYS 4109
	byte	$00,$0b,$10,$04,$00,$9e,$34,$31
	byte  $31,$30,$00,$00,$00,$00


; disable and acknowledge interrupts	
	lda #$7f
	sta $912e     
	sta $912d
	sta $911e 
	; no interrupts for sho!
	sei
	; no decimal mode!
	cld


; global variables

SONG_POS          EQU $00
PATTERN_POS       EQU $01
FRAME_COUNT       EQU $02
FRAME_LENGTH      EQU $03

FAST_COUNTER      EQU $fe
MEGA_COUNTER      EQU $ff

TEXT_TITLE        EQU $13b0
TEXT_ARTIST       EQU $13c0
TEXT_COPY         EQU $13d0
TABLE_SPEED       EQU $13e0
TABLE_VOLUME      EQU $13f0

SCREEN_CHR_RAM_1  EQU $1e00
SCREEN_CHR_RAM_2  EQU $1f00
SCREEN_COL_RAM_1  EQU $9600
SCREEN_COL_RAM_2  EQU $9700



; initialize play routine
	jsr RASTER_ZERO
	lda #$00
	sta SONG_POS
	sta PATTERN_POS
	sta FRAME_COUNT
	sta MEGA_COUNTER

; load first frame length
	lda TABLE_SPEED
	lda #$02
	sta FRAME_LENGTH

; set character set
	lda #%11110010
	sta $9005

; set bg and border colors
	lda #%01000111
	sta $900f

; clear screen
	ldx #$00
CLEAR_SCREEN:
	jsr RASTER_ZERO
	txa
	sta SCREEN_CHR_RAM_1,x
	sta SCREEN_CHR_RAM_2,x
	lda #5
	sta SCREEN_COL_RAM_1,x
	sta SCREEN_COL_RAM_2,x
	inx
	bne CLEAR_SCREEN

; draw meta data
	ldy #$00
DRAW_META_DATA:
	jsr RASTER_ZERO
	lda TEXT_TITLE,y
	sta SCREEN_CHR_RAM_1+25,y
	sta SCREEN_CHR_RAM_2+33,y
	lda #7
	sta SCREEN_COL_RAM_1+25,y
	sta SCREEN_COL_RAM_2+33,y
	lda TEXT_ARTIST,y
	sta SCREEN_CHR_RAM_1+47,y
	sta SCREEN_CHR_RAM_2+55,y
	lda #7
	sta SCREEN_COL_RAM_1+47,y
	sta SCREEN_COL_RAM_2+55,y
	lda TEXT_COPY,y
	sta SCREEN_CHR_RAM_1+69,y
	sta SCREEN_CHR_RAM_2+77,y
	lda #7
	sta SCREEN_COL_RAM_1+69,y
	sta SCREEN_COL_RAM_2+77,y
	iny
	cpy #$10
	bne DRAW_META_DATA

MAIN_LOOP:
	; wait for frame
	jsr RASTER_ZERO
	; junk
	inc FAST_COUNTER
	lda FAST_COUNTER
	sta SCREEN_CHR_RAM_1
	; ready for next music frame?
	inc FRAME_COUNT
	lda FRAME_COUNT
	sta SCREEN_CHR_RAM_1 + 2
	cmp FRAME_LENGTH
	bne MAIN_LOOP
	; update song stuff
	inc PATTERN_POS
	lda PATTERN_POS
	sta SCREEN_CHR_RAM_1 + 4
	cmp #$10
	bne .not_next_pattern
.next_pattern
	lda #$00
	sta PATTERN_POS
	inc SONG_POS
	lda SONG_POS
	sta SCREEN_CHR_RAM_1 + 6
.not_next_pattern
	; done
	inc MEGA_COUNTER
	lda MEGA_COUNTER
	sta SCREEN_CHR_RAM_1 + 8
	jmp MAIN_LOOP


; check if zero point raster beam is hit
RASTER_ZERO:
	clc
	lda $9004
	cmp #01
	bne RASTER_ZERO
	rts


; song data
; XXX don't understand how this works
; XXX should start at $13b0
	org $13b0
	incbin "songdata.bin"

