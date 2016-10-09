import time 
import fluidsynth

fs = fluidsynth.Synth() 
fs.start()

sfid = fs.sfload("goat.sf2") 
fs.program_select(0, sfid, 0, 0)

fs.noteon(0, 60, 100) 
fs.noteon(0, 67, 100) 
fs.noteon(0, 76, 100)

time.sleep(2.0)

fs.noteoff(0, 60) 
fs.noteoff(0, 67) 
fs.noteoff(0, 76)

time.sleep(1.0)

fs.delete()

ns-2033.awsdns-62.co.uk. 
ns-648.awsdns-17.net. 
ns-1343.awsdns-39.org. 
ns-119.awsdns-14.com.