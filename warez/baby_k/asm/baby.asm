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
SONG_NEXT_TRUE    EQU $04
SONG_END_TRUE     EQU $05

CH1_PATTERN_POS   EQU $20
CH2_PATTERN_POS   EQU $22
CH3_PATTERN_POS   EQU $24
CH4_PATTERN_POS   EQU $26

TEMP_GUY          EQU $f0
FAST_COUNTER      EQU $fe
MEGA_COUNTER      EQU $ff

TEXT_TITLE        EQU $13b0
TEXT_ARTIST       EQU $13c0
TEXT_COPY         EQU $13d0
TABLE_SPEED       EQU $13e0
TABLE_VOLUME      EQU $13f0
PATTERNS          EQU $1400
SONG_PAGE_1       EQU $1c00
SONG_PAGE_2       EQU $1d00

VIC_CHAN_1        EQU $900a
VIC_CHAN_2        EQU $900b
VIC_CHAN_3        EQU $900c
VIC_CHAN_4        EQU $900d
VIC_VOLUME        EQU $900e

SCREEN_CHR_RAM_1  EQU $1e00
SCREEN_CHR_RAM_2  EQU $1f00
SCREEN_COL_RAM_1  EQU $9600
SCREEN_COL_RAM_2  EQU $9700

NOTE_IS           EQU %10000000
NOTE_OFF          EQU %00000001
NOTE_NEXT         EQU %00000010
NOTE_END          EQU %00000011
NOTE_NOTHING      EQU %00000000



; initialize play routine
	jsr RASTER_ZERO
	lda #$00
	sta SONG_POS
	sta PATTERN_POS
	sta SONG_NEXT_TRUE
	sta SONG_END_TRUE
	sta FRAME_COUNT
	sta MEGA_COUNTER

; load first frame length
	lda #$01
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
	lda #$20
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
	sta SCREEN_CHR_RAM_1+91,y
	lda #7
	sta SCREEN_COL_RAM_1+91,y
	lda TEXT_ARTIST,y
	sta SCREEN_CHR_RAM_1+113,y
	lda #7
	sta SCREEN_COL_RAM_1+113,y
	lda TEXT_COPY,y
	sta SCREEN_CHR_RAM_1+135,y
	lda #7
	sta SCREEN_COL_RAM_1+135,y
	iny
	cpy #$10
	bne DRAW_META_DATA

MAIN_LOOP:
; set bg and border colors
	lda #%01000111
	sta $900f
	; wait for frame
	jsr RASTER_ZERO
; set bg and border colors
	lda #%11000011
	sta $900f
.main_loop_skip_raster
	; load them patterns
	; resets song position if empty pattern
	jsr SONG_POS_UPDATE
	; junk
	inc FAST_COUNTER
	lda FAST_COUNTER
	sta SCREEN_CHR_RAM_1
	; update song stuff
	jsr AUDIO_UPDATE
	; check if NeXT was called
	lda SONG_NEXT_TRUE
	cmp #$00
	beq .not_next_effect_called
	lda #$00
	sta PATTERN_POS
	sta SONG_NEXT_TRUE
	inc SONG_POS
	jsr SONG_POS_UPDATE
	jsr AUDIO_PROCESS_CHANNEL
	jmp .main_loop_skip_raster
.not_next_effect_called
	; ready for next music frame?
	inc FRAME_COUNT
	lda FRAME_COUNT
	sta SCREEN_CHR_RAM_1 + 2
	cmp FRAME_LENGTH
	bne MAIN_LOOP
	; reset frame counter
	lda #$00
	sta FRAME_COUNT
	; increase pattern position
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


; grab current playback data and push to VIC
AUDIO_UPDATE:
	ldy PATTERN_POS
	lda TABLE_SPEED,y
	sta FRAME_LENGTH
	lda TABLE_VOLUME,y
	sta VIC_VOLUME

	ldx #$00
	lda (CH1_PATTERN_POS),y
	jsr AUDIO_PROCESS_CHANNEL
	adc #$20
	sta SCREEN_CHR_RAM_2+55,y

	inx
	lda (CH2_PATTERN_POS),y
	jsr AUDIO_PROCESS_CHANNEL
	adc #$20
	sta SCREEN_CHR_RAM_2+77,y

	inx
	lda (CH3_PATTERN_POS),y
	jsr AUDIO_PROCESS_CHANNEL
	adc #$20
	sta SCREEN_CHR_RAM_2+99,y

	inx
	lda (CH4_PATTERN_POS),y
	jsr AUDIO_PROCESS_CHANNEL
	adc #$20
	sta SCREEN_CHR_RAM_2+121,y
	rts

AUDIO_PROCESS_CHANNEL:
	sta TEMP_GUY
	and #NOTE_IS
	cmp #NOTE_IS
	bne .not_note
.is_note
	lda TEMP_GUY
	sta VIC_CHAN_1,x
	rts
.not_note
	lda TEMP_GUY
	cmp #NOTE_OFF
	bne .not_note_off
	lda #$00
	sta VIC_CHAN_1,x
	rts
.not_note_off
	lda TEMP_GUY
	cmp #NOTE_NEXT
	bne .not_note_next
	; move song to next song row
	inc SONG_NEXT_TRUE
; XXX do what here?
	; will update correctly on next frame
	; if we move where this subroutine gets called
	lda #$00
	sta SCREEN_CHR_RAM_1+16
	rts
.not_note_next
	lda TEMP_GUY
	cmp #NOTE_END
	bne .not_end_of_song
	; turn the sound off cheaply :D/
	lda #$00
	sta VIC_VOLUME
	; soft reset the machine!
	; solution from https://www.c64-wiki.com/wiki/Reset_(Process)
	jmp $fd22
.not_end_of_song
	rts


; put pattern addresses in zero page
; SONG_POS should be set before calling
SONG_POS_UPDATE:
	ldx #$00
.song_pos_loop
	lda SONG_POS
	sec
	sbc #$40
	bpl .song_page_2
.song_page_1
	asl
	asl
	sta TEMP_GUY
	txa
	lsr
	clc
	adc TEMP_GUY
	tay
	lda SONG_PAGE_1,y
	jmp .pattern_found
.song_page_2
	asl
	asl
	tay
	lda SONG_PAGE_2,y
.pattern_found
	sta TEMP_GUY
	; lets make sure its not an empty pattern
	cmp #$ff
	bne .dont_reset
.song_reset
	lda #$00
	sta SONG_POS
	jmp SONG_POS_UPDATE
.dont_reset
	lda TEMP_GUY
	; LSB
	asl
	asl
	asl
	asl
	sta CH1_PATTERN_POS,x
	inx
	; MSB
	lda TEMP_GUY
	lsr
	lsr
	lsr
	lsr
	clc
	adc #$14
	sta CH1_PATTERN_POS,x
	inx
	cpx #$08
	bne .song_pos_loop
	rts


; check if zero point raster beam is hit
RASTER_ZERO:
	clc
	lda $9004
	;cmp #$01
	cmp #$10
	bne RASTER_ZERO
	rts


; song data
	org $13b0
	;incbin "songdata.bin"

